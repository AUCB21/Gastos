from django.contrib import admin
from .models import Gasto, MedioPago

# Register your models here.

@admin.register(MedioPago)
class MedioPagoAdmin(admin.ModelAdmin):
    list_display = ('id', 'ente_emisor', 'tipo', 'extra', 'user')
    list_filter = ('tipo', 'user')
    search_fields = ('ente_emisor', 'tipo', 'extra')
    ordering = ('id',)
    
    fieldsets = (
        ('Información del Medio de Pago', {
            'fields': ('user', 'ente_emisor', 'tipo', 'extra')
        }),
    )

@admin.register(Gasto)
class GastoAdmin(admin.ModelAdmin):
    list_display = ('id', 'categoria', 'monto', 'moneda', 'vendedor', 'fecha_gasto', 'user')
    list_filter = ('categoria', 'moneda', 'fecha_gasto', 'user')
    search_fields = ('vendedor', 'comentarios', 'categoria')
    ordering = ('-fecha_gasto',)
    
    fieldsets = (
        ('Información del Usuario', {
            'fields': ('user',)
        }),
        ('Detalles del Gasto', {
            'fields': ('categoria', 'monto', 'moneda', 'vendedor', 'fecha_gasto')
        }),
        ('Medio de Pago', {
            'fields': ('medio_pago',)
        }),
        ('Pagos', {
            'fields': ('pagos_realizados', 'pagos_totales')
        }),
        ('Comentarios', {
            'fields': ('comentarios',),
            'classes': ('collapse',)
        }),
    )
