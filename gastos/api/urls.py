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
]