from rest_framework.decorators import api_view, permission_classes
from django.conf import settings
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth.models import User
from .models import Gasto, MedioPago, LoginAttempt
from .utils import check_attempts
from .serializers import (
    GastoSerializer,
    MedioPagoSerializer,
    UserSerializer,
    EmailOrUsernameTokenObtainPairSerializer,
)
import requests

URL_DOLARAPI = 'https://dolarapi.com/v1/dolares'



class CreateUserView(generics.CreateAPIView):
    """git 
    API endpoint - Crea un nuevo usuarios
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


class EmailOrUsernameTokenObtainPairView(TokenObtainPairView):
    """JWT obtain pair view supporting username OR email authentication."""
    serializer_class = EmailOrUsernameTokenObtainPairSerializer
    permission_classes = [AllowAny]

@api_view(['GET'])
def get_current_user(request):
    """
    API endpoint - Obtiene los datos del usuario autenticado
    """
    user = request.user
    user_data = {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'date_joined': user.date_joined,
    }
    return Response(user_data, status=status.HTTP_200_OK)

class GastoListCreate(generics.ListCreateAPIView):
    """
    API endpoint - Lista y crea gastos
    """
    serializer_class = GastoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Return only gastos for the authenticated user
        return Gasto.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        # Automatically set the user to the authenticated user
        serializer.save(user=self.request.user)

class GastoDetail(generics.RetrieveUpdateDestroyAPIView):
    """
    API endpoint - Obtiene, actualiza o elimina un gasto específico
    """
    serializer_class = GastoSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        # Return only gastos for the authenticated user
        return Gasto.objects.filter(user=self.request.user)

class MedioPagoListCreate(generics.ListCreateAPIView):
    """
    API endpoint - Lista y crea medios de pago
    """
    serializer_class = MedioPagoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Return only medios de pago for the authenticated user
        return MedioPago.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        # Automatically set the user to the authenticated user
        serializer.save(user=self.request.user)

class MedioPagoDetail(generics.RetrieveUpdateDestroyAPIView):
    """
    API endpoint - Obtiene, actualiza o elimina un medio de pago específico
    """
    serializer_class = MedioPagoSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        # Return only medios de pago for the authenticated user
        return MedioPago.objects.filter(user=self.request.user)


@api_view(['GET'])
def get_cotizacion(request):
    """
    API endpoint - Trae cotizacion de todas las casas
    """
    url = URL_DOLARAPI
    try:
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            return Response({
                'success': True,
                'data': data
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'success': False,
                'error': 'Bad Gateway'
            }, status=status.HTTP_502_BAD_GATEWAY)
    except requests.RequestException as e:
        return Response({
            'success': False,
            'error': f'{str(e)}'
        }, status=status.HTTP_503_SERVICE_UNAVAILABLE)


@api_view(['POST'])
def logout_view(request):
    """
    API endpoint - Logout user by blacklisting the refresh token
    """
    try:
        refresh_token = request.data.get("refresh")
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({
                'success': True,
                'message': 'Successfully logged out'
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'success': False,
                'error': 'Refresh token required'
            }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def login_attempt_analytics(request):
    """Return aggregated analytics for recent login attempts.

    Provides counts of failures, top failing identifiers, and distribution by IP.
    """
    from django.utils import timezone
    from datetime import timedelta
    window_hours = int(request.query_params.get('hours', 24))
    cutoff = timezone.now() - timedelta(hours=window_hours)

    qs = LoginAttempt.objects.filter(created_at__gte=cutoff)
    total = qs.count()
    failures = qs.filter(successful=False).count()
    successes = total - failures

    # Top 5 identifiers with most failures
    from django.db.models import Count
    top_identifiers = list(
        qs.filter(successful=False)
          .values('identifier')
          .annotate(fails=Count('id'))
          .order_by('-fails')[:5]
    )

    top_ips = list(
        qs.filter(successful=False)
          .values('ip_address')
          .annotate(fails=Count('id'))
          .order_by('-fails')[:5]
    )

    # Fetch last cleanup marker if any
    last_cleanup = LoginAttempt.objects.filter(last_cleanup_at__isnull=False).order_by('-last_cleanup_at').values_list('last_cleanup_at', flat=True).first()

    return Response({
        'window_hours': window_hours,
        'total_attempts': total,
        'failures': failures,
        'successes': successes,
        'failure_rate': (failures / total) if total else 0,
        'top_identifiers': top_identifiers,
        'top_ips': top_ips,
        'last_cleanup_at': last_cleanup,
    })


@api_view(['POST'])
@permission_classes([IsAdminUser])
def login_attempt_manual_cleanup(request):
    """Admin endpoint to force a cleanup irrespective of 24h interval.

    It bypasses the interval logic by directly deleting old attempts and stamping a marker.
    """
    from django.utils import timezone
    from datetime import timedelta

    rl = getattr(settings, 'AUTH_RATE_LIMIT', {})
    retention_days = rl.get('RETENTION_DAYS', 30)
    cutoff = timezone.now() - timedelta(days=retention_days)

    # Direct delete (not using check_attempts to bypass interval)
    deleted, _ = LoginAttempt.objects.filter(created_at__lt=cutoff).delete()
    # Create a marker row
    marker = LoginAttempt.objects.create(identifier='__manual_cleanup__', successful=True, last_cleanup_at=timezone.now())

    return Response({'deleted': deleted, 'last_cleanup_at': marker.last_cleanup_at}, status=status.HTTP_200_OK)