#!/bin/bash
# Скрипт для запуска Next.js приложения WMS Autoparts
# Использование: ./scripts/run-app.sh [OPTIONS]

set -e

# Конфигурация
CONTAINER_NAME="wms_autoparts_app"
IMAGE_NAME="wms-autoparts-app:latest"
APP_PORT="${APP_PORT:-3000}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5435}"
VOLUME_NAME="wms_autoparts_app_uploads"

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
        log "Запуск приложения..."
        
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
            # Генерируем секретный ключ если не задан
            if [ -z "$AUTH_SECRET" ]; then
                AUTH_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "your-secret-key-change-in-production")
            fi
            
            # Создаем и запускаем новый контейнер
            log "Создание и запуск контейнера..."
            docker run -d \
                --name "$CONTAINER_NAME" \
                -p "$APP_PORT:3000" \
                -e NODE_ENV=production \
                -e DATABASE_URL="postgresql://postgres:postgres@${DB_HOST}:${DB_PORT}/wms_autoparts" \
                -e AUTH_SECRET="$AUTH_SECRET" \
                -e AUTH_URL="http://localhost:$APP_PORT" \
                -e NEXT_PUBLIC_APP_NAME="WMS Autoparts" \
                -e NEXT_PUBLIC_DEFAULT_LOCALE=ru \
                -e UPLOAD_DIR=/app/public/uploads \
                -e MAX_FILE_SIZE=5242880 \
                -v "$VOLUME_NAME:/app/public/uploads" \
                --health-cmd "wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1" \
                --health-interval 30s \
                --health-timeout 10s \
                --health-retries 3 \
                --health-start-period 40s \
                --restart unless-stopped \
                "$IMAGE_NAME"
        fi
        
        log "Ожидание запуска приложения..."
        sleep 10
        
        # Проверка статуса
        if docker ps -q -f name="$CONTAINER_NAME" | grep -q .; then
            log "✅ Приложение успешно запущено!"
            echo ""
            echo "  Контейнер: $CONTAINER_NAME"
            echo "  Порт: $APP_PORT -> 3000"
            echo "  URL: http://localhost:$APP_PORT"
            echo ""
            echo "  Health check: http://localhost:$APP_PORT/api/health"
            echo "  Логи: docker logs -f $CONTAINER_NAME"
            echo ""
        else
            error "Не удалось запустить приложение. Проверьте логи:"
            echo "  docker logs $CONTAINER_NAME"
            exit 1
        fi
        ;;
        
    stop)
        log "Остановка приложения..."
        docker stop "$CONTAINER_NAME" 2>/dev/null || warn "Контейнер не найден"
        log "✅ Приложение остановлено"
        ;;
        
    restart)
        log "Перезапуск приложения..."
        docker restart "$CONTAINER_NAME" 2>/dev/null || warn "Контейнер не найден"
        log "✅ Приложение перезапущено"
        ;;
        
    status)
        if docker ps -q -f name="$CONTAINER_NAME" | grep -q .; then
            log "✅ Приложение запущено"
            docker ps -f name="$CONTAINER_NAME" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
        elif docker ps -aq -f name="$CONTAINER_NAME" | grep -q .; then
            warn "⏸️  Приложение остановлено"
            docker ps -aq -f name="$CONTAINER_NAME" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
        else
            warn "❌ Приложение не установлено"
        fi
        ;;
        
    logs)
        docker logs -f "$CONTAINER_NAME"
        ;;
        
    shell)
        log "Подключение к контейнеру..."
        docker exec -it "$CONTAINER_NAME" sh
        ;;
        
    build)
        log "Сборка образа приложения..."
        docker build -t "$IMAGE_NAME" -f Dockerfile.app .
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
        echo "  start   - Запуск приложения"
        echo "  stop    - Остановка приложения"
        echo "  restart - Перезапуск приложения"
        echo "  status  - Проверка статуса"
        echo "  logs    - Просмотр логов"
        echo "  shell   - Подключение к контейнеру"
        echo "  build   - Сборка образа"
        echo "  clean   - Удаление контейнера и volume"
        exit 1
        ;;
esac
