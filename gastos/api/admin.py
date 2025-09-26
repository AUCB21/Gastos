from django.contrib import admin
from .models import Gasto, MedioPago, TokenActivity, LoginAttempt, Grupo, GrupoMembership, GrupoInvitation, ExpenseSplit

# Register your models here.

@admin.register(MedioPago)
class MedioPagoAdmin(admin.ModelAdmin):
    list_display = ('id', 'ente_emisor', 'tipo', 'tipo_tarjeta', 'user', 'grupo')
    list_filter = ('tipo', 'tipo_tarjeta', 'user', 'grupo')
    search_fields = ('ente_emisor', 'tipo', 'extra', 'user__username', 'grupo__name')
    ordering = ('id',)
    
    fieldsets = (
        ('Información del Medio de Pago', {
            'fields': ('user', 'grupo', 'ente_emisor', 'tipo', 'tipo_tarjeta', 'extra')
        }),
    )

@admin.register(Gasto)
class GastoAdmin(admin.ModelAdmin):
    list_display = ('id', 'categoria', 'monto', 'moneda', 'vendedor', 'fecha_gasto', 'user', 'grupo', 'is_shared')
    list_filter = ('categoria', 'moneda', 'fecha_gasto', 'user', 'grupo', 'is_shared', 'split_type')
    search_fields = ('vendedor', 'comentarios', 'categoria', 'grupo__name')
    ordering = ('-fecha_gasto',)
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Información del Usuario y Grupo', {
            'fields': ('user', 'grupo')
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
        ('Configuración de Gasto Compartido', {
            'fields': ('is_shared', 'split_type', 'paid_by'),
            'classes': ('collapse',)
        }),
        ('Comentarios y Fechas', {
            'fields': ('comentarios', 'created_at', 'updated_at'),
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


@admin.register(Grupo)
class GrupoAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'grupo_type', 'owner', 'member_count', 'is_active', 'created_at')
    list_filter = ('grupo_type', 'is_active', 'default_currency', 'created_at')
    search_fields = ('name', 'description', 'owner__username')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('name', 'description', 'grupo_type', 'owner')
        }),
        ('Configuración', {
            'fields': ('default_currency', 'is_active', 'allow_new_members')
        }),
        ('Fechas', {
            'fields': ('start_date', 'end_date', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def member_count(self, obj):
        """Display number of active members."""
        return obj.get_member_count()
    member_count.short_description = 'Miembros'
    
    actions = ['deactivate_grupos', 'activate_grupos']
    
    def deactivate_grupos(self, request, queryset):
        """Admin action to deactivate selected grupos."""
        count = queryset.update(is_active=False)
        self.message_user(request, f'{count} grupos desactivados exitosamente.')
    deactivate_grupos.short_description = 'Desactivar grupos seleccionados'
    
    def activate_grupos(self, request, queryset):
        """Admin action to activate selected grupos."""
        count = queryset.update(is_active=True)
        self.message_user(request, f'{count} grupos activados exitosamente.')
    activate_grupos.short_description = 'Activar grupos seleccionados'


@admin.register(GrupoMembership)
class GrupoMembershipAdmin(admin.ModelAdmin):
    list_display = ('id', 'grupo', 'user', 'role', 'is_active', 'joined_at')
    list_filter = ('role', 'is_active', 'can_add_expenses', 'can_edit_expenses', 'joined_at')
    search_fields = ('grupo__name', 'user__username', 'user__email')
    ordering = ('-joined_at',)
    readonly_fields = ('joined_at', 'updated_at')
    
    fieldsets = (
        ('Membresía', {
            'fields': ('grupo', 'user', 'role', 'is_active')
        }),
        ('Permisos', {
            'fields': ('can_add_expenses', 'can_edit_expenses', 'can_manage_members')
        }),
        ('Fechas', {
            'fields': ('joined_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(GrupoInvitation)
class GrupoInvitationAdmin(admin.ModelAdmin):
    list_display = ('id', 'grupo', 'email', 'invited_by', 'status', 'created_at', 'expires_at')
    list_filter = ('status', 'role', 'created_at')
    search_fields = ('email', 'grupo__name', 'invited_by__username')
    ordering = ('-created_at',)
    readonly_fields = ('invitation_token', 'created_at', 'responded_at')
    
    fieldsets = (
        ('Invitación', {
            'fields': ('grupo', 'invited_by', 'email', 'status')
        }),
        ('Configuración de Rol', {
            'fields': ('role', 'can_add_expenses', 'can_edit_expenses', 'can_manage_members')
        }),
        ('Fechas y Token', {
            'fields': ('created_at', 'expires_at', 'responded_at', 'invitation_token'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['mark_as_expired', 'resend_invitations']
    
    def mark_as_expired(self, request, queryset):
        """Admin action to mark selected invitations as expired."""
        count = queryset.update(status='expired')
        self.message_user(request, f'{count} invitaciones marcadas como expiradas.')
    mark_as_expired.short_description = 'Marcar como expiradas'


@admin.register(ExpenseSplit)
class ExpenseSplitAdmin(admin.ModelAdmin):
    list_display = ('id', 'expense', 'user', 'amount', 'status', 'paid_amount', 'created_at')
    list_filter = ('status', 'expense__grupo', 'created_at')
    search_fields = ('user__username', 'expense__vendedor', 'notes')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('División del Gasto', {
            'fields': ('expense', 'user', 'amount', 'percentage', 'status')
        }),
        ('Información de Pago', {
            'fields': ('paid_amount', 'paid_date', 'paid_to')
        }),
        ('Notas y Fechas', {
            'fields': ('notes', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['mark_as_paid', 'mark_as_pending']
    
    def mark_as_paid(self, request, queryset):
        """Admin action to mark selected splits as paid."""
        from django.utils import timezone
        count = queryset.update(status='paid', paid_date=timezone.now())
        self.message_user(request, f'{count} splits marcados como pagados.')
    mark_as_paid.short_description = 'Marcar como pagados'
    
    def mark_as_pending(self, request, queryset):
        """Admin action to mark selected splits as pending."""
        count = queryset.update(status='pending', paid_date=None)
        self.message_user(request, f'{count} splits marcados como pendientes.')
    mark_as_pending.short_description = 'Marcar como pendientes'