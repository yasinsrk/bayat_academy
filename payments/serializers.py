# payments/serializers.py
from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    """سریالایزر تراکنش با اطلاعات کامل کاربر و پکیج"""

    user = serializers.SerializerMethodField()
    package = serializers.SerializerMethodField()

    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at', 'paid_at')

    # ===== اطلاعات کاربر =====
    def get_user(self, obj):
        if not obj.user:
            return None

        try:
            return {
                'id': obj.user.id,
                'username': obj.user.username,
                'email': obj.user.email or '',
                'phone': getattr(obj.user, 'phone', '') or '',
                'full_name': obj.user.get_full_name() or obj.user.username,
            }
        except Exception as e:
            print(f"❌ Error serializing user: {e}")
            return None

    # ===== اطلاعات پکیج =====
    def get_package(self, obj):
        if not obj.package:
            return None

        try:
            # گرفتن URL تصویر
            image_url = None
            if obj.package.image:
                try:
                    image_url = obj.package.image.url
                except Exception:
                    image_url = None
            elif obj.package.image_url:
                image_url = obj.package.image_url

            return {
                'id': obj.package.id,
                'title': obj.package.title,
                'price': str(obj.package.price) if obj.package.price else '0',
                'image': image_url,
            }
        except Exception as e:
            print(f"❌ Error serializing package: {e}")
            return None