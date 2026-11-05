# packages/services/spotplayer.py
import requests
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

SPOTPLAYER_API = "https://panel.spotplayer.ir/license/edit/"


class SpotPlayerService:
    @staticmethod
    def create_license(course_id, user, package_id=None, test=False):
        """ساخت لایسنس جدید در اسپات پلیر"""

        payload = {
            "test": test,
            "course": [course_id],
            "name": user.phone or user.username or f"user_{user.id}",
            "watermark": {
                "texts": [
                    {"text": user.phone or user.username or f"user_{user.id}"}
                ]
            }
        }

        # ===== Headers با $ =====
        # نکته: از طریق requests نمی‌شه header با $ فرستاد،
        # پس از session استفاده می‌کنیم
        session = requests.Session()
        session.headers.update({
            "Content-Type": "application/json",
            "$API": str(settings.SPOTPLAYER_API_KEY).strip(),
            "$LEVEL": "-1",
        })

        try:
            logger.info(f"🚀 Sending to SpotPlayer API")
            logger.info(f"📤 Payload: {payload}")
            logger.info(f"🔑 API Key: {str(settings.SPOTPLAYER_API_KEY)[:15]}...")

            response = session.post(
                SPOTPLAYER_API,
                json=payload,
                timeout=30
            )

            logger.info(f"📡 Status Code: {response.status_code}")
            logger.info(f"📡 Response: {response.text[:500]}")

            # ===== چک کن کد 200 باشه =====
            if response.status_code != 200:
                raise Exception(f"اسپات پلیر خطا داد: {response.status_code} - {response.text[:200]}")

            data = response.json()

            # ===== چک کن خطایی نباشه =====
            if 'ex' in data:
                error_msg = data['ex'].get('msg', 'خطای نامشخص')
                raise Exception(error_msg)

            if 'key' not in data:
                raise Exception(f"پاسخ نامعتبر: {data}")

            return data

        except requests.RequestException as e:
            logger.error(f"❌ Request error: {e}")
            raise Exception(f"خطا در ارتباط با اسپات پلیر: {str(e)}")
        except ValueError as e:
            logger.error(f"❌ JSON error: {e}")
            raise Exception("پاسخ نامعتبر از اسپات پلیر")