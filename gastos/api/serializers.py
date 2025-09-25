from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.exceptions import AuthenticationFailed
from django.utils.translation import gettext_lazy as _
from .models import *
from django.utils import timezone
from datetime import timedelta



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

        # Rate limiting parameters
        window_minutes = 10
        max_failures = 5
        block_minutes = 15

        now = timezone.now()
        window_start = now - timedelta(minutes=window_minutes)
        block_threshold = now - timedelta(minutes=block_minutes)

        # Count recent failures for this identifier
        recent_failures = LoginAttempt.objects.filter(
            identifier__iexact=identifier,
            successful=False,
            created_at__gte=window_start
        ).count()

        # Check if user is currently blocked (too many failures & last failure within block window)
        if recent_failures >= max_failures:
            last_failure = LoginAttempt.objects.filter(
                identifier__iexact=identifier,
                successful=False
            ).order_by('-created_at').first()
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
            LoginAttempt.objects.create(identifier=identifier, successful=False)
            raise AuthenticationFailed({'message': _('Usuario o email no encontrado.'), 'code': 'user_not_found'})
        if not user.is_active:
            LoginAttempt.objects.create(identifier=identifier, user=user, successful=False)
            raise AuthenticationFailed({'message': _('Usuario inactivo.'), 'code': 'inactive_user'})
        if not user.check_password(password):
            LoginAttempt.objects.create(identifier=identifier, user=user, successful=False)
            raise AuthenticationFailed({'message': _('Contraseña incorrecta.'), 'code': 'bad_password'})

        # Set for parity with parent (some hooks rely on self.user)
        self.user = user
        refresh = RefreshToken.for_user(user)

        # Successful attempt
        LoginAttempt.objects.create(identifier=identifier, user=user, successful=True)

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
