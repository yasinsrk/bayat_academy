# payments/models.py
from django.db import models
from django.utils import timezone
from django.contrib.auth import get_user_model
from packages.models import Package

User = get_user_model()


class Payment(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'در انتظار'
        PAID = 'paid', 'پرداخت شده'
        FAILED = 'failed', 'ناموفق'
        CANCELLED = 'cancelled', 'لغو شده'

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments')
    package = models.ForeignKey(Package, on_delete=models.CASCADE, related_name='payments')

    amount = models.DecimalField(max_digits=12, decimal_places=0)
    authority = models.CharField(max_length=100, unique=True)
    ref_id = models.CharField(max_length=100, blank=True, null=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'payments'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.package.title} - {self.status}"