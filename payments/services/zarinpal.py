"""
Zarinpal payment gateway integration
Will be implemented later
"""


class ZarinpalService:
    @staticmethod
    def create_payment(amount, description, callback_url, metadata=None):
        """
        Create a payment request in Zarinpal
        """
        # This will be implemented later with actual Zarinpal API
        return {
            'status': 'success',
            'authority': 'A-123456',
            'payment_url': 'https://sandbox.zarinpal.com/pg/StartPay/A-123456'
        }

    @staticmethod
    def verify_payment(authority, amount):
        """
        Verify payment with Zarinpal
        """
        # This will be implemented later with actual Zarinpal API
        return {
            'status': 'success',
            'ref_id': 'REF-123456'
        }