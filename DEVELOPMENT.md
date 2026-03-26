# 🛠️ Разработка WMS Autoparts

## ⚠️ Важное замечание о middleware

Next.js 15 имеет ограничения на использование middleware в dev режиме. При запуске `npm run dev` возникает ошибка:
```
EvalError: Code generation from strings disallowed for this context
```

## ✅ Рекомендуемый способ разработки

### Использование Docker (рекомендуется)

```bash
# Запуск через docker-compose (production сборка)
docker-compose up -d

# Доступ к приложению
http://localhost:3000
```

### Раздельный запуск

```bash
# 1. Запуск БД
./scripts/run-db.sh start

# 2. Применение миграций и seed
./scripts/init-db.sh

# 3. Запуск приложения (production)
./scripts/run-app.sh start
```

## 🔧 Локальная разработка (с ограничениями)

Если нужно разрабатывать с hot-reload:

### Вариант 1: Отключить middleware

```bash
# Временно переименовать middleware
mv src/middleware.ts src/middleware.ts.disabled

# Очистить кэш
rm -rf .next

# Запустить dev сервер
npm run dev
```

**Ограничения:**
- ❌ Не работает i18n роутинг (нужно заходить на `/ru` напрямую)
- ❌ Не работает проверка аутентификации
- ❌ Не работают RTL cookie для арабского

### Вариант 2: Использовать production сборку локально

```bash
# Собрать
npm run build

# Запустить
npm start
```

**Преимущества:**
- ✅ Работает middleware
- ✅ Полная функциональность
- ✅ Быстрая сборка

**Недостатки:**
- ❌ Нет hot-reload
- ❌ Нужно пересобирать при каждом изменении

## 📝Workflow для разработки

### 1. Внесение изменений в код

```bash
# Отключить middleware
mv src/middleware.ts src/middleware.ts.disabled

# Запустить dev сервер
npm run dev

# Внести изменения в компоненты
```

### 2. Проверка функциональности

```bash
# Остановить dev сервер
pkill -f "next dev"

# Включить middleware обратно
mv src/middleware.ts.disabled src/middleware.ts

# Собрать production версию
npm run build

# Запустить
npm start

# Проверить всю функциональность
```

### 3. Деплой

```bash
# Пересобрать Docker образ
./scripts/run-app.sh build

# Запустить
./scripts/run-app.sh start
```

## 🐛 Частые проблемы

### Middleware ошибка в dev

**Проблема:** `EvalError: Code generation from strings disallowed`

**Решение:** Отключить middleware или использовать production сборку

### Данные не загружаются из БД

**Проблема:** Каталог пустой

**Решение:**
```bash
# Проверить БД
docker exec -i wms_autoparts_db psql -U postgres -d wms_autoparts -c "SELECT COUNT(*) FROM parts;"

# Применить миграции
docker exec -i wms_autoparts_db psql -U postgres -d wms_autoparts < drizzle/migrations/0000_furry_nebula.sql

# Загрузить seed
npm run db:seed
```

### i18n не работает

**Проблема:** Страницы без локализации

**Решение:** Заходить напрямую на `/ru`, `/en`, `/ar`
- http://localhost:3000/ru
- http://localhost:3000/en
- http://localhost:3000/ar

## 🔗 Полезные команды

```bash
# Проверка статуса
./scripts/run-db.sh status
./scripts/run-app.sh status

# Логи
docker logs -f wms_autoparts_db
docker logs -f wms_autoparts_app

# Подключение к БД
docker exec -it wms_autoparts_db psql -U postgres -d wms_autoparts

# Очистка кэша Next.js
rm -rf .next

# Переустановка зависимостей
rm -rf node_modules package-lock.json
npm install
```

## 📊 Тестирование

```bash
# Unit тесты
npm test

# E2E тесты
npm run test:e2e

# Покрытие
npm run test:coverage
```

## 🎯 Итог

| Режим | Middleware | Hot-reload | Рекомендуется |
|-------|-----------|------------|---------------|
| Docker (production) | ✅ | ❌ | ✅ Для тестирования |
| Dev (npm run dev) | ❌ | ✅ | ✅ Для разработки компонентов |
| Production (npm run build + start) | ✅ | ❌ | ✅ Для финальной проверки |
