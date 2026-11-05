# packages/models.py
from django.db import models
from django.utils import timezone
from django.utils.text import slugify
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model
import uuid
import os

User = get_user_model()

def package_image_path(instance, filename):
    """مسیر ذخیره تصویر پکیج"""
    ext = filename.split('.')[-1]
    filename = f"{slugify(instance.title)}-{uuid.uuid4().hex[:8]}.{ext}"
    return os.path.join('packages', 'images', filename)


def package_video_path(instance, filename):
    """مسیر ذخیره ویدیو پکیج"""
    ext = filename.split('.')[-1]
    filename = f"{slugify(instance.title)}-{uuid.uuid4().hex[:8]}.{ext}"
    return os.path.join('packages', 'videos', filename)


class Category(models.Model):
    """دسته‌بندی پکیج‌ها"""
    name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'categories'
        ordering = ['name']

    def __str__(self):
        return self.name


class Package(models.Model):
    """پکیج آموزشی"""
    categories = models.ManyToManyField(
        Category,
        related_name='packages',
        blank=True
    )

    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True, blank=True)
    description = models.TextField()
    spot_player_course_id = models.CharField(
        max_length=100, blank=True, null=True,
        help_text="شناسه دوره در اسپات پلیر"
    )
    # قیمت
    price = models.DecimalField(max_digits=12, decimal_places=0, default=0)
    discounted_price = models.DecimalField(max_digits=12, decimal_places=0, null=True, blank=True)
    is_free = models.BooleanField(default=False)

    # تصویر
    image = models.ImageField(
        upload_to=package_image_path,
        blank=True,
        null=True,
        help_text="تصویر کاور دوره"
    )

    image_url = models.URLField(
        blank=True,
        null=True,
        help_text="لینک تصویر کاور دوره (اختیاری)"
    )
    introduction_video_url = models.URLField(
        max_length=500,
        blank=True,
        null=True,
        help_text="لینک ویدیو معرفی دوره"
    )
    introduction_video = models.FileField(
        upload_to=package_video_path,
        blank=True,
        null=True,
        help_text="ویدیو معرفی دوره (MP4, WebM)"
    )

    duration = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text="مدت زمان کل دوره (مثلاً: ۱۰ ساعت و ۳۰ دقیقه)"
    )

    topics = models.JSONField(
        default=list,
        blank=True,
        help_text="لیست سرفصل‌های دوره"
    )

    features = models.JSONField(default=list, blank=True)

    is_top = models.BooleanField(default=False)
    is_published = models.BooleanField(default=False)
    published_at = models.DateTimeField(null=True, blank=True)

    students_count = models.IntegerField(default=0)
    views_count = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'packages'
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    @property
    def has_discount(self):
        if self.is_free:
            return False
        return self.discounted_price is not None and self.discounted_price < self.price

    @property
    def display_price_str(self):
        if self.is_free:
            return '🎁 رایگان'
        if self.has_discount:
            return f'{int(self.discounted_price):,} تومان'
        return f'{int(self.price):,} تومان'

    @property
    def feature_list(self):
        return self.features if isinstance(self.features, list) else []

    @property
    def topics_list(self):
        return self.topics if isinstance(self.topics, list) else []

    @property
    def topics_count(self):
        return len(self.topics_list)


class UserPackage(models.Model):
    """خرید کاربر و لینک اختصاصی اسپات پلیر"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='purchased_packages')
    package = models.ForeignKey(Package, on_delete=models.CASCADE, related_name='purchased_by')
    license_created_at = models.DateTimeField(null=True, blank=True)

    spot_player_license = models.CharField(
        max_length=200, blank=True, null=True,
        help_text="کد لایسنس اسپات پلیر"
    )
    license_payload = models.JSONField(
        default=dict, blank=True,
        help_text="پاسخ کامل API اسپات پلیر"
    )
    purchased_at = models.DateTimeField(auto_now_add=True)
    expiry_date = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    price_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    class Meta:
        db_table = 'user_packages'
        unique_together = [['user', 'package']]

    def __str__(self):
        return f"{self.user.username} - {self.package.title}"

    def is_valid(self):
        if not self.is_active:
            return False
        if self.expiry_date and self.expiry_date < timezone.now():
            return False
        return True

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        if is_new:
            self.package.students_count += 1
            self.package.save(update_fields=['students_count'])



class VideoPlayLog(models.Model):
    """لاگ پخش ویدیو (برای آنالیز)"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='video_logs')
    package = models.ForeignKey(Package, on_delete=models.CASCADE, related_name='play_logs')

    video_id = models.CharField(max_length=100, help_text="ID ویدیو در اسپات پلیر")
    video_title = models.CharField(max_length=200, blank=True)

    played_at = models.DateTimeField(auto_now_add=True)
    duration_watched = models.IntegerField(default=0)
    completion_percentage = models.IntegerField(default=0)
    is_completed = models.BooleanField(default=False)

    class Meta:
        db_table = 'video_play_logs'
        ordering = ['-played_at']

    def __str__(self):
        return f"{self.user.username} - {self.video_title} - {self.played_at}"