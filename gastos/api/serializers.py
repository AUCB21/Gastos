from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.exceptions import AuthenticationFailed
from django.utils.translation import gettext_lazy as _
from .models import *
from django.utils import timezone
from datetime import timedelta
from django.conf import settings
from .utils import check_attempts



class UserSerializer(serializers.ModelSerializer):
    """User creation serializer that also accepts email.

    Previously the API only accepted username & password. The frontend registration
    form collects an email, so we expose it here and ensure the password is hashed.
    """
    email = serializers.EmailField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': False}
        }

    def validate_email(self, value):
        if value:
            email_norm = value.strip().lower()
            if User.objects.filter(email__iexact=email_norm).exists():
                raise serializers.ValidationError('El email ya está registrado.')
            return email_norm
        return value

    def validate_password(self, value):
        # Basic strength rules (can be extended later)
        if len(value) < 8:
            raise serializers.ValidationError('La contraseña debe tener al menos 8 caracteres.')
        if value.isdigit() or value.isalpha():
            raise serializers.ValidationError('La contraseña debe incluir letras y números.')
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')
        email = validated_data.pop('email', '').strip().lower()
        user = User.objects.create_user(email=email, **validated_data)
        user.set_password(password)
        user.save()
        return user


class EmailOrUsernameTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom token serializer that lets users authenticate with either username OR email.

    The frontend sends a single field named "username" which may contain either a
    traditional username or an email address. We look up the user accordingly and
    then issue standard JWT pair tokens.
    """

    # We keep input field name consistent ("username") to avoid frontend changes.
    def validate(self, attrs):
        identifier = attrs.get(self.username_field)
        password = attrs.get('password')

        # Rate limiting parameters from settings (with safe defaults)
        rl = getattr(settings, 'AUTH_RATE_LIMIT', {})
        window_minutes = rl.get('WINDOW_MINUTES', 10)
        max_failures = rl.get('MAX_FAILURES', 5)
        block_minutes = rl.get('BLOCK_MINUTES', 15)

        now = timezone.now()
        window_start = now - timedelta(minutes=window_minutes)
        block_threshold = now - timedelta(minutes=block_minutes)

        # Request IP extraction (serializer context must include request)
        request = self.context.get('request') if hasattr(self, 'context') else None
        ip_address = None
        if request:
            # X-Forwarded-For handling for proxy deployment
            xff = request.META.get('HTTP_X_FORWARDED_FOR')
            if xff:
                ip_address = xff.split(',')[0].strip()
            else:
                ip_address = request.META.get('REMOTE_ADDR')

        # Count recent failures for this identifier (optionally could factor IP)
        recent_failures_qs = LoginAttempt.objects.filter(
            identifier__iexact=identifier,
            successful=False,
            created_at__gte=window_start
        )
        recent_failures = recent_failures_qs.count()

        # Check if user is currently blocked (too many failures & last failure within block window)
        if recent_failures >= max_failures:
            last_failure = recent_failures_qs.order_by('-created_at').first()
            if last_failure and last_failure.created_at >= block_threshold:
                raise AuthenticationFailed({
                    'message': _('Demasiados intentos fallidos. Intenta nuevamente más tarde.'),
                    'code': 'too_many_attempts',
                    'retry_after_minutes': block_minutes
                })

        if not identifier or not password:
            raise AuthenticationFailed(_('Debe proveer credenciales válidas.'), 'no_credentials')

        # Try username first (case-insensitive), then email.
        user_qs = User.objects.filter(username__iexact=identifier)
        if not user_qs.exists():
            user_qs = User.objects.filter(email__iexact=identifier)

        user = user_qs.first()

        if user is None:
            LoginAttempt.objects.create(identifier=identifier, ip_address=ip_address, successful=False)
            raise AuthenticationFailed({'message': _('Usuario o email no encontrado.'), 'code': 'user_not_found'})
        if not user.is_active:
            LoginAttempt.objects.create(identifier=identifier, user=user, ip_address=ip_address, successful=False)
            raise AuthenticationFailed({'message': _('Usuario inactivo.'), 'code': 'inactive_user'})
        if not user.check_password(password):
            attempt = LoginAttempt.objects.create(identifier=identifier, user=user, ip_address=ip_address, successful=False)
            # Remaining attempts before block
            remaining = max(0, max_failures - (recent_failures + 1))
            raise AuthenticationFailed({'message': _('Contraseña incorrecta.'), 'code': 'bad_password', 'remaining_attempts': remaining})

        # Set for parity with parent (some hooks rely on self.user)
        self.user = user
        refresh = RefreshToken.for_user(user)

        # Successful attempt
        success_attempt = LoginAttempt.objects.create(identifier=identifier, user=user, ip_address=ip_address, successful=True)

        # Opportunistic cleanup of stale attempts (older than retention window).
        # If cleanup performed (returns deleted count >=0), and we needed a new marker,
        # utils.check_attempts will create a maintenance row. To avoid extra rows when
        # cleanup actually happens, we can update this success attempt as the marker
        # if a cleanup was just executed without our knowledge (rare race) we leave it.
        try:
            deleted = check_attempts()
            if deleted > 0:
                # Mark this attempt as the cleanup marker (optional optimization)
                success_attempt.last_cleanup_at = timezone.now()
                success_attempt.save(update_fields=["last_cleanup_at"])
        except Exception:
            pass  # Never block login

        data = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
            }
        }
        return data

class MedioPagoSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedioPago
        fields = '__all__'
        
class GastoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Gasto
        fields = '__all__'
