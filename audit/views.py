# audit/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.db.models import Q
from django.utils import timezone
from datetime import timedelta
from .models import AuditLog


class AuditLogListView(APIView):
    """Paginated, filterable list of audit logs (admin only)."""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        qs = AuditLog.objects.select_related('user').order_by('-created_at')

        # ── Filters ──
        action = request.query_params.get('action')
        model_name = request.query_params.get('model')
        user_id = request.query_params.get('user')
        search = request.query_params.get('q')
        days = request.query_params.get('days')

        if action in ('create', 'update', 'delete'):
            qs = qs.filter(action=action)
        if model_name:
            qs = qs.filter(model_name=model_name)
        if user_id:
            qs = qs.filter(user_id=user_id)
        if days:
            try:
                days_int = int(days)
                cutoff = timezone.now() - timedelta(days=days_int)
                qs = qs.filter(created_at__gte=cutoff)
            except (ValueError, TypeError):
                pass
        if search:
            qs = qs.filter(
                Q(object_repr__icontains=search) |
                Q(model_name__icontains=search) |
                Q(user__username__icontains=search) |
                Q(user__email__icontains=search) |
                Q(user__first_name__icontains=search) |
                Q(user__last_name__icontains=search)
            )

        # ── Pagination ──
        try:
            page = max(1, int(request.query_params.get('page', 1)))
            page_size = min(100, max(5, int(request.query_params.get('page_size', 20))))
        except (ValueError, TypeError):
            page, page_size = 1, 20

        total = qs.count()
        start = (page - 1) * page_size
        end = start + page_size
        items = qs[start:end]

        return Response({
            'total': total,
            'page': page,
            'page_size': page_size,
            'total_pages': (total + page_size - 1) // page_size,
            'results': [
                {
                    'id': log.id,
                    'user': {
                        'id': log.user.id if log.user else None,
                        'username': log.user.username if log.user else 'سیستم',
                        'full_name': (log.user.get_full_name() or log.user.username) if log.user else 'سیستم',
                    },
                    'action': log.action,
                    'action_label': log.get_action_display(),
                    'model_name': log.model_name,
                    'object_id': log.object_id,
                    'object_repr': log.object_repr,
                    'changes': log.changes,
                    'ip_address': log.ip_address,
                    'created_at': log.created_at.isoformat(),
                }
                for log in items
            ],
        })


class AuditStatsView(APIView):
    """Summary counts for the header cards."""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        from datetime import timedelta
        now = timezone.now()

        # Last 24h buckets
        day_ago = now - timedelta(days=1)
        week_ago = now - timedelta(days=7)

        return Response({
            'total': AuditLog.objects.count(),
            'last_24h': AuditLog.objects.filter(created_at__gte=day_ago).count(),
            'last_7d': AuditLog.objects.filter(created_at__gte=week_ago).count(),
            'creates_7d': AuditLog.objects.filter(action='create', created_at__gte=week_ago).count(),
            'updates_7d': AuditLog.objects.filter(action='update', created_at__gte=week_ago).count(),
            'deletes_7d': AuditLog.objects.filter(action='delete', created_at__gte=week_ago).count(),
        })


class AuditModelChoicesView(APIView):
    """Distinct model names that appear in the log."""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        choices = (
            AuditLog.objects
            .values_list('model_name', flat=True)
            .distinct()
            .order_by('model_name')
        )
        return Response({'models': list(choices)})