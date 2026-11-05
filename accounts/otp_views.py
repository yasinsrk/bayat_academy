# accounts/otp_views.py
import random
import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta

from .models import PhoneOTP
from .otp_serializers import (
    SendOTPSerializer,
    RegisterStartSerializer,
    VerifyOTPSerializer,
    SetNewPasswordSerializer,
)
from .sms_service import send_otp_sms

User = get_user_model()
logger = logging.getLogger(__name__)


class SendOTPView(APIView):
    """
    Sends an OTP for password reset.
    (For registration, use RegisterStartView instead.)
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = SendOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        phone = serializer.validated_data['phone']
        purpose = serializer.validated_data['purpose']

        # Rate limit: 1 OTP per phone per 60 seconds
        recent = PhoneOTP.objects.filter(
            phone=phone,
            purpose=purpose,
            created_at__gte=timezone.now() - timedelta(seconds=60),
        ).exists()
        if recent:
            return Response(
                {'error': 'لطفاً ۶۰ ثانیه صبر کنید و مجدداً تلاش کنید'},
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        code = str(random.randint(100000, 999999))

        if not send_otp_sms(phone, code):
            return Response(
                {'error': 'خطا در ارسال پیامک. لطفاً بعداً تلاش کنید'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        PhoneOTP.objects.create(phone=phone, code=code, purpose=purpose)

        return Response({'message': 'کد تأیید ارسال شد'})


class RegisterStartView(APIView):
    """
    Step 1 of registration: Collect data, validate, send OTP.
    Does NOT create the user yet.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterStartSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        phone = data['phone']

        # Rate limit
        recent = PhoneOTP.objects.filter(
            phone=phone,
            purpose=PhoneOTP.Purpose.VERIFY,
            created_at__gte=timezone.now() - timedelta(seconds=60),
        ).exists()
        if recent:
            return Response(
                {'error': 'لطفاً ۶۰ ثانیه صبر کنید و مجدداً تلاش کنید'},
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        code = str(random.randint(100000, 999999))

        if not send_otp_sms(phone, code):
            return Response(
                {'error': 'خطا در ارسال پیامک. لطفاً بعداً تلاش کنید'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # Save OTP + registration payload
        PhoneOTP.objects.create(
            phone=phone,
            code=code,
            purpose=PhoneOTP.Purpose.VERIFY,
            payload={
                'first_name': data['first_name'],
                'last_name': data['last_name'],
                'email': data.get('email', ''),
                'password': data['password'],
                'flow': 'register',
            },
        )

        return Response({'message': 'کد تأیید ارسال شد'})


class VerifyOTPView(APIView):
    """
    Verify the OTP.
    - purpose='verify' + payload.flow='register': create user, return JWT
    - purpose='verify' (no payload): just confirm phone
    - purpose='reset': issue short-lived password reset token
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        phone = serializer.validated_data['phone']
        code = serializer.validated_data['code']
        purpose = serializer.validated_data['purpose']

        otp = PhoneOTP.objects.filter(
            phone=phone,
            code=code,
            purpose=purpose,
            is_used=False,
        ).order_by('-created_at').first()

        if not otp or not otp.is_valid():
            return Response(
                {'error': 'کد تأیید نامعتبر یا منقضی شده است'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Mark as used
        otp.is_used = True
        otp.save()

        # ── Registration flow ──
        if purpose == PhoneOTP.Purpose.VERIFY and otp.payload.get('flow') == 'register':
            try:
                # ✅ Double-check: user shouldn't exist (safety net)
                if User.objects.filter(phone=phone).exists():
                    return Response(
                        {'error': 'این شماره قبلاً ثبت‌نام کرده است. لطفاً وارد شوید.'},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                # Create the user
                user = User.objects.create_user(
                    username=f"user_{phone}",
                    phone=phone,
                    first_name=otp.payload.get('first_name', ''),
                    last_name=otp.payload.get('last_name', ''),
                    email=otp.payload.get('email', ''),
                    password=otp.payload.get('password', ''),
                )

                # Issue JWT
                refresh = RefreshToken.for_user(user)
                from .serializers import UserSerializer

                return Response({
                    'message': 'ثبت‌نام با موفقیت انجام شد',
                    'user': UserSerializer(user).data,
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                })
            except Exception as e:
                logger.error(f'Register after OTP failed: {e}')
                return Response(
                    {'error': 'خطا در ایجاد حساب کاربری'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

        # ── Standalone verify ──
        if purpose == PhoneOTP.Purpose.VERIFY:
            return Response({
                'message': 'شماره موبایل تأیید شد',
                'verified': True,
            })

        # ── Reset flow ──
        try:
            user = User.objects.get(phone=phone)
        except User.DoesNotExist:
            return Response(
                {'error': 'کاربر یافت نشد'},
                status=status.HTTP_404_NOT_FOUND,
            )

        refresh = RefreshToken.for_user(user)
        access = refresh.access_token
        access['purpose'] = 'password_reset'

        return Response({
            'message': 'کد تأیید صحیح است',
            'reset_token': str(access),
        })


class SetNewPasswordView(APIView):
    """
    Accepts a reset_token (from VerifyOTPView) + new_password.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = SetNewPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        token = serializer.validated_data['reset_token']
        new_password = serializer.validated_data['new_password']

        try:
            access = AccessToken(token)
        except Exception:
            return Response(
                {'error': 'توکن نامعتبر است'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if access.get('purpose') != 'password_reset':
            return Response(
                {'error': 'این توکن برای بازیابی رمز معتبر نیست'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user_id = access.get('user_id')
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'کاربر یافت نشد'}, status=404)

        user.set_password(new_password)
        user.save()

        return Response({'message': 'رمز عبور با موفقیت تغییر کرد'})