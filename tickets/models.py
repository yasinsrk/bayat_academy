# tickets/models.py
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model

User = get_user_model()


class TicketCategory(models.Model):
    """
    دسته‌بندی تیکت‌ها
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    color = models.CharField(max_length=20, default='#4A6CF7')
    icon = models.CharField(max_length=50, blank=True, default='📩')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ticket_categories'
        ordering = ['name']

    def __str__(self):
        return self.name


class Ticket(models.Model):
    """
    تیکت پشتیبانی
    """

    class Priority(models.TextChoices):
        LOW = 'low', _('کم')
        MEDIUM = 'medium', _('متوسط')
        HIGH = 'high', _('بالا')
        URGENT = 'urgent', _('فوری')

    class Status(models.TextChoices):
        OPEN = 'open', _('باز')
        IN_PROGRESS = 'in_progress', _('در حال بررسی')
        WAITING = 'waiting', _('در انتظار پاسخ')
        RESOLVED = 'resolved', _('برطرف شده')
        CLOSED = 'closed', _('بسته شده')

    # ===== اطلاعات اصلی =====
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='tickets'
    )
    category = models.ForeignKey(
        TicketCategory,
        on_delete=models.SET_NULL,
        null=True,
        related_name='tickets'
    )

    title = models.CharField(max_length=200)
    message = models.TextField()

    # ===== وضعیت =====
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.OPEN
    )
    priority = models.CharField(
        max_length=10,
        choices=Priority.choices,
        default=Priority.MEDIUM
    )

    # ===== آمار =====
    views_count = models.IntegerField(default=0)
    replies_count = models.IntegerField(default=0)
    last_reply_at = models.DateTimeField(null=True, blank=True)

    # ===== اطلاعات فنی =====
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True, null=True)

    # ===== زمان‌ها =====
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    closed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'tickets'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['priority']),
        ]

    def __str__(self):
        return f"#{self.id} - {self.title}"

    @property
    def is_open(self):
        return self.status in [self.Status.OPEN, self.Status.IN_PROGRESS, self.Status.WAITING]

    @property
    def is_closed(self):
        return self.status == self.Status.CLOSED

    def mark_as_resolved(self):
        self.status = self.Status.RESOLVED
        self.resolved_at = timezone.now()
        self.save()

    def mark_as_closed(self):
        self.status = self.Status.CLOSED
        self.closed_at = timezone.now()
        self.save()

    # ===== NEW: Close ticket by user =====
    def close_by_user(self):
        """Close the ticket by the user (only if not already closed)"""
        if self.status != self.Status.CLOSED:
            self.status = self.Status.CLOSED
            self.closed_at = timezone.now()
            self.save()
            return True
        return False

    # ===== NEW: Reopen ticket (admin only) =====
    def reopen(self):
        """Reopen a closed ticket (admin only)"""
        if self.status == self.Status.CLOSED:
            self.status = self.Status.OPEN
            self.closed_at = None
            self.save()
            return True
        return False

    def update_replies_count(self):
        self.replies_count = self.replies.count()
        self.save(update_fields=['replies_count'])


class TicketReply(models.Model):
    """
    پاسخ‌های تیکت
    """
    ticket = models.ForeignKey(
        Ticket,
        on_delete=models.CASCADE,
        related_name='replies'
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='ticket_replies'
    )

    message = models.TextField()
    is_admin = models.BooleanField(default=False)

    # ===== اطلاعات فنی =====
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'ticket_replies'
        ordering = ['created_at']

    def __str__(self):
        return f"Reply to #{self.ticket.id} - {self.user.username}"

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        if is_new:
            self.ticket.replies_count += 1
            self.ticket.last_reply_at = timezone.now()
            self.ticket.save(update_fields=['replies_count', 'last_reply_at'])