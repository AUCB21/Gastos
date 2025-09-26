from django.urls import path, include
from . import views

urlpatterns = [
    # Authentication
    path('logout/', views.logout_view, name='logout'),
    
    # User data
    path('user/', views.get_current_user, name='current_user'),
    
    # Currency exchange rates
    path('cotizacion/', views.get_cotizacion, name='cotizacion'),
    
    # Payment methods (Class-based views)
    path('medios-pago/', views.MedioPagoListCreate.as_view(), name='medios_pago_list_create'),
    path('medios-pago/<int:id>/', views.MedioPagoDetail.as_view(), name='medios_pago_detail'),
    
    # Expenses (Gastos) - Class-based views
    path('gastos/', views.GastoListCreate.as_view(), name='gastos_list_create'),
    path('gastos/<int:id>/', views.GastoDetail.as_view(), name='gastos_detail'),

    # Grupos - Class-based views
    path('grupos/', views.GrupoListCreate.as_view(), name='grupos_list_create'),
    path('grupos/<int:id>/', views.GrupoDetail.as_view(), name='grupos_detail'),
    
    # Grupo Memberships
    path('grupo-memberships/', views.GrupoMembershipListCreate.as_view(), name='grupo_memberships_list_create'),
    path('grupo-memberships/<int:id>/', views.GrupoMembershipDetail.as_view(), name='grupo_memberships_detail'),
    
    # Grupo Invitations  
    path('grupo-invitations/', views.GrupoInvitationListCreate.as_view(), name='grupo_invitations_list_create'),
    
    # Expense Splits
    path('expense-splits/', views.ExpenseSplitListCreate.as_view(), name='expense_splits_list_create'),
    
    # Admin endpoints
    path('admin/login-attempts/analytics/', views.login_attempt_analytics, name='login_attempt_analytics'),
    path('admin/login-attempts/cleanup/', views.login_attempt_manual_cleanup, name='login_attempt_manual_cleanup'),
]