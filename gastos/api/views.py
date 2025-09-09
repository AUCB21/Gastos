from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from .models import Gasto, MedioPago
from .serializers import GastoSerializer, MedioPagoSerializer, UserSerializer
import requests

URL_DOLARAPI = 'https://dolarapi.com/v1/dolares'



class CreateUserView(generics.CreateAPIView):
    """
    API endpoint - Crea un nuevo usuario
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class GastoListCreate(generics.ListCreateAPIView):
    """
    API endpoint - Lista y crea gastos
    """
    serializer_class = GastoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Pendiente: Implementar filtrados multiples (usuario, fecha, medio de pago, etc.)
        return Gasto.objects.all()
    
    def perform_create(self, serializer):
        # Validation is automatically handled by DRF before this method is called
        serializer.save()

class GastoDetail(generics.RetrieveUpdateDestroyAPIView):
    """
    API endpoint - Obtiene, actualiza o elimina un gasto específico
    """
    queryset = Gasto.objects.all()
    serializer_class = GastoSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

class MedioPagoListCreate(generics.ListCreateAPIView):
    """
    API endpoint - Lista y crea medios de pago
    """
    queryset = MedioPago.objects.all()
    serializer_class = MedioPagoSerializer
    permission_classes = [IsAuthenticated]

class MedioPagoDetail(generics.RetrieveUpdateDestroyAPIView):
    """
    API endpoint - Obtiene, actualiza o elimina un medio de pago específico
    """
    queryset = MedioPago.objects.all()
    serializer_class = MedioPagoSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'


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