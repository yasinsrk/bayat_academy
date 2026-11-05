# payments/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import initiate_payment, verify_payment, PaymentStatsView, PaymentViewSet, bulk_delete_payments, bulk_update_payment_status

app_name = 'payments'

router = DefaultRouter()
router.register(r'payments', PaymentViewSet, basename='payment')

urlpatterns = [
    path('', include(router.urls)),
    path('initiate/', initiate_payment, name='initiate-payment'),
    path('verify/', verify_payment, name='verify-payment'),
    path('stats/', PaymentStatsView.as_view(), name='payment-stats'),
    path('bulk/status/', bulk_update_payment_status, name='bulk-payment-status'),
    path('bulk/delete/', bulk_delete_payments, name='bulk-payment-delete'),
]