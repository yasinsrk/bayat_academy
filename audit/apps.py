# audit/apps.py
from django.apps import AppConfig


class AuditConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'audit'
    verbose_name = 'Audit Log'

    def ready(self):
        # Attach tracking to the models we care about
        from .tracker import attach_tracking_to_model

        try:
            from packages.models import Package, Category, UserPackage
            attach_tracking_to_model(Package)
            attach_tracking_to_model(Category)
            attach_tracking_to_model(UserPackage)
        except Exception as e:
            print(f'[audit] failed to attach to packages: {e}')

        try:
            from payments.models import Payment
            attach_tracking_to_model(Payment)
        except Exception as e:
            print(f'[audit] failed to attach to payments: {e}')

        try:
            from tickets.models import Ticket, TicketReply
            attach_tracking_to_model(Ticket)
            attach_tracking_to_model(TicketReply)
        except Exception as e:
            print(f'[audit] failed to attach to tickets: {e}')

        try:
            from accounts.models import User
            attach_tracking_to_model(User)
        except Exception as e:
            print(f'[audit] failed to attach to accounts: {e}')