# accounts/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.db import models
from packages.models import UserPackage
from .models import SavedView

User = get_user_model()


# ===== Register Serializer =====
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'password2', 'email', 'phone', 'first_name', 'last_name')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "رمز عبور با تکرار آن مطابقت ندارد"})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user


# ===== Login Serializer =====
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=False)
    phone = serializers.CharField(required=False)
    password = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        from django.contrib.auth import authenticate

        username = attrs.get('username')
        phone = attrs.get('phone')
        password = attrs.get('password')

        if not username and not phone:
            raise serializers.ValidationError('یوزرنیم یا شماره موبایل الزامی است')

        user = None

        # اول با یوزرنیم
        if username:
            try:
                user_obj = User.objects.get(username=username)
                user = authenticate(username=username, password=password)
            except User.DoesNotExist:
                pass

        # اگر با یوزرنیم نشد، با شماره موبایل
        if not user and phone:
            try:
                user_obj = User.objects.get(phone=phone)
                user = authenticate(username=user_obj.username, password=password)
            except User.DoesNotExist:
                pass

        if not user:
            raise serializers.ValidationError('یوزرنیم/شماره موبایل یا رمز عبور اشتباه است')

        if not user.is_active:
            raise serializers.ValidationError('حساب کاربری غیرفعال است')

        attrs['user'] = user
        return attrs


# ===== User Serializer (برای ادمین و پروفایل) =====
class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    packages_count = serializers.SerializerMethodField()
    total_spent = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            'id', 'username', 'first_name', 'last_name', 'full_name',
            'email', 'phone', 'bio', 'avatar',
            'is_active', 'is_superuser', 'is_instructor',
            'date_joined', 'last_login',
            'packages_count', 'total_spent'
        )
        read_only_fields = ('id', 'username', 'date_joined', 'last_login')

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username

    def get_packages_count(self, obj):
        return UserPackage.objects.filter(
            user=obj,
            is_active=True
        ).count()

    def get_total_spent(self, obj):
        total = UserPackage.objects.filter(
            user=obj,
            is_active=True
        ).aggregate(total=models.Sum('price_paid'))['total']
        return total or 0


# ===== UserProfile Serializer (برای پروفایل کاربر) =====
class UserProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            'id', 'username', 'full_name', 'email', 'phone',
            'bio', 'avatar', 'date_joined'
        )
        read_only_fields = ('id', 'username', 'date_joined')

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username


class SavedViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedView
        fields = ('id', 'page', 'name', 'filters', 'icon', 'color', 'is_default', 'created_at')
        read_only_fields = ('id', 'created_at')