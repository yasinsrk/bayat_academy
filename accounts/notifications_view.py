# accounts/notifications_view.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.utils import timezone
from datetime import timedelta


class AdminNotificationsView(APIView):
    """
    Returns the last N real events for the admin notification bell.
    """
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        limit = int(request.query_params.get('limit', 8))
        hours = int(request.query_params.get('hours', 168))

        since = timezone.now() - timedelta(hours=hours)
        items = []

        # ── Recent paid payments ──
        try:
            from payments.models import Payment
            paid = Payment.objects.filter(
                status=Payment.Status.PAID,
                paid_at__gte=since,
            ).select_related('user', 'package').order_by('-paid_at')[:limit]

            for p in paid:
                name = p.user.get_full_name() or p.user.username if p.user else 'کاربر'
                items.append({
                    'id': f'pay-{p.id}',
                    'type': 'success',
                    'title': 'خرید جدید',
                    'message': f'{name} دوره «{p.package.title}» را خریداری کرد' if p.package else f'{name} یک دوره خریداری کرد',
                    'time': p.paid_at.isoformat() if p.paid_at else None,
                    'href': '/admin/payments',
                    'read': False,
                })
        except Exception as e:
            print(f'[notifications] payments error: {e}')

        # ── Recent failed payments ──
        try:
            from payments.models import Payment
            failed = Payment.objects.filter(
                status=Payment.Status.FAILED,
                created_at__gte=since,
            ).select_related('user', 'package').order_by('-created_at')[:max(1, limit // 2)]

            for p in failed:
                name = p.user.get_full_name() or p.user.username if p.user else 'کاربر'
                items.append({
                    'id': f'fail-{p.id}',
                    'type': 'danger',
                    'title': 'پرداخت ناموفق',
                    'message': f'پرداخت {name} ناموفق بود',
                    'time': p.created_at.isoformat() if p.created_at else None,
                    'href': '/admin/payments',
                    'read': False,
                })
        except Exception as e:
            print(f'[notifications] failed payments error: {e}')

        # ── Recent tickets ──
        try:
            from tickets.models import Ticket
            tickets = Ticket.objects.filter(
                created_at__gte=since,
            ).select_related('user').order_by('-created_at')[:max(1, limit // 2)]

            for t in tickets:
                name = t.user.get_full_name() or t.user.username if t.user else 'کاربر'
                items.append({
                    'id': f'tkt-{t.id}',
                    'type': 'info',
                    'title': 'تیکت جدید',
                    'message': f'{name}: {t.title}',
                    'time': t.created_at.isoformat() if t.created_at else None,
                    'href': '/admin/tickets',
                    'read': False,
                })
        except Exception as e:
            print(f'[notifications] tickets error: {e}')

        # ── Recent user signups ──
        try:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            users = User.objects.filter(
                date_joined__gte=since,
                is_superuser=False,
            ).order_by('-date_joined')[:max(1, limit // 2)]

            for u in users:
                name = u.get_full_name() or u.username
                items.append({
                    'id': f'usr-{u.id}',
                    'type': 'info',
                    'title': 'ثبت‌نام جدید',
                    'message': f'کاربر {name} ثبت‌نام کرد',
                    'time': u.date_joined.isoformat() if u.date_joined else None,
                    'href': '/admin/users',
                    'read': False,
                })
        except Exception as e:
            print(f'[notifications] users error: {e}')

        items.sort(key=lambda x: x['time'] or '', reverse=True)
        items = items[:limit]

        return Response({
            'count': len(items),
            'unread': len([i for i in items if not i['read']]),
            'items': items,
        })


class AdminActionQueueView(APIView):
    """
    Returns a list of counts for things that need admin attention.
    """
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        from django.utils import timezone
        from datetime import timedelta

        now = timezone.now()
        week_ago = now - timedelta(days=7)

        result = {
            'pending_tickets': 0,
            'pending_payments': 0,
            'failed_payments_7d': 0,
            'draft_packages': 0,
            'new_users_7d': 0,
        }

        # ── Tickets waiting for admin response ──
        try:
            from tickets.models import Ticket
            result['pending_tickets'] = Ticket.objects.filter(
                status__in=[Ticket.Status.OPEN, Ticket.Status.WAITING]
            ).count()
        except Exception as e:
            print(f'[action-queue] tickets: {e}')

        # ── Payments in pending state ──
        try:
            from payments.models import Payment
            result['pending_payments'] = Payment.objects.filter(
                status=Payment.Status.PENDING
            ).count()

            result['failed_payments_7d'] = Payment.objects.filter(
                status=Payment.Status.FAILED,
                created_at__gte=week_ago
            ).count()
        except Exception as e:
            print(f'[action-queue] payments: {e}')

        # ── Draft (unpublished) packages ──
        try:
            from packages.models import Package
            result['draft_packages'] = Package.objects.filter(
                is_published=False
            ).count()
        except Exception as e:
            print(f'[action-queue] packages: {e}')

        # ── New user signups in last 7 days ──
        try:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            result['new_users_7d'] = User.objects.filter(
                date_joined__gte=week_ago
            ).count()
        except Exception as e:
            print(f'[action-queue] users: {e}')

        return Response(result)