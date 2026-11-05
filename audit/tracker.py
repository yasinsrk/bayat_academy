# audit/tracker.py
import threading
from django.db.models.signals import post_save, post_delete
from django.contrib.auth import get_user_model

# Thread-local storage for the current request
_thread_locals = threading.local()


def set_current_request(request):
    """Called from middleware at the start of each request."""
    _thread_locals.request = request


def get_current_request():
    return getattr(_thread_locals, 'request', None)


def get_current_user():
    request = get_current_request()
    if not request:
        return None
    user = getattr(request, 'user', None)
    if user and user.is_authenticated:
        return user
    return None


def get_client_ip(request):
    if not request:
        return None
    xff = request.META.get('HTTP_X_FORWARDED_FOR')
    if xff:
        return xff.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')


# Fields we never want to log (too noisy / sensitive)
IGNORED_FIELDS = {
    'updated_at', 'created_at', 'last_login', 'password',
    'license_payload', 'views_count', 'students_count',
}


def _extract_changes(instance, created):
    """Build a dict of {field: {from, to}} for the log."""
    if created:
        return {}  # nothing to diff — this is a new object

    # We can't diff without a "previous" snapshot, so we record the
    # current values of editable fields. Real-world systems keep the
    # previous snapshot too — we do a lightweight version here.
    changes = {}
    for field in instance._meta.fields:
        name = field.name
        if name in IGNORED_FIELDS:
            continue
        try:
            value = getattr(instance, name)
            if hasattr(value, 'pk'):
                value = str(value)
            elif hasattr(value, 'isoformat'):
                value = value.isoformat()
            else:
                value = str(value)
            changes[name] = value
        except Exception:
            pass
    return changes


def _log(instance, action, created=False):
    try:
        from .models import AuditLog
        request = get_current_request()
        user = get_current_user()

        model_name = instance._meta.model_name
        object_repr = str(instance)[:255]

        AuditLog.objects.create(
            user=user,
            action=action,
            model_name=model_name,
            object_id=str(instance.pk or ''),
            object_repr=object_repr,
            changes=_extract_changes(instance, created),
            ip_address=get_client_ip(request),
            user_agent=(request.META.get('HTTP_USER_AGENT', '')[:500] if request else ''),
        )
    except Exception as e:
        # Never let logging break the app
        print(f'[audit] failed to log {action} on {instance}: {e}')


def attach_tracking_to_model(model):
    """Wire post_save + post_delete for a given model."""
    post_save.connect(
        lambda sender, instance, created, **kw: _log(
            instance, 'create' if created else 'update', created=created
        ),
        sender=model,
        weak=False,
        dispatch_uid=f'audit_save_{model._meta.label}',
    )
    post_delete.connect(
        lambda sender, instance, **kw: _log(instance, 'delete'),
        sender=model,
        weak=False,
        dispatch_uid=f'audit_delete_{model._meta.label}',
    )