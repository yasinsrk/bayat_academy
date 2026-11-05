# packages/admin.py
from django.contrib import admin
from django.utils.html import format_html
from .models import Category, Package, UserPackage


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'created_at')
    search_fields = ('name',)
    ordering = ('name',)


@admin.register(Package)
class PackageAdmin(admin.ModelAdmin):
    list_display = (
        'title',
        'price',
        'is_free',
        'is_top',
        'is_published',
        'duration',
        'topics_count',
        'students_count',
    )
    list_filter = ('is_free', 'is_published', 'is_top', 'created_at', 'categories')
    search_fields = ('title', 'slug', 'description')
    prepopulated_fields = {'slug': ('title',)}

    readonly_fields = (
        'created_at',
        'updated_at',
        'views_count',
        'students_count',
        'topics_count',
        'video_preview',
    )

    filter_horizontal = ('categories',)

    fieldsets = (
        ('اطلاعات پایه', {
            'fields': ('title', 'slug', 'description')
        }),
        ('دسته‌بندی', {
            'fields': ('categories',),
        }),
        ('قیمت‌گذاری', {
            'fields': ('price', 'discounted_price', 'is_free'),
        }),
        ('رسانه', {
            'fields': ('image', 'image_url', 'introduction_video', 'introduction_video_url', 'video_preview'),
            'classes': ('wide',),
        }),
        ('مدت زمان و سرفصل‌ها', {
            'fields': ('duration', 'topics'),
            'description': 'مدت زمان کل دوره و لیست سرفصل‌ها را وارد کنید'
        }),
        ('ویژگی‌ها', {
            'fields': ('features',),
            'classes': ('collapse',),
        }),
        # ===== اسپات پلیر =====
        ('🎬 اسپات پلیر', {
            'fields': ('spot_player_course_id',),
            'description': 'شناسه دوره در اسپات پلیر را از داشبورد اسپات پلیر کپی کنید و اینجا وارد کنید',
        }),
        ('وضعیت نمایش', {
            'fields': ('is_published', 'published_at', 'is_top'),
        }),
        ('آمار', {
            'fields': ('views_count', 'students_count', 'topics_count'),
            'classes': ('collapse',),
        }),
        ('زمان‌ها', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )

    def video_preview(self, obj):
        """نمایش پیش‌نمایش ویدیو در ادمین"""
        if obj.introduction_video:
            return format_html(
                '<video controls style="max-height:150px; max-width:250px; border-radius:8px;">'
                '<source src="{}" type="video/mp4">'
                'مرورگر شما ویدیو را پشتیبانی نمی‌کند'
                '</video>',
                obj.introduction_video.url
            )
        if obj.introduction_video_url:
            if 'youtube.com' in obj.introduction_video_url or 'youtu.be' in obj.introduction_video_url:
                return format_html(
                    '<a href="{}" target="_blank" style="color:#FF0000; font-weight:bold;">'
                    '▶️ تماشا در یوتیوب'
                    '</a>',
                    obj.introduction_video_url
                )
            return format_html(
                '<a href="{}" target="_blank">🔗 لینک ویدیو</a>',
                obj.introduction_video_url
            )
        return 'بدون ویدیو'

    video_preview.short_description = 'پیش‌نمایش ویدیو'

    def topics_count(self, obj):
        return obj.topics_count

    topics_count.short_description = 'تعداد سرفصل‌ها'


@admin.register(UserPackage)
class UserPackageAdmin(admin.ModelAdmin):
    list_display = (
        'user',
        'package',
        'price_paid',
        'purchased_at',
        'is_active',
        'has_license',
        'spot_player_license',
    )
    list_filter = ('is_active', 'purchased_at', 'package')
    search_fields = ('user__username', 'user__email', 'package__title')
    readonly_fields = (
        'purchased_at',

        'license_created_at',
        'license_payload',
    )

    fieldsets = (
        ('اطلاعات خرید', {
            'fields': ('user', 'package', 'price_paid', 'purchased_at', 'expiry_date', 'is_active'),
        }),
        ('🎬 لایسنس اسپات پلیر', {
            'fields': ('spot_player_license', 'license_created_at', 'license_payload'),
            'description': 'این اطلاعات به صورت خودکار هنگام خرید ساخته می‌شود',
            'classes': ('collapse',),
        }),
    )

    # ===== نمایش وضعیت لایسنس =====
    def has_license(self, obj):
        if obj.spot_player_license:
            return "✅ دارد"
        return "⏳ ندارد"

    has_license.short_description = 'لایسنس اسپات پلیر'