from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import permissions

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # Apps APIs
    path('api/accounts/', include('accounts.urls')),
    path('api/packages/', include('packages.urls')),
    path('api/payments/', include('payments.urls')),
    path('api/tickets/', include('tickets.urls')),
    path('api/audit/', include('audit.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)