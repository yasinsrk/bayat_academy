# tickets/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import TicketCategory, Ticket, TicketReply

User = get_user_model()


# ===== سریالایزر سبک برای کاربر =====
class TicketUserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'phone', 'full_name')

    def get_full_name(self, obj):
        full_name = obj.get_full_name()
        return full_name if full_name else obj.username


# ===== دسته‌بندی =====
class TicketCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = TicketCategory
        fields = '__all__'
        read_only_fields = ('id', 'created_at')


# ===== پاسخ =====
class TicketReplySerializer(serializers.ModelSerializer):
    user = TicketUserSerializer(read_only=True)
    is_admin_display = serializers.SerializerMethodField()

    class Meta:
        model = TicketReply
        fields = (
            'id', 'ticket', 'user', 'message',
            'is_admin', 'is_admin_display',
            'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def get_is_admin_display(self, obj):
        return 'ادمین' if obj.is_admin else 'کاربر'


# ===== تیکت اصلی =====
class TicketSerializer(serializers.ModelSerializer):
    user = TicketUserSerializer(read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_icon = serializers.CharField(source='category.icon', read_only=True)
    replies = TicketReplySerializer(many=True, read_only=True)
    status_label = serializers.SerializerMethodField()
    priority_label = serializers.SerializerMethodField()

    class Meta:
        model = Ticket
        fields = (
            'id', 'title', 'message',
            'category', 'category_name', 'category_icon',
            'priority', 'priority_label',
            'status', 'status_label',
            'user',
            'replies', 'replies_count',
            'views_count',
            'created_at', 'updated_at', 'resolved_at', 'closed_at',
        )
        read_only_fields = (
            'id', 'created_at', 'updated_at',
            'views_count', 'replies_count',
            'status',
        )

    def get_status_label(self, obj):
        return obj.get_status_display()

    def get_priority_label(self, obj):
        return obj.get_priority_display()

    def validate_category(self, value):
        if value == '':
            return None
        return value

    def validate(self, data):
        if not data.get('title'):
            raise serializers.ValidationError({'title': 'عنوان الزامی است'})
        if not data.get('message'):
            raise serializers.ValidationError({'message': 'متن پیام الزامی است'})
        return data

    def create(self, validated_data):
        validated_data.pop('user', None)
        validated_data.pop('status', None)
        return Ticket.objects.create(**validated_data)