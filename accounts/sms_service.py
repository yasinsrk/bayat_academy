# accounts/sms_service.py
from smsir import SMSIRClient
from smsir.endpoints import VerifySend
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


def send_otp_sms(phone: str, code: str) -> bool:
    """
    Send OTP via SMS.ir's verify template.
    Returns True on success, False on failure.
    """
    # Check if config is present
    if not settings.SMSIR_API_KEY:
        logger.error('SMSIR_API_KEY is not set in .env')
        return False

    if not settings.SMSIR_TEMPLATE_ID:
        logger.error('SMSIR_TEMPLATE_ID is not set in .env')
        return False

    try:
        client = SMSIRClient(settings.SMSIR_API_KEY)

        # SMS.ir expects template_id as integer
        template_id = int(settings.SMSIR_TEMPLATE_ID)

        result = client.execute(VerifySend(
            mobile=phone,
            template_id=template_id,
            parameters={"CODE": code},
        ))

        logger.info(f'✅ OTP sent to {phone} — message_id={result.message_id}')
        return True

    except Exception as e:
        logger.error(f'❌ SMS.ir error sending to {phone}: {e}')
        return False