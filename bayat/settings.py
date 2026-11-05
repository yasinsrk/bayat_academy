"""
Django settings for bayat project.
"""

from pathlib import Path
from datetime import timedelta
import os
from dotenv import load_dotenv

# ── بارگذاری .env ──
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / '.env')


# ═══════════════════════════════════════════════════════
# SECURITY
# ═══════════════════════════════════════════════════════

SECRET_KEY = os.environ.get(
    'DJANGO_SECRET_KEY',
    'django-insecure-dev-only-change-this'
)

DEBUG = os.environ.get('DJANGO_DEBUG', 'True') == 'True'

ALLOWED_HOSTS = [
    h.strip() for h in os.environ.get(
        'DJANGO_ALLOWED_HOSTS',
        'localhost,127.0.0.1'
    ).split(',') if h.strip()
]


# ═══════════════════════════════════════════════════════
# APPLICATIONS
# ═══════════════════════════════════════════════════════

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_filters',

    'accounts',
    'packages',
    'payments',
    'tickets',
    'audit',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'audit.middleware.AuditMiddleware',
]

ROOT_URLCONF = 'bayat.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'bayat.wsgi.application'


# ═══════════════════════════════════════════════════════
# DATABASE — خودکار تشخیص SQLite یا PostgreSQL
# ═══════════════════════════════════════════════════════

if os.environ.get('DB_HOST'):
    # production → PostgreSQL
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.environ.get('DB_NAME', 'bayat_db'),
            'USER': os.environ.get('DB_USER', 'bayat_user'),
            'PASSWORD': os.environ.get('DB_PASSWORD', ''),
            'HOST': os.environ.get('DB_HOST', 'db'),
            'PORT': os.environ.get('DB_PORT', '5432'),
            'CONN_MAX_AGE': 600,
        }
    }
else:
    # لوکال → SQLite
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }


# ═══════════════════════════════════════════════════════
# PASSWORD VALIDATION
# ═══════════════════════════════════════════════════════

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]


# ═══════════════════════════════════════════════════════
# I18N
# ═══════════════════════════════════════════════════════

LANGUAGE_CODE = 'fa-ir'
TIME_ZONE = 'Asia/Tehran'
USE_I18N = True
USE_TZ = True


# ═══════════════════════════════════════════════════════
# STATIC & MEDIA
# ═══════════════════════════════════════════════════════

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

AUTH_USER_MODEL = 'accounts.User'


# ═══════════════════════════════════════════════════════
# CORS
# ═══════════════════════════════════════════════════════

if DEBUG:
    CORS_ALLOW_ALL_ORIGINS = True
    CORS_ALLOW_CREDENTIALS = True
else:
    CORS_ALLOW_ALL_ORIGINS = False
    CORS_ALLOW_CREDENTIALS = True

    _frontend_urls = [
        u.strip() for u in os.environ.get(
            'FRONTEND_URL', 'https://yourdomain.com'
        ).split(',') if u.strip()
    ]
    CORS_ALLOWED_ORIGINS = _frontend_urls
    CSRF_TRUSTED_ORIGINS = _frontend_urls


# ═══════════════════════════════════════════════════════
# REST FRAMEWORK
# ═══════════════════════════════════════════════════════

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.AllowAny',
    ),
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}


# ═══════════════════════════════════════════════════════
# JWT
# ═══════════════════════════════════════════════════════

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=12),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=3),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}


# ═══════════════════════════════════════════════════════
# ZARINPAL
# ═══════════════════════════════════════════════════════

ZARINPAL_MERCHANT_ID = os.environ.get('ZARINPAL_MERCHANT_ID', '')
ZARINPAL_CALLBACK_URL = os.environ.get(
    'ZARINPAL_CALLBACK_URL',
    'http://localhost:3000/payment/verify'
)
ZARINPAL_SANDBOX = os.environ.get('ZARINPAL_SANDBOX', 'True') == 'True'


# ═══════════════════════════════════════════════════════
# FRONTEND
# ═══════════════════════════════════════════════════════

FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:3000')


# ═══════════════════════════════════════════════════════
# SPOTPLAYER
# ═══════════════════════════════════════════════════════

SPOTPLAYER_API_KEY = os.environ.get('SPOTPLAYER_API_KEY', '')

# ═══════════════════════════════════════════════════════
# SMS.IR
# ═══════════════════════════════════════════════════════

SMSIR_API_KEY = os.environ.get('SMSIR_API_KEY', '')
SMSIR_TEMPLATE_ID = os.environ.get('SMSIR_TEMPLATE_ID', '')
SMSIR_LINE_NUMBER = os.environ.get('SMSIR_LINE_NUMBER', '')


# ═══════════════════════════════════════════════════════
# PRODUCTION SECURITY (فقط وقتی DEBUG=False)
# ═══════════════════════════════════════════════════════

if not DEBUG:
    # HTTPS اجباری (Nginx سرور SSL رو terminate می‌کنه)
    SECURE_SSL_REDIRECT = False
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

    # Cookies امن
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    CSRF_COOKIE_SAMESITE = 'Lax'

    # HSTS
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True

    # امنیت محتوا
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_BROWSER_XSS_FILTER = True
    X_FRAME_OPTIONS = 'DENY'
    SECURE_REFERRER_POLICY = 'same-origin'

    USE_X_FORWARDED_HOST = True

    # Password hasher قوی‌تر
    PASSWORD_HASHERS = [
        'django.contrib.auth.hashers.Argon2PasswordHasher',
        'django.contrib.auth.hashers.PBKDF2PasswordHasher',
        'django.contrib.auth.hashers.PBKDF2SHA1PasswordHasher',
        'django.contrib.auth.hashers.BCryptSHA256PasswordHasher',
    ]

