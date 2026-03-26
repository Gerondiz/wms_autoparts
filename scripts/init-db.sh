#!/bin/bash
# Скрипт инициализации БД для WMS Autoparts
# Использование: ./scripts/init-db.sh

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Проверка наличия Docker
if ! command -v docker &> /dev/null; then
    error "Docker не найден. Установите Docker."
    exit 1
fi

# Проверка запущенной БД
if ! docker ps -q -f name="wms_autoparts_db" | grep -q .; then
    error "БД не запущена. Запустите БД: ./scripts/run-db.sh start"
    exit 1
fi

log "Инициализация базы данных WMS Autoparts...\n"

# Применение миграций
log "1. Применение миграций..."
if docker exec -i wms_autoparts_db psql -U postgres -d wms_autoparts -c "\dt" 2>&1 | grep -q "node_types"; then
    warn "Таблицы уже существуют, пропускаем миграции"
else
    if [ -f "drizzle/migrations/0000_furry_nebula.sql" ]; then
        docker exec -i wms_autoparts_db psql -U postgres -d wms_autoparts < drizzle/migrations/0000_furry_nebula.sql > /dev/null 2>&1
        log "   ✅ Миграции применены"
    else
        error "Файл миграций не найден: drizzle/migrations/0000_furry_nebula.sql"
        exit 1
    fi
fi

# Запуск seed данных
log "2. Загрузка seed данных..."
npm run db:seed > /dev/null 2>&1

if [ $? -eq 0 ]; then
    log "   ✅ Seed данные загружены\n"
    
    echo "============================================"
    echo "✅ База данных успешно инициализирована!"
    echo "============================================"
    echo ""
    echo "📋 Учётные данные для входа:"
    echo "   Admin:     admin@wms.local     / Admin123!"
    echo "   Mechanic:  mechanic@wms.local  / Mechanic123!"
    echo "   Manager:   manager@wms.local   / Manager123!"
    echo "   Storekeeper: storekeeper@wms.local / Storekeeper123!"
    echo ""
    echo "🔗 Подключение к БД:"
    echo "   docker exec -it wms_autoparts_db psql -U postgres -d wms_autoparts"
    echo ""
else
    error "Ошибка при загрузке seed данных"
    exit 1
fi
