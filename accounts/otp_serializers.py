# accounts/otp_serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import PhoneOTP

User = get_user_model()


class SendOTPSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=11)
    purpose = serializers.ChoiceField(
        choices=PhoneOTP.Purpose.choices,
        default=PhoneOTP.Purpose.VERIFY
    )

    def validate_phone(self, value):
        if not value.isdigit() or len(value) != 11 or not value.startswith('09'):
            raise serializers.ValidationError('شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود')
        return value

    def validate(self, data):
        purpose = data['purpose']
        phone = data['phone']

        if purpose == PhoneOTP.Purpose.VERIFY:
            # ✅ Correct: Check if user exists. If they do, tell them to login.
            if User.objects.filter(phone=phone).exists():
                raise serializers.ValidationError(
                    {'error': 'این شماره قبلاً ثبت‌نام کرده است. لطفاً وارد شوید.', 'code': 'already_registered'}
                )
        elif purpose == PhoneOTP.Purpose.RESET:
            # For reset, the user MUST exist
            if not User.objects.filter(phone=phone).exists():
                raise serializers.ValidationError({'error': 'کاربری با این شماره یافت نشد', 'code': 'not_found'})

        return data


class RegisterStartSerializer(serializers.Serializer):
    """
    Used for the "register" flow — phone verification BEFORE account creation.
    """
    phone = serializers.CharField(max_length=11)
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    email = serializers.EmailField(required=False, allow_blank=True)
    password = serializers.CharField(min_length=8, write_only=True)

    def validate_phone(self, value):
        if not value.isdigit() or len(value) != 11 or not value.startswith('09'):
            raise serializers.ValidationError('شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود')

        # ✅ Correct: Block registration if the phone is already in use
        if User.objects.filter(phone=value).exists():
            raise serializers.ValidationError('این شماره قبلاً ثبت‌نام کرده است. لطفاً وارد شوید.')
        return value


class VerifyOTPSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=11)
    code = serializers.CharField(max_length=6)
    purpose = serializers.ChoiceField(
        choices=PhoneOTP.Purpose.choices,
        default=PhoneOTP.Purpose.VERIFY
    )


class SetNewPasswordSerializer(serializers.Serializer):
    reset_token = serializers.CharField()
    new_password = serializers.CharField(min_length=8, write_only=True)