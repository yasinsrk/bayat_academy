# tickets/admin.py
from django.contrib import admin
from django.utils.html import format_html
from .models import TicketCategory, Ticket, TicketReply


@admin.register(TicketCategory)
class TicketCategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'color_display', 'is_active', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('name', 'description')

    def color_display(self, obj):
        return format_html(
            '<span style="display:inline-block;width:20px;height:20px;background:{};border-radius:4px;"></span>',
            obj.color
        )
    color_display.short_description = 'رنگ'


@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'title', 'user', 'status_badge', 'priority_badge',
        'replies_count', 'created_at'
    )
    list_filter = ('status', 'priority', 'category', 'created_at')
    search_fields = ('title', 'message', 'user__username', 'user__email')
    readonly_fields = ('created_at', 'updated_at', 'resolved_at', 'closed_at', 'views_count', 'replies_count')
    date_hierarchy = 'created_at'

    fieldsets = (
        ('اطلاعات اصلی', {
            'fields': ('user', 'category', 'title', 'message')
        }),
        ('وضعیت', {
            'fields': ('status', 'priority')
        }),
        ('آمار', {
            'fields': ('views_count', 'replies_count', 'last_reply_at'),
            'classes': ('collapse',),
        }),
        ('زمان‌ها', {
            'fields': ('created_at', 'updated_at', 'resolved_at', 'closed_at'),
            'classes': ('collapse',),
        }),
    )

    def status_badge(self, obj):
        colors = {
            'open': '#00C9A7',
            'in_progress': '#4A6CF7',
            'waiting': '#FFB800',
            'resolved': '#6C63FF',
            'closed': '#8a8a9a',
        }
        labels = {
            'open': 'باز',
            'in_progress': 'در حال بررسی',
            'waiting': 'در انتظار پاسخ',
            'resolved': 'برطرف شده',
            'closed': 'بسته شده',
        }
        color = colors.get(obj.status, '#8a8a9a')
        label = labels.get(obj.status, obj.status)
        return format_html(
            '<span style="background:{}20;color:{};padding:3px 12px;border-radius:50px;font-size:12px;font-weight:600;">{}</span>',
            color, color, label
        )
    status_badge.short_description = 'وضعیت'

    def priority_badge(self, obj):
        colors = {
            'low': '#8a8a9a',
            'medium': '#4A6CF7',
            'high': '#FFB800',
            'urgent': '#FF6B6B',
        }
        labels = {
            'low': 'کم',
            'medium': 'متوسط',
            'high': 'بالا',
            'urgent': 'فوری',
        }
        color = colors.get(obj.priority, '#8a8a9a')
        label = labels.get(obj.priority, obj.priority)
        return format_html(
            '<span style="background:{}20;color:{};padding:3px 12px;border-radius:50px;font-size:12px;font-weight:600;">{}</span>',
            color, color, label
        )
    priority_badge.short_description = 'اولویت'


@admin.register(TicketReply)
class TicketReplyAdmin(admin.ModelAdmin):
    list_display = ('id', 'ticket', 'user', 'is_admin', 'created_at')
    list_filter = ('is_admin', 'created_at')
    search_fields = ('message', 'user__username')