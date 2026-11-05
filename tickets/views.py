# tickets/views.py
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.db.models import Q
from .models import TicketCategory, Ticket, TicketReply
from .serializers import (
    TicketCategorySerializer,
    TicketSerializer,
    TicketReplySerializer
)


class TicketCategoryViewSet(viewsets.ModelViewSet):
    queryset = TicketCategory.objects.filter(is_active=True)
    serializer_class = TicketCategorySerializer
    permission_classes = [permissions.IsAuthenticated]


class TicketViewSet(viewsets.ModelViewSet):
    """
    ViewSet for tickets - supports CRUD operations
    """
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Ticket.objects.all().order_by('-created_at')
        return Ticket.objects.filter(user=user).order_by('-created_at')

    def create(self, request, *args, **kwargs):
        """Create a new ticket with the authenticated user"""

        print(f"🔵 Creating ticket for user: {request.user.id} - {request.user.username}")
        print(f"🔵 Data received: {request.data}")

        title = request.data.get('title')
        message = request.data.get('message')
        priority = request.data.get('priority', 'medium')
        category_id = request.data.get('category')

        if not title:
            return Response(
                {'title': 'عنوان الزامی است'},
                status=status.HTTP_400_BAD_REQUEST
            )
        if not message:
            return Response(
                {'message': 'متن پیام الزامی است'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            ticket = Ticket.objects.create(
                user=request.user,
                title=title,
                message=message,
                priority=priority,
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT')
            )

            if category_id:
                try:
                    category = TicketCategory.objects.get(id=category_id)
                    ticket.category = category
                    ticket.save()
                except TicketCategory.DoesNotExist:
                    pass

            serializer = self.get_serializer(ticket)
            headers = self.get_success_headers(serializer.data)
            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED,
                headers=headers
            )

        except Exception as e:
            print(f"❌ Error creating ticket: {e}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    # ===== FIXED: Return full ticket data, not just reply =====
    @action(detail=True, methods=['post'])
    def reply(self, request, pk=None):
        ticket = self.get_object()
        user = request.user

        # Check if ticket is closed
        if ticket.status == Ticket.Status.CLOSED:
            return Response(
                {'error': 'این تیکت بسته شده است و نمی‌توان به آن پاسخ داد'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Only ticket owner or admin can reply
        if not user.is_superuser and ticket.user != user:
            return Response(
                {'error': 'شما دسترسی به این تیکت ندارید'},
                status=status.HTTP_403_FORBIDDEN
            )

        message = request.data.get('message')
        if not message:
            return Response(
                {'error': 'متن پاسخ الزامی است'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create reply
        reply = TicketReply.objects.create(
            ticket=ticket,
            user=user,
            message=message,
            is_admin=user.is_superuser,
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT')
        )

        # Update ticket status
        if user.is_superuser:
            ticket.status = Ticket.Status.IN_PROGRESS
        else:
            ticket.status = Ticket.Status.WAITING
        ticket.save()

        # ===== FIX: Return the full ticket with updated data =====
        ticket.refresh_from_db()
        serializer = TicketSerializer(ticket)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def close(self, request, pk=None):
        """Close a ticket (user or admin can close)"""
        ticket = self.get_object()
        user = request.user

        # Check if user is ticket owner OR admin
        if not user.is_superuser and ticket.user != user:
            return Response(
                {'error': 'شما دسترسی به این تیکت ندارید'},
                status=status.HTTP_403_FORBIDDEN
            )

        if ticket.status == Ticket.Status.CLOSED:
            return Response(
                {'error': 'این تیکت قبلاً بسته شده است'},
                status=status.HTTP_400_BAD_REQUEST
            )

        ticket.status = Ticket.Status.CLOSED
        ticket.closed_at = timezone.now()
        ticket.save()

        ticket.refresh_from_db()
        serializer = TicketSerializer(ticket)

        return Response({
            'message': 'تیکت با موفقیت بسته شد',
            'ticket': serializer.data
        })

    @action(detail=True, methods=['post'])
    def reopen(self, request, pk=None):
        """Reopen a closed ticket (admin only)"""
        if not request.user.is_superuser:
            return Response(
                {'error': 'شما دسترسی لازم را ندارید'},
                status=status.HTTP_403_FORBIDDEN
            )

        ticket = self.get_object()

        if ticket.status != Ticket.Status.CLOSED:
            return Response(
                {'error': 'این تیکت باز است و نیازی به بازگشایی ندارد'},
                status=status.HTTP_400_BAD_REQUEST
            )

        ticket.status = Ticket.Status.OPEN
        ticket.closed_at = None
        ticket.save()

        ticket.refresh_from_db()
        serializer = TicketSerializer(ticket)

        return Response({
            'message': 'تیکت با موفقیت بازگشایی شد',
            'ticket': serializer.data
        })

    @action(detail=True, methods=['post'])
    def change_status(self, request, pk=None):
        if not request.user.is_superuser:
            return Response(
                {'error': 'شما دسترسی لازم را ندارید'},
                status=status.HTTP_403_FORBIDDEN
            )

        ticket = self.get_object()
        status_value = request.data.get('status')

        if status_value not in [s[0] for s in Ticket.Status.choices]:
            return Response(
                {'error': 'وضعیت نامعتبر است'},
                status=status.HTTP_400_BAD_REQUEST
            )

        ticket.status = status_value
        if status_value == Ticket.Status.RESOLVED:
            ticket.resolved_at = timezone.now()
        elif status_value == Ticket.Status.CLOSED:
            ticket.closed_at = timezone.now()
        ticket.save()

        ticket.refresh_from_db()
        serializer = TicketSerializer(ticket)
        return Response({
            'message': 'وضعیت تیکت تغییر کرد',
            'ticket': serializer.data
        })

    @action(detail=True, methods=['post'])
    def change_priority(self, request, pk=None):
        if not request.user.is_superuser:
            return Response(
                {'error': 'شما دسترسی لازم را ندارید'},
                status=status.HTTP_403_FORBIDDEN
            )

        ticket = self.get_object()
        priority = request.data.get('priority')

        if priority not in [p[0] for p in Ticket.Priority.choices]:
            return Response(
                {'error': 'اولویت نامعتبر است'},
                status=status.HTTP_400_BAD_REQUEST
            )

        ticket.priority = priority
        ticket.save()

        ticket.refresh_from_db()
        serializer = TicketSerializer(ticket)
        return Response({
            'message': 'اولویت تیکت تغییر کرد',
            'ticket': serializer.data
        })


class TicketStatsView(APIView):
    """
    Get ticket statistics (admin only)
    """
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        total = Ticket.objects.count()
        open_tickets = Ticket.objects.filter(
            status__in=[Ticket.Status.OPEN, Ticket.Status.IN_PROGRESS, Ticket.Status.WAITING]
        ).count()
        in_progress = Ticket.objects.filter(status=Ticket.Status.IN_PROGRESS).count()
        waiting = Ticket.objects.filter(status=Ticket.Status.WAITING).count()
        resolved = Ticket.objects.filter(status=Ticket.Status.RESOLVED).count()
        closed = Ticket.objects.filter(status=Ticket.Status.CLOSED).count()

        users_count = Ticket.objects.values('user').distinct().count()

        today = timezone.now().date()
        today_tickets = Ticket.objects.filter(created_at__date=today).count()

        return Response({
            'total': total,
            'open': open_tickets,
            'in_progress': in_progress,
            'waiting': waiting,
            'resolved': resolved,
            'closed': closed,
            'users_count': users_count,
            'today': today_tickets,
        })

# tickets/views.py — append at the bottom

from rest_framework.decorators import api_view, permission_classes


@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def bulk_change_ticket_status(request):
    """Body: { ids: [1,2,3], status: 'open'|'in_progress'|'waiting'|'resolved'|'closed' }"""
    ids = request.data.get('ids') or []
    new_status = request.data.get('status')

    valid = [c[0] for c in Ticket.Status.choices]
    if new_status not in valid:
        return Response({'error': 'وضعیت نامعتبر'}, status=400)
    if not ids:
        return Response({'error': 'هیچ تیکتی انتخاب نشده'}, status=400)

    qs = Ticket.objects.filter(id__in=ids)
    count = qs.count()

    update_fields = {'status': new_status}
    if new_status == Ticket.Status.RESOLVED:
        update_fields['resolved_at'] = timezone.now()
    if new_status == Ticket.Status.CLOSED:
        update_fields['closed_at'] = timezone.now()

    qs.update(**update_fields)
    return Response({'updated': count, 'status': new_status})


@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def bulk_change_ticket_priority(request):
    """Body: { ids: [1,2,3], priority: 'low'|'medium'|'high'|'urgent' }"""
    ids = request.data.get('ids') or []
    priority = request.data.get('priority')

    valid = [c[0] for c in Ticket.Priority.choices]
    if priority not in valid:
        return Response({'error': 'اولویت نامعتبر'}, status=400)
    if not ids:
        return Response({'error': 'هیچ تیکتی انتخاب نشده'}, status=400)

    count = Ticket.objects.filter(id__in=ids).update(priority=priority)
    return Response({'updated': count, 'priority': priority})


@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def bulk_delete_tickets(request):
    """Body: { ids: [1,2,3] }"""
    ids = request.data.get('ids') or []
    if not ids:
        return Response({'error': 'هیچ تیکتی انتخاب نشده'}, status=400)
    deleted, _ = Ticket.objects.filter(id__in=ids).delete()
    return Response({'deleted': deleted})