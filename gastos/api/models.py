from django.db import models
from django.contrib.auth.models import User



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
        ('tecnologia', 'Tecnología'),
        ('inversiones', 'Inversiones'),
        ('otros', 'Otros'),
    )

    MONEDAS_CHOICES = (
        ('ARS', 'Peso Argentino'),
        ('USD', 'Dólar Americano'),
        ('RS', 'Real Brasileño'),
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