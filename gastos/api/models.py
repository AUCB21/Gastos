from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone



class MedioPago(models.Model):
    id: int = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='medios_pago', default=1)
    ente_emisor: str = models.CharField(max_length=100)
    tipo: str = models.CharField(max_length=8)
    extra: str = models.CharField(max_length=64, blank=True)

    def __str__(self):
        return f"Medio de Pago {self.id} - {self.ente_emisor} - {self.tipo}"

class Gasto(models.Model):
    CATEGORIAS_CHOICES = (
        ('finanzas', 'Finanzas'),
        ('salud', 'Salud'),
        ('transporte', 'Transporte'),
        ('comida', 'Comida'),
        ('indumentaria', 'Indumentaria'),
        ('tecnologia', 'TecnologÃ­a'),
        ('inversiones', 'Inversiones'),
        ('otros', 'Otros'),
    )

    MONEDAS_CHOICES = (
        ('ARS', 'Peso Argentino'),
        ('USD', 'DÃ³lar Americano'),
        ('RS', 'Real BrasileÃ±o'),
        ('CLP', 'Peso Chileno'),
        ('NA', 'Otros'),
    )

    id: int = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='gastos', default=1)
    monto: float = models.FloatField()
    moneda: str = models.CharField(max_length=3, choices=MONEDAS_CHOICES, default='ARS')
    pagos_realizados: int = models.IntegerField()
    pagos_totales: int = models.IntegerField()
    medio_pago: int = models.ForeignKey(MedioPago, on_delete=models.CASCADE)
    vendedor: str = models.CharField(max_length=128)
    categoria: str = models.CharField(max_length=24, choices=CATEGORIAS_CHOICES, default='otros')
    comentarios: str = models.TextField(max_length=256, blank=True)
    fecha_gasto = models.DateField()

    def __str__(self):
        return f"Gasto {self.id} - {self.categoria} - {self.monto} {self.moneda}"

class TokenActivity(models.Model):
    """
    Model to track JWT token activity for session timeout management.
    """
    token_jti = models.CharField(max_length=255, unique=True, db_index=True, help_text="JWT Token ID (jti claim)")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='token_activities')
    last_activity = models.DateTimeField(default=timezone.now, help_text="Last activity timestamp")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True, help_text="Whether this token is still active")
    user_agent = models.TextField(blank=True, help_text="User agent string for tracking different devices")
    ip_address = models.GenericIPAddressField(null=True, blank=True, help_text="IP address of the client")

    class Meta:
        db_table = 'api_token_activity'
        indexes = [
            models.Index(fields=['token_jti']),
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['last_activity']),
        ]
        ordering = ['-last_activity']

    def __str__(self):
        return f"Token {self.token_jti[:8]}... - User: {self.user.username} - Last: {self.last_activity}"

    def is_expired(self, timeout_minutes=60):
        """
        Check if this token activity is expired based on the timeout.
        """
        from datetime import timedelta
        timeout_delta = timedelta(minutes=timeout_minutes)
        return timezone.now() - self.last_activity > timeout_delta

    def update_activity(self, ip_address=None, user_agent=None):
        """
        Update the last activity timestamp and related info.
        """
        self.last_activity = timezone.now()
        if ip_address:
            self.ip_address = ip_address
        if user_agent:
            self.user_agent = user_agent
        self.save(update_fields=['last_activity', 'updated_at', 'ip_address', 'user_agent'])

    @classmethod
    def cleanup_expired_tokens(cls, timeout_minutes=60):
        """
        Clean up expired token activities.
        This can be called periodically via a management command or celery task.
        """
        from datetime import timedelta
        timeout_delta = timedelta(minutes=timeout_minutes)
        cutoff_time = timezone.now() - timeout_delta
        
        expired_count = cls.objects.filter(
            last_activity__lt=cutoff_time,
            is_active=True
        ).update(is_active=False)
        
        return expired_count

    @classmethod
    def get_active_sessions_for_user(cls, user):
        """
        Get all active sessions for a user.
        """
        return cls.objects.filter(user=user, is_active=True).order_by('-last_activity')