# WMS Autoparts - Руководство по запуску

## Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка переменных окружения

Скопируйте `.env.example` в `.env.local`:

```bash
cp .env.example .env.local
```

Отредактируйте `.env.local` и установите:

```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/wms_autoparts?schema=public"

# NextAuth - сгенерируйте новый секрет
AUTH_SECRET="ваш-секретный-ключ"
AUTH_URL="http://localhost:3000"

# Application
NEXT_PUBLIC_APP_NAME="WMS Autoparts"
NEXT_PUBLIC_DEFAULT_LOCALE="ru"
```

Для генерации `AUTH_SECRET`:
```bash
openssl rand -base64 32
```

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

Или используйте docker-compose (файл в разработке).

### 4. Миграции базы данных

```bash
# Генерация миграций
npm run db:generate

# Применение миграций
npm run db:migrate
```

### 5. Запуск приложения

```bash
# Режим разработки
npm run dev

# Production сборка
npm run build
npm run start
```

Приложение будет доступно по адресу: **http://localhost:3000**

## Структура проекта

```
wms_autoparts/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── [locale]/           # Локализация (ru, en, ar)
│   │   │   ├── auth/           # Страницы аутентификации
│   │   │   ├── catalog/        # Каталог запчастей
│   │   │   ├── orders/         # Заказы
│   │   │   ├── stock/          # Склад
│   │   │   ├── admin/          # Админ-панель
│   │   │   └── page.tsx        # Главная страница
│   │   ├── api/                # API Routes
│   │   │   ├── auth/           # NextAuth endpoints
│   │   │   ├── hierarchy/      # API иерархии
│   │   │   ├── parts/          # API запчастей
│   │   │   ├── orders/         # API заказов
│   │   │   ├── stock/          # API склада
│   │   │   ├── users/          # API пользователей
│   │   │   └── roles/          # API ролей
│   │   ├── globals.css         # Глобальные стили
│   │   └── layout.tsx          # Root layout
│   ├── components/             # React компоненты
│   │   ├── ui/                 # Базовые UI компоненты
│   │   ├── layout/             # Layout компоненты
│   │   ├── catalog/            # Компоненты каталога
│   │   ├── cart/               # Компоненты корзины
│   │   ├── orders/             # Компоненты заказов
│   │   ├── stock/              # Компоненты склада
│   │   ├── admin/              # Компоненты админ-панели
│   │   └── shared/             # Общие компоненты
│   ├── lib/                    # Библиотеки и утилиты
│   │   ├── auth/               # NextAuth конфигурация
│   │   ├── db/                 # Drizzle ORM и схема БД
│   │   ├── api/                # API утилиты
│   │   ├── services/           # Бизнес-логика
│   │   ├── stores/             # Zustand stores (корзина)
│   │   ├── hooks/              # Custom React hooks
│   │   ├── utils/              # Утилиты
│   │   ├── config/             # Конфигурация приложения
│   │   └── types/              # TypeScript типы
│   ├── i18n/                   # next-intl конфигурация
│   │   ├── request.ts          # Request config
│   │   └── routing.ts          # Routing config
│   ├── middleware.ts           # Next.js middleware
│   └── types/                  # Дополнительные типы
├── locales/                    # Файлы переводов
│   ├── ru/                     # Русский
│   ├── en/                     # English
│   └── ar/                     # العربية
├── public/
│   └── uploads/                # Загруженные файлы
├── drizzle/
│   └── migrations/             # Миграции БД
├── tests/
│   ├── unit/                   # Unit тесты
│   ├── integration/            # Интеграционные тесты
│   └── e2e/                    # E2E тесты (Playwright)
└── architecture/               # Архитектурные документы
```

## Доступные команды

```bash
# Разработка
npm run dev              # Запуск dev-сервера (http://localhost:3000)
npm run build            # Production сборка
npm run start            # Запуск production-сервера
npm run lint             # ESLint проверка

# База данных
npm run db:generate      # Генерация миграций Drizzle
npm run db:migrate       # Применение миграций
npm run db:push          # Push схемы в БД (для разработки)
npm run db:studio        # Drizzle Studio (GUI для БД)

# Тестирование
npm test                 # Unit-тесты (Jest)
npm run test:e2e         # E2E тесты (Playwright)
```

## Технологический стек

| Компонент | Технология |
|-----------|------------|
| Framework | Next.js 14 (App Router) |
| UI | MUI (Material-UI) v5 |
| ORM | Drizzle ORM |
| Database | PostgreSQL 15+ |
| Auth | next-auth v5 |
| i18n | next-intl |
| State | Zustand |
| PDF | @react-pdf/renderer |
| Validation | Zod |

## Роли пользователей

### MECHANIC (Механик)
- Просмотр каталога запчастей
- Создание заявок (черновиков)
- Редактирование своих черновиков
- Просмотр своих заявок

### REPAIR_MANAGER (Менеджер)
- Все права механика
- Просмотр всех заявок отдела
- Согласование/отклонение заявок
- Назначение приоритета

### STOREKEEPER (Кладовщик)
- Просмотр согласованных заявок
- Отметка о выдаче запчастей
- Управление остатками (приём, списание)
- Просмотр истории остатков

### ADMIN (Администратор)
- Полный доступ ко всем функциям
- Управление пользователями
- Управление справочниками
- Управление ролями и разрешениями

## Следующие шаги

1. **Настроить базу данных** - запустить PostgreSQL и применить миграции
2. **Создать первого пользователя** - через API или напрямую в БД
3. **Разработать основные компоненты**:
   - Дерево иерархии запчастей
   - Список запчастей с поиском
   - Корзина (Zustand)
   - Оформление заказов
4. **Реализовать API endpoints** для всех сущностей
5. **Настроить генерацию PDF** для заказов
6. **Добавить тесты** для критических сценариев

## Поддержка

Документация находится в папке `architecture/`:
- `01-project-structure.md` - Структура проекта
- `02-drizzle-schema.md` - Схема базы данных
- `03-api-endpoints.md` - API endpoints
- `04-frontend-components.md` - Frontend компоненты
- `05-implementation-plan.md` - План реализации
- `ADR-*.md` - Architectural Decision Records
