# packages/serializers.py
from rest_framework import serializers
from django.utils.text import slugify
from .models import Package, UserPackage, Category
import json
from .utils.image_processor import process_package_cover, delete_old_image
import os


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']


class PackageSerializer(serializers.ModelSerializer):
    feature_list = serializers.SerializerMethodField()
    has_discount = serializers.SerializerMethodField()
    display_price_str = serializers.SerializerMethodField()
    topics_list = serializers.SerializerMethodField()
    topics_count = serializers.SerializerMethodField()
    categories = CategorySerializer(many=True, read_only=True)

    category_ids = serializers.JSONField(
        write_only=True,
        required=False,
        default=list
    )

    class Meta:
        model = Package
        fields = (
            'id', 'title', 'slug', 'description',
            'price', 'discounted_price', 'is_free',
            'image', 'image_url',
            'introduction_video', 'introduction_video_url',
            'duration', 'topics',
            'features', 'feature_list',
            'topics_list', 'topics_count',
            'is_published', 'published_at', 'views_count', 'students_count',
            'is_top', 'has_discount',
            'display_price_str',
            'categories', 'category_ids',
            'created_at', 'updated_at',
            'spot_player_course_id',
        )
        read_only_fields = (
            'id', 'views_count', 'students_count',
            'created_at', 'updated_at', 'feature_list',
            'has_discount', 'display_price_str',
            'topics_list', 'topics_count'
        )

    # ===== متدهای نمایش =====
    def get_feature_list(self, obj):
        return obj.feature_list

    def get_topics_list(self, obj):
        return obj.topics_list

    def get_topics_count(self, obj):
        return obj.topics_count

    def get_has_discount(self, obj):
        return obj.has_discount

    def get_display_price_str(self, obj):
        return obj.display_price_str

    # ===== اعتبارسنجی تصویر =====
    def validate_image(self, value):
        """اعتبارسنجی فایل تصویر قبل از پردازش"""
        if value is None:
            return value

        # چک حجم (حداکثر 10 مگابایت)
        if value.size > 10 * 1024 * 1024:
            raise serializers.ValidationError(
                "حجم تصویر نباید بیشتر از ۱۰ مگابایت باشد"
            )

        # چک پسوند
        valid_extensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp']
        ext = os.path.splitext(value.name)[1].lower()
        if ext not in valid_extensions:
            raise serializers.ValidationError(
                f"فرمت تصویر نامعتبر است. فرمت‌های مجاز: JPG, PNG, WebP"
            )

        return value

    # ===== اعتبارسنجی category_ids =====
    def validate_category_ids(self, value):
        """Parse category_ids from various formats"""
        if value is None or value == '':
            return []

        if isinstance(value, list):
            try:
                return [int(item) for item in value if item is not None]
            except (ValueError, TypeError):
                return []

        if isinstance(value, str):
            try:
                parsed = json.loads(value)
                if isinstance(parsed, list):
                    return [int(item) for item in parsed if item is not None]
                return []
            except json.JSONDecodeError:
                try:
                    return [int(x.strip()) for x in value.split(',') if x.strip()]
                except:
                    return []

        return []

    # ===== ایجاد پکیج جدید =====
    def create(self, validated_data):
        category_ids = validated_data.pop('category_ids', [])

        if not isinstance(category_ids, list):
            category_ids = []

        # ===== پردازش تصویر =====
        image = validated_data.get('image')
        if image:
            processed, new_name = process_package_cover(image, filename_prefix='cover')
            if processed:
                processed.name = new_name
                validated_data['image'] = processed

        # ===== ساخت slug یکتا =====
        if 'slug' not in validated_data or not validated_data['slug']:
            base_slug = slugify(validated_data['title'], allow_unicode=True)
            slug = base_slug
            counter = 1
            while Package.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            validated_data['slug'] = slug

        package = Package.objects.create(**validated_data)

        if category_ids:
            package.categories.set(category_ids)

        return package

    # ===== آپدیت پکیج =====
    def update(self, instance, validated_data):
        category_ids = validated_data.pop('category_ids', None)

        # ===== چک کن اگه کاربر می‌خواد ویدیو یا تصویر رو حذف کنه =====
        remove_video = self.context['request'].data.get('remove_introduction_video') == 'true'
        remove_image = self.context['request'].data.get('remove_image') == 'true'

        # ===== حذف ویدیو =====
        if remove_video:
            if instance.introduction_video:
                instance.introduction_video.delete(save=False)
            instance.introduction_video = None
            instance.introduction_video_url = ''

        # ===== حذف تصویر =====
        if remove_image:
            if instance.image:
                instance.image.delete(save=False)
            instance.image = None
            instance.image_url = ''

        # ===== پردازش تصویر جدید =====
        new_image = validated_data.get('image')
        if new_image and not remove_image:
            # حذف فایل قدیمی
            delete_old_image(instance, 'image')

            # پردازش فایل جدید
            processed, new_name = process_package_cover(new_image, filename_prefix='cover')
            if processed:
                processed.name = new_name
                validated_data['image'] = processed

        # ===== اعمال تغییرات =====
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        if category_ids is not None:
            if isinstance(category_ids, list):
                instance.categories.set(category_ids)

        return instance

class PackageDetailSerializer(PackageSerializer):
    class Meta(PackageSerializer.Meta):
        fields = PackageSerializer.Meta.fields


class UserPackageSerializer(serializers.ModelSerializer):
    package_detail = PackageSerializer(source='package', read_only=True)

    class Meta:
        model = UserPackage
        fields = (
            'id', 'user', 'package', 'package_detail',
            'spot_player_license',  # ← این تغییر کرد
            'license_created_at',   # ← اضافه شد
            'purchased_at', 'expiry_date',
            'is_active', 'price_paid'
        )
        read_only_fields = (
            'id', 'purchased_at',
            'spot_player_license',   # ← read-only چون فقط سرور میسازه
            'license_created_at',    # ← read-only
        )


class PackageAccessSerializer(serializers.Serializer):
    has_access = serializers.BooleanField()
    package_id = serializers.IntegerField()
    package_title = serializers.CharField()
    is_free = serializers.BooleanField()
    message = serializers.CharField(required=False)


class SpotPlayerLicenseSerializer(serializers.Serializer):
    """Serializer برای پاسخ لایسنس اسپات پلیر"""
    license = serializers.CharField()
    package_title = serializers.CharField()
    created_at = serializers.DateTimeField()
    spot_player_url = serializers.CharField(required=False, allow_blank=True)