from django.utils import timezone
from django.http import JsonResponse
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.authentication import JWTAuthentication
from datetime import timedelta

# LOGGING DISABLED FOR PRODUCTION
# import logging
# logger = logging.getLogger(__name__)


class AutoSessionManagementMiddleware:
    """
    Enhanced middleware that automatically manages sessions internally
    without exposing session management to users.
    
    Features:
    - Session timeout (1 hour)
    - Automatic session limits (max 3 per user)
    - Background cleanup
    - Token activity tracking
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.timeout_minutes = 60  # 1 hour timeout
        self.max_sessions_per_user = 3  # Limit concurrent sessions
        self.cleanup_counter = 0  # Counter for background cleanup
        
    def __call__(self, request):
        # Skip middleware for certain paths that don't require authentication
        skip_paths = [
            '/api/token/',
            '/api/token/refresh/',
            '/api/user/register/',
            '/admin/',
            '/swagger/',
            '/schema/',
            '/static/',
            '/media/',
        ]
        
        if any(request.path.startswith(path) for path in skip_paths):
            return self.get_response(request)
        
        jwt_auth = JWTAuthentication()
        
        try:
            raw_token = jwt_auth.get_raw_token(jwt_auth.get_header(request))
            if raw_token is None:
                return self.get_response(request)
            
            validated_token = jwt_auth.get_validated_token(raw_token)
            user = jwt_auth.get_user(validated_token)
            token_jti = validated_token.payload.get('jti')
            
            if not token_jti:
                return self.get_response(request)
            
            # 1. Check if token is expired
            if self._is_token_expired(token_jti, user, request):
                self._deactivate_token(token_jti, raw_token)
                return JsonResponse({
                    'success': False,
                    'error': 'Session expired due to inactivity',
                    'code': 'SESSION_TIMEOUT',
                    'timeout_minutes': self.timeout_minutes
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            # 2. Enforce session limits automatically
            self._enforce_session_limit(user, token_jti)
            
            # 3. Update activity
            self._update_token_activity(token_jti, user, request)
            
            # 4. Background cleanup periodically
            self._increment_cleanup_counter()
            if self._should_cleanup():
                self._background_cleanup()
                
        except (InvalidToken, TokenError):
            pass
        except Exception as e:
            # Silent error handling - no logging
            # logger.error(f"Error in AutoSessionManagementMiddleware: {str(e)}")
            pass
        
        response = self.get_response(request)
        return response
    
    def _is_token_expired(self, token_jti, user, request):
        """Check if the token has been inactive for more than the timeout duration."""
        from .models import TokenActivity
        
        try:
            token_activity = TokenActivity.objects.get(token_jti=token_jti, is_active=True)
            return token_activity.is_expired(self.timeout_minutes)
        except TokenActivity.DoesNotExist:
            # First time seeing this token, create new activity record
            self._create_token_activity(token_jti, user, request)
            return False
    
    def _create_token_activity(self, token_jti, user, request):
        """Create a new token activity record."""
        from .models import TokenActivity
        
        try:
            TokenActivity.objects.create(
                token_jti=token_jti,
                user=user,
                last_activity=timezone.now(),
                ip_address=self._get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', '')[:500]
            )
        except Exception as e:
            # Silent error handling - no logging
            # logger.error(f"Error creating token activity: {str(e)}")
            pass
    
    def _update_token_activity(self, token_jti, user, request):
        """Update the last activity timestamp for the token."""
        from .models import TokenActivity
        
        try:
            token_activity, created = TokenActivity.objects.get_or_create(
                token_jti=token_jti,
                defaults={
                    'user': user,
                    'last_activity': timezone.now(),
                    'ip_address': self._get_client_ip(request),
                    'user_agent': request.META.get('HTTP_USER_AGENT', '')[:500],
                    'is_active': True
                }
            )
            
            if not created:
                token_activity.update_activity(
                    ip_address=self._get_client_ip(request),
                    user_agent=request.META.get('HTTP_USER_AGENT', '')[:500]
                )
        except Exception as e:
            # Silent error handling - no logging
            # logger.error(f"Error updating token activity: {str(e)}")
            pass
    
    def _enforce_session_limit(self, user, current_token_jti):
        """Automatically limit concurrent sessions per user."""
        from .models import TokenActivity
        
        try:
            # Get all active sessions for this user
            active_sessions = TokenActivity.objects.filter(
                user=user,
                is_active=True
            ).order_by('-last_activity')
            
            # If user has too many sessions, deactivate the oldest ones
            if active_sessions.count() > self.max_sessions_per_user:
                # Keep the current session and the most recent ones
                sessions_to_keep = [current_token_jti]
                for session in active_sessions[:self.max_sessions_per_user - 1]:
                    if session.token_jti != current_token_jti:
                        sessions_to_keep.append(session.token_jti)
                
                # Deactivate older sessions
                deactivated_count = TokenActivity.objects.filter(
                    user=user,
                    is_active=True
                ).exclude(token_jti__in=sessions_to_keep).update(is_active=False)
                
                # Silent operation - no logging
                # if deactivated_count > 0:
                #     logger.info(f"Enforced session limit for user {user.username}: deactivated {deactivated_count} old sessions")
                
        except Exception as e:
            # Silent error handling - no logging
            # logger.error(f"Error enforcing session limit: {str(e)}")
            pass
    
    def _deactivate_token(self, token_jti, raw_token):
        """Mark token as inactive and blacklist it."""
        from .models import TokenActivity
        
        try:
            # Mark as inactive in our database
            TokenActivity.objects.filter(token_jti=token_jti).update(is_active=False)
            
            # Blacklist the token
            try:
                refresh_token = RefreshToken(raw_token)
                refresh_token.blacklist()
            except Exception as e:
                # Silent error handling - no logging
                # logger.warning(f"Could not blacklist token: {str(e)}")
                pass
                
        except Exception as e:
            # Silent error handling - no logging
            # logger.error(f"Error deactivating token: {str(e)}")
            pass
    
    def _increment_cleanup_counter(self):
        """Increment cleanup counter for background tasks."""
        self.cleanup_counter += 1
    
    def _should_cleanup(self):
        """Determine if we should run background cleanup (every 100 requests)."""
        return self.cleanup_counter % 100 == 0
    
    def _background_cleanup(self):
        """Run background cleanup of expired sessions."""
        from .models import TokenActivity
        
        try:
            # Cleanup sessions older than 24 hours
            cutoff_time = timezone.now() - timedelta(hours=24)
            deleted_count = TokenActivity.objects.filter(
                created_at__lt=cutoff_time
            ).delete()[0]
            
            # Silent operation - no logging
            # if deleted_count > 0:
            #     logger.info(f"Background cleanup: removed {deleted_count} old session records")
                
        except Exception as e:
            # Silent error handling - no logging
            # logger.error(f"Error in background cleanup: {str(e)}")
            pass
    
    def _get_client_ip(self, request):
        """Get the client's IP address from the request."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip