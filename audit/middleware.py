# audit/middleware.py
from .tracker import set_current_request


class AuditMiddleware:
    """
    Stores the current request in thread-local storage so signals
    can access the acting user and IP.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        set_current_request(request)
        try:
            response = self.get_response(request)
        finally:
            set_current_request(None)
        return response