# ═══════════════════════════════════════════════════════
# Django Backend — Production Image
# ═══════════════════════════════════════════════════════

FROM docker.arvancloud.ir/library/python:3.12-slim-bookworm

# ── Environment ──
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# ── System dependencies ──
# deb.debian.org times out from this server, so point apt at ArvanCloud's Debian mirror
RUN sed -i 's|deb.debian.org|mirror.arvancloud.ir|g; s|security.debian.org|mirror.arvancloud.ir|g' \
        /etc/apt/sources.list.d/debian.sources && \
    apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    netcat-traditional \
    curl \
    && rm -rf /var/lib/apt/lists/*

# ── Working directory ──
WORKDIR /app

# ── Install Python deps ──
COPY requirements.txt .
RUN pip install --upgrade pip setuptools wheel && \
    pip install -r requirements.txt

# ── Copy project ──
COPY . .

# ── Create non-root user ──
RUN useradd -m -u 1000 appuser && \
    mkdir -p /app/staticfiles /app/media /app/logs && \
    chown -R appuser:appuser /app
USER appuser

# ── Entrypoint ──
COPY --chown=appuser:appuser entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# ── Expose port ──
EXPOSE 8000

ENTRYPOINT ["/entrypoint.sh"]