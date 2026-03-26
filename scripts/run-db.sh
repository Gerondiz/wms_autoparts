#!/bin/bash
# Скрипт для запуска PostgreSQL БД WMS Autoparts
# Использование: ./scripts/run-db.sh [OPTIONS]

set -e

# Конфигурация
CONTAINER_NAME="wms_autoparts_db"
IMAGE_NAME="wms-autoparts-db:latest"
DB_PORT="${DB_PORT:-5435}"
POSTGRES_USER="${POSTGRES_USER:-postgres}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-postgres}"
POSTGRES_DB="${POSTGRES_DB:-wms_autoparts}"
VOLUME_NAME="wms_autoparts_db_data"

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Функция вывода сообщений
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

# Парсинг аргументов
ACTION="${1:-start}"

case "$ACTION" in
    start)
        log "Запуск PostgreSQL БД..."
        
        # Создаем volume если не существует
        docker volume create "$VOLUME_NAME" 2>/dev/null || true
        
        # Проверяем, запущен ли уже контейнер
        if docker ps -q -f name="$CONTAINER_NAME" | grep -q .; then
            warn "Контейнер $CONTAINER_NAME уже запущен"
            exit 0
        fi
        
        # Проверяем, существует ли контейнер (остановлен)
        if docker ps -aq -f name="$CONTAINER_NAME" | grep -q .; then
            log "Запуск остановленного контейнера..."
            docker start "$CONTAINER_NAME"
        else
            # Создаем и запускаем новый контейнер
            log "Создание и запуск контейнера..."
            docker run -d \
                --name "$CONTAINER_NAME" \
                -p "$DB_PORT:5432" \
                -e POSTGRES_USER="$POSTGRES_USER" \
                -e POSTGRES_PASSWORD="$POSTGRES_PASSWORD" \
                -e POSTGRES_DB="$POSTGRES_DB" \
                -v "$VOLUME_NAME:/var/lib/postgresql/data" \
                -v "$(pwd)/init-db.sh:/docker-entrypoint-initdb.d/init-db.sh:ro" \
                --health-cmd "pg_isready -U postgres -d wms_autoparts" \
                --health-interval 10s \
                --health-timeout 5s \
                --health-retries 5 \
                --restart unless-stopped \
                "$IMAGE_NAME"
        fi
        
        log "Ожидание готовности БД..."
        sleep 5
        
        # Проверка статуса
        if docker ps -q -f name="$CONTAINER_NAME" | grep -q .; then
            log "✅ БД успешно запущена!"
            echo ""
            echo "  Контейнер: $CONTAINER_NAME"
            echo "  Порт: $DB_PORT -> 5432"
            echo "  База данных: $POSTGRES_DB"
            echo "  Пользователь: $POSTGRES_USER"
            echo ""
            echo "  Подключение:"
            echo "    docker exec -it $CONTAINER_NAME psql -U postgres -d wms_autoparts"
            echo ""
        else
            error "Не удалось запустить БД. Проверьте логи:"
            echo "  docker logs $CONTAINER_NAME"
            exit 1
        fi
        ;;
        
    stop)
        log "Остановка БД..."
        docker stop "$CONTAINER_NAME" 2>/dev/null || warn "Контейнер не найден"
        log "✅ БД остановлена"
        ;;
        
    restart)
        log "Перезапуск БД..."
        docker restart "$CONTAINER_NAME" 2>/dev/null || warn "Контейнер не найден"
        log "✅ БД перезапущена"
        ;;
        
    status)
        if docker ps -q -f name="$CONTAINER_NAME" | grep -q .; then
            log "✅ БД запущена"
            docker ps -f name="$CONTAINER_NAME" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
        elif docker ps -aq -f name="$CONTAINER_NAME" | grep -q .; then
            warn "⏸️  БД остановлена"
            docker ps -aq -f name="$CONTAINER_NAME" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
        else
            warn "❌ БД не установлена"
        fi
        ;;
        
    logs)
        docker logs -f "$CONTAINER_NAME"
        ;;
        
    shell)
        log "Подключение к БД..."
        docker exec -it "$CONTAINER_NAME" psql -U postgres -d wms_autoparts
        ;;
        
    build)
        log "Сборка образа БД..."
        docker build -t "$IMAGE_NAME" -f Dockerfile.db .
        log "✅ Образ собран"
        ;;
        
    clean)
        log "Очистка..."
        docker stop "$CONTAINER_NAME" 2>/dev/null || true
        docker rm "$CONTAINER_NAME" 2>/dev/null || true
        docker volume rm "$VOLUME_NAME" 2>/dev/null || true
        log "✅ Очистка завершена"
        ;;
        
    *)
        echo "Использование: $0 {start|stop|restart|status|logs|shell|build|clean}"
        echo ""
        echo "Команды:"
        echo "  start   - Запуск БД"
        echo "  stop    - Остановка БД"
        echo "  restart - Перезапуск БД"
        echo "  status  - Проверка статуса"
        echo "  logs    - Просмотр логов"
        echo "  shell   - Подключение к psql"
        echo "  build   - Сборка образа"
        echo "  clean   - Удаление контейнера и volume"
        exit 1
        ;;
esac
