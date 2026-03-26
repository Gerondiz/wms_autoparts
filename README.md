# WMS Autoparts - Система управления заказами на автозапчасти

Внутренняя система управления заказами на автозапчасти для работы в локальной сети организации.

## Технологический стек

- **Frontend/Backend**: Next.js 14 (App Router)
- **UI библиотека**: MUI (Material-UI)
- **ORM**: Drizzle ORM
- **База данных**: PostgreSQL 15+
- **Аутентификация**: next-auth v5
- **Мультиязычность**: next-intl (RU, EN, AR)
- **State management**: Zustand
- **Генерация PDF**: @react-pdf/renderer
- **Контейнеризация**: Docker

## Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка переменных окружения

Скопируйте `.env.example` в `.env.local` и настройте переменные:

```bash
cp .env.example .env.local
```

Отредактируйте `.env.local`:
- `DATABASE_URL` - строка подключения к PostgreSQL
- `AUTH_SECRET` - секретный ключ для next-auth (сгенерируйте через `openssl rand -base64 32`)
- `AUTH_URL` - URL приложения (по умолчанию `http://localhost:3000`)

### 3. Запуск базы данных (Docker)

```bash
docker run -d \
  --name wms-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=wms_autoparts \
  -p 5432:5432 \
  postgres:15
```

### 4. Миграции базы данных

```bash
npm run db:generate
npm run db:migrate
```

### 5. Запуск приложения

```bash
npm run dev
```

Приложение будет доступно по адресу: http://localhost:3000

## Структура проекта

```
wms_autoparts/
├── src/
│   ├── app/                    # App Router
│   │   ├── [locale]/           # Локализация
│   │   │   ├── auth/           # Аутентификация
│   │   │   ├── catalog/        # Каталог
│   │   │   ├── orders/         # Заказы
│   │   │   ├── stock/          # Склад
│   │   │   ├── admin/          # Админ-панель
│   │   │   └── page.tsx        # Главная
│   │   ├── api/                # API Routes
│   │   └── layout.tsx          # Root layout
│   ├── components/             # React компоненты
│   │   ├── ui/                 # Базовые UI компоненты
│   │   ├── layout/             # Layout компоненты
│   │   ├── catalog/            # Компоненты каталога
│   │   ├── orders/             # Компоненты заказов
│   │   ├── stock/              # Компоненты склада
│   │   ├── admin/              # Компоненты админ-панели
│   │   └── shared/             # Общие компоненты
│   ├── lib/                    # Библиотеки и утилиты
│   │   ├── auth/               # Аутентификация
│   │   ├── db/                 # База данных (Drizzle)
│   │   ├── api/                # API утилиты
│   │   ├── services/           # Бизнес-логика
│   │   ├── stores/             # Zustand stores
│   │   ├── hooks/              # Custom hooks
│   │   ├── utils/              # Утилиты
│   │   ├── config/             # Конфигурация
│   │   └── types/              # TypeScript типы
│   ├── i18n/                   # Интернационализация
│   └── middleware.ts           # Next.js middleware
├── locales/                    # Файлы переводов
│   ├── ru/
│   ├── en/
│   └── ar/
├── public/
│   └── uploads/                # Загруженные файлы
├── drizzle/
│   └── migrations/             # Миграции БД
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
```

## Роли и права доступа

### Базовые роли

| Роль | Описание |
|------|----------|
| MECHANIC | Просмотр каталога, создание заявок |
| REPAIR_MANAGER | Согласование заявок, назначение приоритета |
| STOREKEEPER | Управление остатками, выдача запчастей |
| ADMIN | Полный доступ, управление пользователями и ролями |

### Разрешения

- `catalog_view` - просмотр каталога
- `order_create` - создание заказа
- `order_edit_own_draft` - редактирование своих черновиков
- `order_view_own` - просмотр своих заказов
- `order_view_all` - просмотр всех заказов
- `order_approve` - согласование заказов
- `order_fulfill` - выдача запчастей
- `stock_manage` - управление остатками
- `stock_view_history` - просмотр истории остатков
- `user_manage` - управление пользователями
- `role_manage` - управление ролями
- `hierarchy_manage` - управление иерархией
- `parts_manage` - управление запчастями
- `reports_view` - просмотр аналитики
- `settings_access` - доступ к настройкам

## Доступные команды

```bash
# Разработка
npm run dev              # Запуск dev-сервера
npm run build            # Сборка приложения
npm run start            # Запуск production-сервера
npm run lint             # Проверка ESLint

# База данных
npm run db:generate      # Генерация миграций
npm run db:migrate       # Применение миграций
npm run db:push          # Push схемы в БД
npm run db:studio        # Drizzle Studio

# Тестирование
npm test                 # Unit-тесты
npm run test:e2e         # E2E тесты
```

## API Endpoints

### Аутентификация
- `POST /api/auth/signin` - Вход
- `POST /api/auth/signout` - Выход

### Иерархия
- `GET /api/hierarchy/children?parentId=...` - Дочерние узлы
- `GET /api/hierarchy/path/:id` - Путь узла

### Запчасти
- `GET /api/parts?nodeId=...` - Список запчастей
- `GET /api/parts/search?q=...` - Поиск
- `POST /api/parts` - Создание
- `PUT /api/parts/:id` - Обновление
- `DELETE /api/parts/:id` - Удаление

### Заказы
- `GET /api/orders` - Список заказов
- `POST /api/orders` - Создание заказа
- `PUT /api/orders/:id` - Обновление
- `POST /api/orders/:id/submit` - Отправка
- `POST /api/orders/:id/approve` - Согласование
- `POST /api/orders/:id/reject` - Отклонение
- `POST /api/orders/:id/fulfill` - Выдача

### Склад
- `GET /api/stock` - Остатки
- `POST /api/stock/receipt` - Приход
- `POST /api/stock/write-off` - Списание
- `GET /api/stock/history` - История

### Пользователи и роли
- `GET /api/users` - Список пользователей
- `POST /api/users` - Создание
- `GET /api/roles` - Список ролей
- `POST /api/roles` - Создание роли

## Лицензия

Внутренний проект организации.
