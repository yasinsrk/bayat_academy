from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
import logging

from .models import UserPackage
from .services.spotplayer import SpotPlayerService

logger = logging.getLogger(__name__)


@receiver(post_save, sender=UserPackage)
def create_spotplayer_license(sender, instance, created, **kwargs):
    """
    وقتی UserPackage جدید ساخته میشه،
    به صورت خودکار لایسنس اسپات پلیر رو بساز
    """
    if not created:
        return

    if instance.spot_player_license:
        return  # قبلاً لایسنس داره

    package = instance.package
    if not package.spot_player_course_id:
        logger.warning(f"Package {package.id} has no spot_player_course_id")
        return

    try:
        data = SpotPlayerService.create_license(
            course_id=package.spot_player_course_id,
            user=instance.user,
            package_id=package.id
        )

        license_key = data.get('key') or data.get('license') or data.get('_id')

        instance.spot_player_license = license_key
        instance.license_created_at = timezone.now()
        instance.license_payload = data
        instance.save(update_fields=[
            'spot_player_license',
            'license_created_at',
            'license_payload'
        ])

        logger.info(f"License created for user {instance.user.id}, package {package.id}")

    except Exception as e:
        logger.error(f"Failed to create license: {e}")