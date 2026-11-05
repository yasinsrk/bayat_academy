# audit/urls.py
from django.urls import path
from .views import AuditLogListView, AuditStatsView, AuditModelChoicesView

app_name = 'audit'

urlpatterns = [
    path('logs/', AuditLogListView.as_view(), name='audit-logs'),
    path('stats/', AuditStatsView.as_view(), name='audit-stats'),
    path('models/', AuditModelChoicesView.as_view(), name='audit-models'),
]