#!/bin/bash
# Скрипт инициализации базы данных для WMS Autoparts

set -e

echo "🚀 Инициализация базы данных WMS Autoparts..."

# Ждем доступности PostgreSQL
echo "⏳ Ожидание доступности PostgreSQL..."
until pg_isready -U postgres -d wms_autoparts; do
  echo "  PostgreSQL недоступен, ожидание..."
  sleep 2
done

echo "✅ PostgreSQL доступен"

# Создаем расширения если нужны
echo "📦 Создание расширений..."
psql -U postgres -d wms_autoparts -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";" || true

echo "✅ База данных готова к использованию"
echo "📊 База данных: wms_autoparts"
echo "👤 Пользователь: postgres"
echo "🔌 Порт: 5432"
