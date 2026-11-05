#!/bin/sh
# ═══════════════════════════════════════════════════════
# Django Container Entrypoint
# ═══════════════════════════════════════════════════════

set -e

echo "🚀 Starting Bayat Academy Backend..."

# ── Wait for PostgreSQL (اگه DB_HOST تنظیم شده) ──
if [ -n "$DB_HOST" ]; then
    echo "⏳ Waiting for PostgreSQL at $DB_HOST:$DB_PORT..."
    while ! nc -z "$DB_HOST" "${DB_PORT:-5432}"; do
        sleep 1
    done
    echo "✅ PostgreSQL is ready"
fi

# ── Run migrations ──
echo "🔄 Running migrations..."
python manage.py migrate --noinput

# ── Collect static files ──
echo "📦 Collecting static files..."
python manage.py collectstatic --noinput --clear

# ── Start gunicorn ──
echo "🎯 Starting Gunicorn..."

WORKERS=${GUNICORN_WORKERS:-3}
TIMEOUT=${GUNICORN_TIMEOUT:-120}
PORT=${PORT:-8000}

exec gunicorn bayat.wsgi:application \
    --bind "0.0.0.0:$PORT" \
    --workers "$WORKERS" \
    --timeout "$TIMEOUT" \
    --access-logfile - \
    --error-logfile - \
    --log-level info \
    --max-requests 1000 \
    --max-requests-jitter 100