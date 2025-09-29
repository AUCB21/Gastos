from django.contrib import admin
from django.urls import path, include
from api.views import *
from rest_framework_simplejwt.views import (TokenRefreshView)
from api.views import EmailOrUsernameTokenObtainPairView, login_attempt_analytics, login_attempt_manual_cleanup
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView



urlpatterns = [
    path('admin/', admin.site.urls),
    path("schema/", SpectacularAPIView.as_view(), name="schema"),
    path("swagger/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path('api/', include('api.urls')),
    path('api/user/register/', CreateUserView.as_view(), name='register'),
    # Custom view allowing login via username OR email
    path('api/token/', EmailOrUsernameTokenObtainPairView.as_view(), name='get_token'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='refresh_token'),
    path('api/login-attempts/analytics/', login_attempt_analytics, name='login_attempt_analytics'),
    path('api/login-attempts/manual-cleanup/', login_attempt_manual_cleanup, name='login_attempt_manual_cleanup'),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
]