# 🐳 Docker для WMS Autoparts

## Отдельные Dockerfile для приложения и БД

Этот проект содержит отдельные Dockerfile для независимого запуска приложения и базы данных.

## 📁 Структура

```
├── Dockerfile              # Основной Dockerfile (приложение)
├── Dockerfile.app          # Dockerfile для приложения (альтернативный)
├── Dockerfile.db           # Dockerfile для БД
├── .dockerignore           # Игнорирование файлов для сборки
├── scripts/
│   ├── run-app.sh          # Скрипт управления приложением
│   └── run-db.sh           # Скрипт управления БД
└── docker-compose.yml      # Оркестрация (опционально)
```

## 🚀 Быстрый старт

### 1. Сборка образов

```bash
# Сборка образа приложения
docker build -t wms-autoparts-app:latest -f Dockerfile.app .

# Сборка образа БД
docker build -t wms-autoparts-db:latest -f Dockerfile.db .
```

### 2. Запуск через скрипты

```bash
# Запуск БД
./scripts/run-db.sh start

# Запуск приложения
./scripts/run-app.sh start
```

### 3. Проверка статуса

```bash
./scripts/run-db.sh status
./scripts/run-app.sh status
```

## 📋 Команды управления

### База данных

| Команда | Описание |
|---------|----------|
| `./scripts/run-db.sh start` | Запуск БД |
| `./scripts/run-db.sh stop` | Остановка БД |
| `./scripts/run-db.sh restart` | Перезапуск БД |
| `./scripts/run-db.sh status` | Проверка статуса |
| `./scripts/run-db.sh logs` | Просмотр логов |
| `./scripts/run-db.sh shell` | Подключение к psql |
| `./scripts/run-db.sh build` | Сборка образа |
| `./scripts/run-db.sh clean` | Удаление контейнера и volume |

### Приложение

| Команда | Описание |
|---------|----------|
| `./scripts/run-app.sh start` | Запуск приложения |
| `./scripts/run-app.sh stop` | Остановка приложения |
| `./scripts/run-app.sh restart` | Перезапуск приложения |
| `./scripts/run-app.sh status` | Проверка статуса |
| `./scripts/run-app.sh logs` | Просмотр логов |
| `./scripts/run-app.sh shell` | Подключение к контейнеру |
| `./scripts/run-app.sh build` | Сборка образа |
| `./scripts/run-app.sh clean` | Удаление контейнера и volume |

### Инициализация БД

| Команда | Описание |
|---------|----------|
| `./scripts/init-db.sh` | Применение миграций и загрузка seed данных |

## 🔧 Ручной запуск

### Запуск БД вручную

```bash
# Создание volume
docker volume create wms_autoparts_db_data

# Запуск контейнера
docker run -d \
    --name wms_autoparts_db \
    -p 5435:5432 \
    -e POSTGRES_USER=postgres \
    -e POSTGRES_PASSWORD=postgres \
    -e POSTGRES_DB=wms_autoparts \
    -v wms_autoparts_db_data:/var/lib/postgresql/data \
    --health-cmd "pg_isready -U postgres -d wms_autoparts" \
    --health-interval 10s \
    --health-timeout 5s \
    --health-retries 5 \
    --restart unless-stopped \
    wms-autoparts-db:latest
```

### Запуск приложения вручную

```bash
# Генерация секретного ключа
AUTH_SECRET=$(openssl rand -base64 32)

# Создание volume
docker volume create wms_autoparts_app_uploads

# Запуск контейнера
docker run -d \
    --name wms_autoparts_app \
    -p 3000:3000 \
    -e NODE_ENV=production \
    -e DATABASE_URL="postgresql://postgres:postgres@localhost:5435/wms_autoparts" \
    -e AUTH_SECRET="$AUTH_SECRET" \
    -e AUTH_URL="http://localhost:3000" \
    -e NEXT_PUBLIC_APP_NAME="WMS Autoparts" \
    -e NEXT_PUBLIC_DEFAULT_LOCALE=ru \
    -v wms_autoparts_app_uploads:/app/public/uploads \
    --health-cmd "wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1" \
    --health-interval 30s \
    --health-timeout 10s \
    --health-retries 3 \
    --restart unless-stopped \
    wms-autoparts-app:latest
```

## 🔗 Подключение к БД

```bash
# Из хоста
psql -h localhost -p 5435 -U postgres -d wms_autoparts

# Из контейнера приложения
docker exec -it wms_autoparts_app psql -h postgres -U postgres -d wms_autoparts

# Через скрипт
./scripts/run-db.sh shell
```

## 📊 Переменные окружения

### Приложение

| Переменная | По умолчанию | Описание |
|------------|--------------|----------|
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/wms_autoparts` | URL подключения к БД |
| `AUTH_SECRET` | `your-secret-key...` | Секретный ключ для next-auth |
| `AUTH_URL` | `http://localhost:3000` | URL аутентификации |
| `NEXT_PUBLIC_APP_NAME` | `WMS Autoparts` | Название приложения |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | `ru` | Язык по умолчанию |
| `UPLOAD_DIR` | `/app/public/uploads` | Директория загрузок |
| `MAX_FILE_SIZE` | `5242880` | Макс. размер файла (5MB) |

### База данных

| Переменная | По умолчанию | Описание |
|------------|--------------|----------|
| `POSTGRES_USER` | `postgres` | Пользователь БД |
| `POSTGRES_PASSWORD` | `postgres` | Пароль БД |
| `POSTGRES_DB` | `wms_autoparts` | Имя базы данных |

## 🧹 Очистка

```bash
# Удалить всё
./scripts/run-db.sh clean
./scripts/run-app.sh clean

# Удалить образы
docker rmi wms-autoparts-app:latest
docker rmi wms-autoparts-db:latest
```

## 📝 Примеры использования

### Сценарий 1: Только БД для разработки

```bash
# Запуск БД
./scripts/run-db.sh start

# Подключение из хоста
psql -h localhost -p 5435 -U postgres -d wms_autoparts
```

### Сценарий 2: Полное развёртывание

```bash
# Сборка образов
./scripts/run-db.sh build
./scripts/run-app.sh build

# Запуск
./scripts/run-db.sh start
./scripts/run-app.sh start

# Проверка
./scripts/run-db.sh status
./scripts/run-app.sh status

# Просмотр логов
./scripts/run-app.sh logs
```

### Сценарий 3: Обновление приложения

```bash
# Остановка старого
./scripts/run-app.sh stop
./scripts/run-app.sh clean

# Сборка нового
./scripts/run-app.sh build

# Запуск нового
./scripts/run-app.sh start
```

## 🔍 Health Check

### Приложение
```bash
curl http://localhost:3000/api/health
```

### База данных
```bash
docker exec wms_autoparts_db pg_isready -U postgres -d wms_autoparts
```

## 📄 Лицензия

WMS Autoparts Team © 2026
