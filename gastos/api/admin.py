from django.contrib import admin
from .models import Gasto, MedioPago, TokenActivity, LoginAttempt

# Register your models here.

@admin.register(MedioPago)
class MedioPagoAdmin(admin.ModelAdmin):
    list_display = ('id', 'ente_emisor', 'tipo', 'extra', 'user')
    list_filter = ('tipo', 'user')
    search_fields = ('ente_emisor', 'tipo', 'extra')
    ordering = ('id',)
    
    fieldsets = (
        ('InformaciÃ³n del Medio de Pago', {
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
        ('InformaciÃ³n del Usuario', {
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

@admin.register(TokenActivity)
class TokenActivityAdmin(admin.ModelAdmin):
    list_display = ('token_jti_short', 'user', 'last_activity', 'is_active', 'ip_address', 'created_at')
    list_filter = ('is_active', 'created_at', 'last_activity')
    search_fields = ('token_jti', 'user__username', 'ip_address')
    ordering = ('-last_activity',)
    readonly_fields = ('token_jti', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Token Information', {
            'fields': ('token_jti', 'user', 'is_active')
        }),
        ('Activity Tracking', {
            'fields': ('last_activity', 'created_at', 'updated_at')
        }),
        ('Client Information', {
            'fields': ('ip_address', 'user_agent'),
            'classes': ('collapse',)
        }),
    )
    
    def token_jti_short(self, obj):
        """Display a shortened version of the token JTI for better readability."""
        return f"{obj.token_jti[:8]}...{obj.token_jti[-4:]}" if len(obj.token_jti) > 12 else obj.token_jti
    token_jti_short.short_description = 'Token ID'
    
    actions = ['deactivate_tokens', 'activate_tokens', 'cleanup_old_tokens']
    
    def deactivate_tokens(self, request, queryset):
        """Admin action to deactivate selected tokens."""
        count = queryset.update(is_active=False)
        self.message_user(request, f'{count} tokens deactivated successfully.')
    deactivate_tokens.short_description = 'Deactivate selected tokens'
    
    def activate_tokens(self, request, queryset):
        """Admin action to activate selected tokens."""
        count = queryset.update(is_active=True)
        self.message_user(request, f'{count} tokens activated successfully.')
    activate_tokens.short_description = 'Activate selected tokens'
    
    def cleanup_old_tokens(self, request, queryset):
        """Admin action to cleanup tokens older than 24 hours."""
        from django.utils import timezone
        from datetime import timedelta
        
        cutoff_time = timezone.now() - timedelta(hours=24)
        count = TokenActivity.objects.filter(created_at__lt=cutoff_time).delete()[0]
        self.message_user(request, f'{count} old token records cleaned up.')
    cleanup_old_tokens.short_description = 'Cleanup tokens older than 24 hours'


@admin.register(LoginAttempt)
class LoginAttemptAdmin(admin.ModelAdmin):
    list_display = ('identifier', 'ip_address', 'user', 'successful', 'created_at', 'last_cleanup_at')
    list_filter = ('successful', 'ip_address', 'identifier')
    search_fields = ('identifier', 'ip_address', 'user__username', 'user__email')
    readonly_fields = ('identifier', 'ip_address', 'user', 'successful', 'created_at', 'last_cleanup_at')
    ordering = ('-created_at',)
    actions = ['manual_cleanup_old_attempts']

    def manual_cleanup_old_attempts(self, request, queryset):
        from .utils import check_attempts
        deleted = check_attempts()
        if deleted:
            self.message_user(request, f"Eliminados {deleted} intentos antiguos.")
        else:
            self.message_user(request, "No se eliminaron intentos (posiblemente ejecutado en las últimas 24hs).")
    manual_cleanup_old_attempts.short_description = 'Ejecutar limpieza de intentos antiguos'