# Security Implementation: NextAuth v5 с ролевой системой

## Обзор реализации

Реализована полная система аутентификации и авторизации для WMS Autoparts на базе **NextAuth v5** с ролевой моделью и проверкой разрешений (permissions).

---

## 📁 Структура файлов

```
src/
├── lib/
│   ├── auth/
│   │   ├── index.ts              # Конфигурация NextAuth v5
│   │   └── types.ts              # Расширение типов NextAuth
│   ├── db/
│   │   ├── adapter.ts            # Drizzle Adapter для NextAuth
│   │   └── schema/index.ts       # Схема БД + таблицы NextAuth
│   ├── config/
│   │   └── permissions.ts        # Система разрешений
│   └── hooks/
│       └── usePermission.tsx     # Хук для проверки разрешений
├── middleware.ts                 # Middleware с проверкой прав + i18n
└── app/
    ├── api/auth/[...nextauth]/
    │   └── route.ts              # API endpoint NextAuth
    └── [locale]/auth/
        ├── signin/page.tsx       # Страница входа
        ├── signout/page.tsx      # Страница выхода
        └── access-denied/page.tsx # Страница "Доступ запрещён"
```

---

## 🔐 Компоненты системы

### 1. Конфигурация NextAuth (`src/lib/auth/index.ts`)

**Провайдеры:**
- **Credentials Provider** — аутентификация по email + password
- **bcryptjs** — хеширование и проверка паролей

**Стратегия сессий:**
- **JWT** — токены хранятся в cookies (production-ready)
- **Max Age:** 30 дней
- **Update Age:** 24 часа

**Callbacks:**
- `jwt()` — добавление user data в токен
- `session()` — передача данных в сессию
- `signIn()` — логирование событий безопасности

**Безопасность:**
- Secure cookies (HTTPS в production)
- HttpOnly cookies
- SameSite: lax
- CSRF protection

---

### 2. Drizzle Adapter (`src/lib/db/adapter.ts`)

Адаптер для работы с сессиями в PostgreSQL через Drizzle ORM.

**Реализованные методы:**
- `createUser()`, `getUser()`, `getUserByEmail()`, `getUserByAccount()`
- `updateUser()`, `deleteUser()`
- `linkAccount()`, `unlinkAccount()`
- `createSession()`, `getSessionAndUser()`, `updateSession()`, `deleteSession()`
- `createVerificationToken()`, `useVerificationToken()`

**Таблицы БД:**
```typescript
// accounts — OAuth аккаунты
// sessions — сессии пользователей
// verification_tokens — токены верификации
```

---

### 3. Система разрешений (`src/lib/config/permissions.ts`)

**Список разрешений:**
```typescript
// Каталог
catalogView: 'catalog_view'

// Заказы
orderCreate: 'order_create'
orderEditOwnDraft: 'order_edit_own_draft'
orderViewOwn: 'order_view_own'
orderViewAll: 'order_view_all'
orderApprove: 'order_approve'
orderFulfill: 'order_fulfill'

// Склад
stockManage: 'stock_manage'
stockViewHistory: 'stock_view_history'

// Пользователи
userManage: 'user_manage'

// Роли
roleManage: 'role_manage'

// Иерархия
hierarchyManage: 'hierarchy_manage'

// Запчасти
partsManage: 'parts_manage'

// Отчёты
reportsView: 'reports_view'

// Настройки
settingsAccess: 'settings_access'
```

**Функции проверки:**
- `hasPermission(userPermissions, permission)` — проверка одного разрешения
- `hasAnyPermission(userPermissions, permissions[])` — проверка любого (ИЛИ)
- `hasAllPermissions(userPermissions, permissions[])` — проверка всех (И)
- `hasPermissionInGroup(userPermissions, group)` — проверка группы
- `getMissingPermissions(userPermissions, required[])` — отсутствующие
- `hasRouteAccess(userPermissions, path)` — доступ к маршруту

**Пресеты ролей:**
```typescript
MECHANIC: [catalogView, orderCreate, orderEditOwnDraft, orderViewOwn]
REPAIR_MANAGER: [...MECHANIC, orderViewAll, orderApprove, reportsView]
STOREKEEPER: [catalogView, orderViewAll, orderFulfill, stockManage, stockViewHistory, partsManage]
ADMIN: allPermissions
```

---

### 4. Хук usePermission (`src/lib/hooks/usePermission.tsx`)

**React хук для проверки разрешений в компонентах.**

**API:**
```typescript
const {
  permissions,           // Все разрешения пользователя
  roleName,              // Название роли
  roleDisplayName,       // Отображаемое имя роли
  hasPermission,         // (perm) => boolean
  hasAnyPermission,      // (perms[]) => boolean
  hasAllPermissions,     // (perms[]) => boolean
  hasPermissionInGroup,  // (group) => boolean
  getMissingPermissions, // (perms[]) => Permission[]
  isLoading,             // Загрузка сессии
  isAuthenticated,       // Авторизован ли
} = usePermission();
```

**Компоненты:**
```tsx
// Условный рендеринг
<Permission required="order_create">
  <CreateOrderButton />
</Permission>

// С fallback
<Permission required="order_approve" fallback={<NoAccess />}>
  <ApproveButton />
</Permission>

// Группа разрешений
<PermissionGroup group="orders">
  <OrdersMenu />
</PermissionGroup>

// HOC
const ProtectedComponent = withPermission(
  MyComponent,
  'order_create',
  NoAccessComponent
);
```

---

### 5. Middleware (`src/middleware.ts`)

**Функции:**
1. **i18n роутинг** (next-intl)
2. **Проверка аутентификации** (next-auth)
3. **Проверка разрешений** (permissions)
4. **Редиректы** на login/access-denied

**Защищённые маршруты:**
```typescript
PROTECTED_ROUTES = [
  '/catalog',
  '/orders',
  '/stock',
  '/admin',
  '/reports',
  '/settings',
];
```

**Карта разрешений маршрутов:**
```typescript
ROUTE_PERMISSIONS = {
  '/catalog': permissions.catalogView,
  '/orders': permissions.orderViewOwn,
  '/orders/create': permissions.orderCreate,
  '/stock/manage': permissions.stockManage,
  '/admin/users': permissions.userManage,
  // ...
};
```

**Логика работы:**
1. Проверка локали в пути → i18n middleware
2. Публичные маршруты (`/auth/signin`, API health) → пропуск
3. API endpoints → проверка аутентификации (401 если нет)
4. Защищённые маршруты:
   - Нет сессии → редирект на `/[locale]/auth/signin?callbackUrl=...`
   - Нет разрешений → редирект на `/[locale]/auth/access-denied`

---

### 6. Страницы аутентификации

#### Sign In (`/auth/signin`)
- Форма с email + password
- Валидация через Zod
- Переключатель видимости пароля
- Кнопки быстрого входа (test accounts)
- Обработка ошибок
- Редирект после входа (callbackUrl)

#### Sign Out (`/auth/signout`)
- Подтверждение выхода
- Обработка через `signOut()`
- Редирект на signin с флагом `?signout=success`

#### Access Denied (`/auth/access-denied`)
- Сообщение о недостаточных правах
- Кнопки: "На главную", "Назад", "Выйти"

---

## 🚀 Использование

### В компонентах

```tsx
'use client';

import { usePermission } from '@/lib/hooks/usePermission';

export function OrderActions() {
  const { hasPermission, hasAllPermissions } = usePermission();

  return (
    <>
      {hasPermission('order_create') && (
        <Button>Создать заказ</Button>
      )}

      {hasAllPermissions(['order_approve', 'order_view_all']) && (
        <Button>Согласовать</Button>
      )}
    </>
  );
}
```

### В server components

```tsx
import { auth } from '@/lib/auth';
import { hasPermission } from '@/lib/config/permissions';

export default async function OrdersPage() {
  const session = await auth();
  const canViewAll = hasPermission(
    session?.user?.permissions ?? [],
    'order_view_all'
  );

  return (
    <div>
      {canViewAll ? <AllOrders /> : <MyOrders />}
    </div>
  );
}
```

### В API routes

```typescript
import { auth } from '@/lib/auth';
import { hasPermission } from '@/lib/config/permissions';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasPermission(session.user.permissions ?? [], 'order_create')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Создание заказа...
}
```

---

## 🔒 Безопасность

### Реализованные меры защиты

1. **Пароли**
   - Хеширование bcrypt (salt rounds: 10)
   - Никогда не передаются в клиентском коде
   - Не логируются

2. **Сессии**
   - JWT с подписью (AUTH_SECRET)
   - HttpOnly cookies
   - Secure flag (HTTPS в production)
   - SameSite: lax
   - Max Age: 30 дней

3. **Авторизация**
   - Проверка на middleware уровне
   - Проверка в API endpoints
   - Проверка в компонентах (frontend)
   - Defense in depth

4. **Input Validation**
   - Zod схема для login формы
   - Email валидация
   - Санитизация входных данных

5. **Logging**
   - Логирование signIn/signOut событий
   - Логирование создания пользователей
   - Возможность расширения для SIEM

---

## 📊 Ролевая модель

| Роль | Разрешения |
|------|-----------|
| **Механик** | catalog_view, order_create, order_edit_own_draft, order_view_own |
| **Менеджер** | все права механика + order_view_all, order_approve, reports_view |
| **Кладовщик** | catalog_view, order_view_all, order_fulfill, stock_manage, stock_view_history, parts_manage |
| **Администратор** | все разрешения |

---

## 🧪 Тестовые учётные данные

```
Admin:       admin@wms.local     / Admin123!
Mechanic:    mechanic@wms.local  / Mechanic123!
Manager:     manager@wms.local   / Manager123!
Storekeeper: storekeeper@wms.local / Storekeeper123!
```

---

## ⚙️ Конфигурация

### Переменные окружения (`.env`)

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/wms_autoparts?schema=public"

# NextAuth
AUTH_SECRET="your-secret-key-here-generate-with-openssl-rand-base64-32"
AUTH_URL="http://localhost:3000"

# Application
NEXT_PUBLIC_APP_NAME="WMS Autoparts"
NEXT_PUBLIC_DEFAULT_LOCALE="ru"
```

### Генерация AUTH_SECRET

```bash
openssl rand -base64 32
```

---

## 📦 Зависимости

```json
{
  "next-auth": "^5.0.0-beta.15",
  "bcryptjs": "^3.0.3",
  "drizzle-orm": "^0.29.4",
  "zod": "^3.22.4",
  "next-intl": "^3.9.1"
}
```

---

## 🔄 Миграции БД

После добавления таблиц NextAuth выполните:

```bash
npm run db:generate
npm run db:migrate
```

---

## 📝 Changelog

### v1.0.0
- ✅ NextAuth v5 конфигурация
- ✅ Drizzle Adapter
- ✅ Система разрешений (15 permissions)
- ✅ Ролевая модель (4 роли)
- ✅ Middleware с i18n + auth
- ✅ usePermission хук
- ✅ Страницы входа/выхода
- ✅ Локализация (ru, en, ar)
