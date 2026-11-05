# audit/models.py
from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class AuditLog(models.Model):
    """
    Records every create/update/delete on tracked models.
    """

    class Action(models.TextChoices):
        CREATE = 'create', _('ایجاد')
        UPDATE = 'update', _('ویرایش')
        DELETE = 'delete', _('حذف')

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_logs',
    )
    action = models.CharField(
        max_length=20,
        choices=Action.choices,
        db_index=True,
    )
    model_name = models.CharField(max_length=100, db_index=True)
    object_id = models.CharField(max_length=100, blank=True, db_index=True)
    object_repr = models.CharField(max_length=255, blank=True)

    # Snapshot of the change
    changes = models.JSONField(default=dict, blank=True)

    # Request metadata
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        db_table = 'audit_logs'
        ordering = ['-created_at']
        verbose_name = _('audit log')
        verbose_name_plural = _('audit logs')
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['model_name', '-created_at']),
            models.Index(fields=['user', '-created_at']),
        ]

    def __str__(self):
        return f'{self.user} · {self.action} · {self.model_name} · {self.created_at}'