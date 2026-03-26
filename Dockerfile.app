# Dockerfile для Next.js приложения WMS Autoparts
# Использование: docker build -t wms-autoparts-app .
# Запуск: docker run -d -p 3000:3000 --name wms_app wms-autoparts-app

# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Копируем файлы зависимостей
COPY package.json package-lock.json ./

# Устанавливаем зависимости
RUN npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Копируем зависимости из предыдущей стадии
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Генерируем клиент Next.js для правильного кэширования
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build приложения
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Копируем необходимые файлы из builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Создаем директорию для загрузок
RUN mkdir -p /app/public/uploads && chown -R nextjs:nodejs /app/public/uploads

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Переменные окружения (можно переопределить при запуске)
ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/wms_autoparts"
ENV AUTH_SECRET="your-secret-key-change-in-production"
ENV AUTH_URL="http://localhost:3000"
ENV NEXT_PUBLIC_APP_NAME="WMS Autoparts"
ENV NEXT_PUBLIC_DEFAULT_LOCALE="ru"
ENV UPLOAD_DIR="/app/public/uploads"
ENV MAX_FILE_SIZE="5242880"

CMD ["node", "server.js"]
