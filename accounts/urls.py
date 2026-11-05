# accounts/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RegisterView,
    LoginView,
    ProfileView,
    LogoutView,
    UserViewSet,
    UserStatsView,
    AdminUserSearchView,
    SavedViewViewSet,
    bulk_activate_users, bulk_deactivate_users,
    bulk_make_instructor, bulk_delete_users,
)
from .notifications_view import AdminNotificationsView, AdminActionQueueView

# ✅ ADD THESE OTP VIEWS:
from .otp_views import (
    SendOTPView,
    VerifyOTPView,
    SetNewPasswordView,
    RegisterStartView,
)

from rest_framework_simplejwt.views import TokenRefreshView

app_name = 'accounts'

# ===== Router =====
router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'saved-views', SavedViewViewSet, basename='saved-view')


urlpatterns = [
    # ===== Auth =====
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # ===== OTP / Phone verification & password reset =====
    path('register/start/', RegisterStartView.as_view(), name='register-start'),
    path('otp/send/', SendOTPView.as_view(), name='otp-send'),
    path('otp/verify/', VerifyOTPView.as_view(), name='otp-verify'),
    path('password-reset/set/', SetNewPasswordView.as_view(), name='password-reset-set'),

    # ===== User Management (Admin) =====
    path('', include(router.urls)),
    path('users/stats/', UserStatsView.as_view(), name='user-stats'),
    path('bulk/activate/', bulk_activate_users, name='bulk-users-activate'),
    path('bulk/deactivate/', bulk_deactivate_users, name='bulk-users-deactivate'),
    path('bulk/make-instructor/', bulk_make_instructor, name='bulk-users-instructor'),
    path('bulk/delete/', bulk_delete_users, name='bulk-users-delete'),

    # ===== Admin notifications =====
    path('admin/notifications/', AdminNotificationsView.as_view(), name='admin-notifications'),
    path('admin/search-users/', AdminUserSearchView.as_view(), name='admin-search-users'),
    path('admin/action-queue/', AdminActionQueueView.as_view(), name='admin-action-queue'),
]