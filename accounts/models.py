from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _


class User(AbstractUser):
    """
    Custom User model extending Django's AbstractUser
    """
    # Additional fields
    phone = models.CharField(
        _('phone number'),
        max_length=11,
        blank=False,
        null=False,
        unique=True,
        help_text="User's phone number for contact"
    )
    avatar = models.URLField(
        _('avatar'),
        blank=True,
        null=True,
        help_text="URL to user's profile picture"
    )
    bio = models.TextField(
        _('biography'),
        blank=True,
        help_text="Short biography or description"
    )
    is_instructor = models.BooleanField(
        _('instructor status'),
        default=False,
        help_text="Designates whether the user can create packages"
    )
    # Timestamps
    created_at = models.DateTimeField(
        _('created at'),
        auto_now_add=True
    )
    updated_at = models.DateTimeField(
        _('updated at'),
        auto_now=True
    )

    class Meta:
        db_table = 'users'
        verbose_name = _('user')
        verbose_name_plural = _('users')
        ordering = ['-date_joined']

    def __str__(self):
        return self.email or self.username

    @property
    def full_name(self):
        """Returns the user's full name."""
        return f"{self.first_name} {self.last_name}".strip() or self.username

    @property
    def total_purchased_packages(self):
        """Count of packages purchased by the user."""
        return self.purchased_packages.filter(is_active=True).count()


class SavedView(models.Model):
    """
    A saved filter preset for an admin list page.
    Example: ('payments', {'status': 'failed', 'days': 7}, 'پرداخت‌های ناموفق')
    """
    user = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='saved_views',
    )
    page = models.CharField(max_length=50, db_index=True)  # 'payments', 'users', 'packages', 'tickets', 'audit'
    name = models.CharField(max_length=100)
    filters = models.JSONField(default=dict, blank=True)
    icon = models.CharField(max_length=50, blank=True, default='')
    color = models.CharField(max_length=20, blank=True, default='')
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'saved_views'
        ordering = ['-is_default', '-created_at']
        unique_together = [['user', 'page', 'name']]
        indexes = [
            models.Index(fields=['user', 'page']),
        ]

    def __str__(self):
        return f'{self.user.username} · {self.page} · {self.name}'


class PhoneOTP(models.Model):
    """
    One-time password for phone verification or password reset.
    """
    class Purpose(models.TextChoices):
        VERIFY = 'verify', 'تأیید شماره موبایل'
        RESET = 'reset', 'بازیابی رمز عبور'

    phone = models.CharField(max_length=11, db_index=True)
    code = models.CharField(max_length=6)
    purpose = models.CharField(max_length=10, choices=Purpose.choices, default=Purpose.VERIFY)
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    payload = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = 'phone_otp'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['phone', 'purpose', '-created_at']),
        ]

    def is_valid(self):
        """Valid for 2 minutes and not used."""
        from django.utils import timezone
        from datetime import timedelta
        if self.is_used:
            return False
        return timezone.now() - self.created_at < timedelta(minutes=2)

    def __str__(self):
        return f'{self.phone} - {self.purpose} - {"used" if self.is_used else "active"}'