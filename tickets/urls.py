# tickets/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TicketCategoryViewSet, TicketViewSet, TicketStatsView,
    bulk_change_ticket_status, bulk_change_ticket_priority,
    bulk_delete_tickets,
)

app_name = 'tickets'

router = DefaultRouter()
router.register(r'categories', TicketCategoryViewSet, basename='ticket-category')
router.register(r'tickets', TicketViewSet, basename='ticket')

urlpatterns = [
    path('', include(router.urls)),
    path('stats/', TicketStatsView.as_view(), name='ticket-stats'),

    # ===== Bulk =====
    path('bulk/status/', bulk_change_ticket_status, name='bulk-ticket-status'),
    path('bulk/priority/', bulk_change_ticket_priority, name='bulk-ticket-priority'),
    path('bulk/delete/', bulk_delete_tickets, name='bulk-ticket-delete'),
]