# packages/utils/image_processor.py
"""
پردازش خودکار تصاویر کاور پکیج‌ها
- کراپ به نسبت 16:9
- تغییر سایز به 1280x720
- تبدیل به WebP
- حذف فایل قدیمی
"""
import os
from io import BytesIO
from PIL import Image, ImageOps
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage


# ===== تنظیمات استاندارد =====
TARGET_WIDTH = 1280
TARGET_HEIGHT = 720
ASPECT_RATIO = 16 / 9
MAX_OUTPUT_SIZE_KB = 500
WEBP_QUALITY = 85


def process_package_cover(image_file, filename_prefix='cover'):
    """
    پردازش تصویر کاور:
    1. چرخش خودکار بر اساس EXIF
    2. کراپ وسط به نسبت 16:9
    3. تغییر سایز به 1280x720
    4. تبدیل به WebP
    5. کم‌کردن حجم در صورت نیاز
    """
    if not image_file:
        return None, None

    try:
        img = Image.open(image_file)
        img = ImageOps.exif_transpose(img)

        if img.mode in ('RGBA', 'LA', 'P'):
            background = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
            img = background
        elif img.mode != 'RGB':
            img = img.convert('RGB')

        width, height = img.size
        current_ratio = width / height

        if current_ratio > ASPECT_RATIO:
            new_width = int(height * ASPECT_RATIO)
            left = (width - new_width) // 2
            right = left + new_width
            img = img.crop((left, 0, right, height))
        elif current_ratio < ASPECT_RATIO:
            new_height = int(width / ASPECT_RATIO)
            top = (height - new_height) // 2
            bottom = top + new_height
            img = img.crop((0, top, width, bottom))

        img = img.resize((TARGET_WIDTH, TARGET_HEIGHT), Image.LANCZOS)

        output = BytesIO()
        quality = WEBP_QUALITY
        img.save(output, format='WEBP', quality=quality, method=6)

        while output.tell() > MAX_OUTPUT_SIZE_KB * 1024 and quality > 40:
            output = BytesIO()
            quality -= 10
            img.save(output, format='WEBP', quality=quality, method=6)

        output.seek(0)

        base_name = os.path.splitext(os.path.basename(image_file.name))[0]
        base_name = "".join(c for c in base_name if c.isalnum() or c in ('-', '_'))
        if not base_name:
            base_name = filename_prefix
        new_filename = f"{base_name}.webp"

        content = ContentFile(output.read())
        return content, new_filename

    except Exception as e:
        print(f"⚠️ Image processing failed: {e}")
        return image_file, image_file.name


def delete_old_image(instance, field_name='image'):
    """حذف فایل تصویر قدیمی از storage"""
    if not instance.pk:
        return

    try:
        old_instance = instance.__class__.objects.get(pk=instance.pk)
        old_file = getattr(old_instance, field_name, None)
        new_file = getattr(instance, field_name, None)

        if old_file and old_file.name:
            if not new_file or old_file.name != new_file.name:
                if default_storage.exists(old_file.name):
                    default_storage.delete(old_file.name)
    except instance.__class__.DoesNotExist:
        pass