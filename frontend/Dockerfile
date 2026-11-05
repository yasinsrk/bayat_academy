# ═══════════════════════════════════════════════════════
# React Frontend — Multi-Stage Build
# ═══════════════════════════════════════════════════════

# ─── Stage 1: Build ───
FROM docker.arvancloud.ir/library/node:20-alpine AS build

WORKDIR /app

# ── Install deps (layer cache) ──
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# ── Copy source ──
COPY . .

# ── Build args ──
ARG REACT_APP_API_URL=/api
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# ── Build ──
RUN npm run build


# ─── Stage 2: Production (Nginx) ───
FROM docker.arvancloud.ir/library/nginx:1.25-alpine AS production

# ── Remove default nginx config ──
RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/default.conf

# ── Copy build output ──
COPY --from=build /app/build /usr/share/nginx/html

# ── Custom nginx config for SPA ──
COPY nginx.conf /etc/nginx/conf.d/default.conf

# ── Health check ──
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -q --spider http://localhost/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]