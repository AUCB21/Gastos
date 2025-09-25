from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class Project(models.Model):
    """
    Model to represent a shared project/trip/group where multiple users can share expenses.
    """
    PROJECT_TYPES = (
        ('trip', 'Viaje'),
        ('project', 'Proyecto'),
        ('group', 'Grupo'),
        ('event', 'Evento'),
        ('shared', 'Gastos Compartidos'),
    )
    
    CURRENCY_CHOICES = (
        ('ARS', 'Peso Argentino'),
        ('USD', 'Dolar Americano'),
        ('EUR', 'Euro'),
        ('BRL', 'Real Brasileño'),
        ('CLP', 'Peso Chileno'),
    )
    
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=200, help_text="Nombre del proyecto/viaje/grupo")
    description = models.TextField(max_length=500, blank=True, help_text="Descripción del proyecto")
    project_type = models.CharField(max_length=20, choices=PROJECT_TYPES, default='shared')
    
    # Project settings
    default_currency = models.CharField(max_length=3, choices=CURRENCY_CHOICES, default='ARS')
    is_active = models.BooleanField(default=True)
    allow_new_members = models.BooleanField(default=True, help_text="Permitir que se agreguen nuevos miembros")
    
    # Membership management
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owned_projects')
    members = models.ManyToManyField(User, through='ProjectMembership', related_name='projects')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    start_date = models.DateField(null=True, blank=True, help_text="Fecha de inicio del proyecto")
    end_date = models.DateField(null=True, blank=True, help_text="Fecha de fin del proyecto")
    
    class Meta:
        db_table = 'api_project'
        ordering = ['-updated_at', '-created_at']
        indexes = [
            models.Index(fields=['owner']),
            models.Index(fields=['is_active']),
            models.Index(fields=['project_type']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.get_project_type_display()})"
    
    def get_total_expenses(self):
        """Get total amount of all expenses in this project"""
        return self.gastos.aggregate(total=models.Sum('monto'))['total'] or 0
    
    def get_member_count(self):
        """Get number of active members"""
        return self.members.filter(projectmembership__is_active=True).count()
    
    def is_member(self, user):
        """Check if user is an active member of this project"""
        return self.members.filter(id=user.id, projectmembership__is_active=True).exists()
    
    def can_add_expense(self, user):
        """Check if user can add expenses to this project"""
        return self.is_member(user) and self.is_active


class ProjectMembership(models.Model):
    """
    Through model for Project-User relationship with additional membership info.
    """
    ROLE_CHOICES = (
        ('owner', 'Propietario'),
        ('admin', 'Administrador'),
        ('member', 'Miembro'),
        ('viewer', 'Solo Vista'),
    )
    
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='member')
    is_active = models.BooleanField(default=True)
    can_add_expenses = models.BooleanField(default=True)
    can_edit_expenses = models.BooleanField(default=False)
    can_manage_members = models.BooleanField(default=False)
    
    # Timestamps
    joined_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'api_project_membership'
        unique_together = ('project', 'user')
        indexes = [
            models.Index(fields=['project', 'is_active']),
            models.Index(fields=['user', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.project.name} ({self.role})"



class MedioPago(models.Model):
    id: int = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='medios_pago', default=1)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='medios_pago', null=True, blank=True, help_text="Proyecto asociado (opcional)")
    ente_emisor: str = models.CharField(max_length=100)
    tipo: str = models.CharField(max_length=8)
    tipo_tarjeta: str = models.CharField(max_length=16, blank=True)
    extra: str = models.CharField(max_length=64, blank=True)

    class Meta:
        db_table = 'api_medio_pago'
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['project']),
        ]

    def __str__(self):
        project_info = f" - {self.project.name}" if self.project else ""
        return f"Medio de Pago {self.id} - {self.ente_emisor} - {self.tipo}{project_info}"

class Gasto(models.Model):
    CATEGORIAS_CHOICES = (
        ('finanzas', 'Finanzas'),
        ('salud', 'Salud'),
        ('transporte', 'Transporte'),
        ('comida', 'Comida'),
        ('indumentaria', 'Indumentaria'),
        ('tecnologia', 'Tecnologia'),
        ('inversiones', 'Inversiones'),
        ('alojamiento', 'Alojamiento'),
        ('entretenimiento', 'Entretenimiento'),
        ('otros', 'Otros'),
    )

    MONEDAS_CHOICES = (
        ('ARS', 'Peso Argentino'),
        ('USD', 'Dolar Americano'),
        ('EUR', 'Euro'),
        ('BRL', 'Real Brasileño'),
        ('CLP', 'Peso Chileno'),
        ('NA', 'Otros'),
    )

    SPLIT_TYPES = (
        ('equal', 'División Igual'),
        ('percentage', 'Por Porcentaje'),
        ('amount', 'Por Monto Fijo'),
        ('custom', 'Personalizado'),
    )

    id: int = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='gastos', default=1, help_text="Usuario que registró el gasto")
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='gastos', null=True, blank=True, help_text="Proyecto asociado")
    
    # Basic expense info
    monto: float = models.FloatField()
    moneda: str = models.CharField(max_length=3, choices=MONEDAS_CHOICES, default='ARS')
    pagos_realizados: int = models.IntegerField()
    pagos_totales: int = models.IntegerField()
    medio_pago: int = models.ForeignKey(MedioPago, on_delete=models.CASCADE)
    vendedor: str = models.CharField(max_length=128)
    categoria: str = models.CharField(max_length=24, choices=CATEGORIAS_CHOICES, default='otros')
    comentarios: str = models.TextField(max_length=256, blank=True)
    fecha_gasto = models.DateField()
    
    # Shared expense settings
    is_shared = models.BooleanField(default=False, help_text="Si es un gasto compartido entre miembros del proyecto")
    split_type = models.CharField(max_length=15, choices=SPLIT_TYPES, default='equal', help_text="Tipo de división del gasto")
    paid_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='gastos_pagados', null=True, blank=True, help_text="Quien pagó realmente el gasto")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'api_gasto'
        ordering = ['-fecha_gasto', '-created_at']
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['project']),
            models.Index(fields=['fecha_gasto']),
            models.Index(fields=['categoria']),
            models.Index(fields=['is_shared']),
        ]

    def __str__(self):
        project_info = f" - {self.project.name}" if self.project else ""
        shared_info = " (Compartido)" if self.is_shared else ""
        return f"Gasto {self.id} - {self.categoria} - {self.monto} {self.moneda}{project_info}{shared_info}"
    
    def get_total_amount(self):
        """Get total amount including all installments"""
        return self.monto * self.pagos_totales
    
    def get_remaining_amount(self):
        """Get remaining amount to be paid"""
        return self.monto * (self.pagos_totales - self.pagos_realizados)
    
    def get_splits(self):
        """Get all expense splits for this shared expense"""
        if self.is_shared:
            return self.expense_splits.all()
        return []


class ExpenseSplit(models.Model):
    """
    Model to handle how shared expenses are split among project members.
    """
    SPLIT_STATUS = (
        ('pending', 'Pendiente'),
        ('paid', 'Pagado'),
        ('confirmed', 'Confirmado'),
        ('disputed', 'Disputado'),
    )
    
    expense = models.ForeignKey(Gasto, on_delete=models.CASCADE, related_name='expense_splits')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='expense_splits', help_text="Usuario que debe pagar esta parte")
    amount = models.FloatField(help_text="Monto que debe pagar este usuario")
    percentage = models.FloatField(null=True, blank=True, help_text="Porcentaje del total (si aplica)")
    status = models.CharField(max_length=10, choices=SPLIT_STATUS, default='pending')
    
    # Payment tracking
    paid_amount = models.FloatField(default=0, help_text="Monto ya pagado por este usuario")
    paid_date = models.DateTimeField(null=True, blank=True, help_text="Fecha de pago")
    paid_to = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_payments', null=True, blank=True, help_text="A quién se le pagó")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Notes
    notes = models.TextField(max_length=200, blank=True, help_text="Notas sobre este split")
    
    class Meta:
        db_table = 'api_expense_split'
        unique_together = ('expense', 'user')
        indexes = [
            models.Index(fields=['expense']),
            models.Index(fields=['user']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.user.username} debe {self.amount} {self.expense.moneda} de {self.expense}"
    
    def get_remaining_amount(self):
        """Get remaining amount to be paid by this user"""
        return self.amount - self.paid_amount
    
    def is_fully_paid(self):
        """Check if this split is fully paid"""
        return self.paid_amount >= self.amount
    
    def mark_as_paid(self, paid_to_user=None, notes=None):
        """Mark this split as fully paid"""
        self.paid_amount = self.amount
        self.status = 'paid'
        self.paid_date = timezone.now()
        self.paid_to = paid_to_user
        if notes:
            self.notes = notes
        self.save()


class ProjectInvitation(models.Model):
    """
    Model to handle project invitations sent to users.
    """
    INVITATION_STATUS = (
        ('pending', 'Pendiente'),
        ('accepted', 'Aceptada'),
        ('declined', 'Rechazada'),
        ('expired', 'Expirada'),
    )
    
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='invitations')
    invited_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_invitations')
    invited_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_invitations', null=True, blank=True)
    email = models.EmailField(help_text="Email del usuario invitado")
    role = models.CharField(max_length=10, choices=ProjectMembership.ROLE_CHOICES, default='member')
    status = models.CharField(max_length=10, choices=INVITATION_STATUS, default='pending')
    
    # Settings for the invited user
    can_add_expenses = models.BooleanField(default=True)
    can_edit_expenses = models.BooleanField(default=False)
    can_manage_members = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(help_text="Fecha de expiración de la invitación")
    responded_at = models.DateTimeField(null=True, blank=True)
    
    # Invitation token for security
    invitation_token = models.CharField(max_length=100, unique=True, help_text="Token único para la invitación")
    
    class Meta:
        db_table = 'api_project_invitation'
        unique_together = ('project', 'email')
        indexes = [
            models.Index(fields=['project']),
            models.Index(fields=['invited_user']),
            models.Index(fields=['status']),
            models.Index(fields=['invitation_token']),
        ]
    
    def __str__(self):
        return f"Invitación a {self.email} para {self.project.name} ({self.status})"
    
    def is_expired(self):
        """Check if invitation has expired"""
        return timezone.now() > self.expires_at
    
    def can_accept(self):
        """Check if invitation can still be accepted"""
        return self.status == 'pending' and not self.is_expired()

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