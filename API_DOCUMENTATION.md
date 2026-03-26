# WMS Autoparts API Documentation

## Обзор

Реализовано **40+ API endpoints** для системы управления складом запчастей WMS Autoparts.

### Структура проекта

```
src/
├── app/api/                      # API endpoints (Next.js App Router)
│   ├── hierarchy/                # Иерархия запчастей
│   │   ├── children/route.ts     # GET /api/hierarchy/children
│   │   ├── path/[id]/route.ts    # GET /api/hierarchy/path/:id
│   │   ├── [id]/route.ts         # GET/PUT/DELETE /api/hierarchy/:id
│   │   ├── [id]/move/route.ts    # POST /api/hierarchy/:id/move
│   │   └── route.ts              # POST /api/hierarchy
│   ├── parts/                    # Запчасти
│   │   ├── route.ts              # GET/POST /api/parts
│   │   ├── [id]/route.ts         # GET/PUT/DELETE /api/parts/:id
│   │   ├── [id]/images/route.ts  # POST /api/parts/:id/images
│   │   └── [partId]/images/[imageId]/route.ts
│   ├── orders/                   # Заказы
│   │   ├── route.ts              # GET/POST /api/orders
│   │   ├── [id]/route.ts         # GET/PUT/DELETE /api/orders/:id
│   │   ├── [id]/submit/route.ts  # POST /api/orders/:id/submit
│   │   ├── [id]/approve/route.ts # POST /api/orders/:id/approve
│   │   ├── [id]/reject/route.ts  # POST /api/orders/:id/reject
│   │   └── [id]/fulfill/route.ts # POST /api/orders/:id/fulfill
│   ├── stock/                    # Склад
│   │   ├── route.ts              # GET /api/stock
│   │   ├── receipt/route.ts      # POST /api/stock/receipt
│   │   ├── write-off/route.ts    # POST /api/stock/write-off
│   │   └── history/route.ts      # GET /api/stock/history
│   ├── users/                    # Пользователи
│   │   ├── route.ts              # GET/POST /api/users
│   │   └── [id]/route.ts         # GET/PUT/DELETE /api/users/:id
│   ├── roles/                    # Роли
│   │   ├── route.ts              # GET/POST /api/roles
│   │   └── [id]/route.ts         # PUT/DELETE /api/roles/:id
│   └── reports/                  # Отчёты
│       └── dashboard/route.ts    # GET /api/reports/dashboard
│
├── lib/api/                      # API инфраструктура
│   ├── types.ts                  # Типы и утилиты ответов
│   ├── schemas.ts                # Zod схемы валидации
│   ├── middleware.ts             # Аутентификация и авторизация
│   ├── utils.ts                  # Вспомогательные функции
│   └── index.ts                  # Экспорты
│
└── lib/services/                 # Бизнес-логика
    ├── hierarchyService.ts       # Иерархия
    ├── partsService.ts           # Запчасти
    ├── ordersService.ts          # Заказы
    ├── stockService.ts           # Склад
    ├── usersService.ts           # Пользователи
    ├── rolesService.ts           # Роли
    ├── reportsService.ts         # Отчёты
    └── index.ts                  # Экспорты
```

---

## 1. Иерархия (Hierarchy)

### GET `/api/hierarchy/children`

Получить дочерние узлы для ленивой загрузки дерева.

**Права:** `catalog_view`

**Параметры:**
- `parentId` (query, optional) — ID родительского узла (null для корневых)

**Ответ:**
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "name": "Двигатель",
      "path": "root.5",
      "nodeTypeId": 2,
      "nodeTypeName": "subsystem",
      "sortOrder": 1,
      "childrenCount": 3,
      "partsCount": 15
    }
  ]
}
```

---

### GET `/api/hierarchy/path/:id`

Получить путь к узлу (хлебные крошки).

**Права:** `catalog_view`

**Ответ:**
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "root", "path": "root" },
    { "id": 5, "name": "Двигатель", "path": "root.5" },
    { "id": 12, "name": "ГБЦ", "path": "root.5.12" }
  ]
}
```

---

### GET `/api/hierarchy/:id`

Получить детали узла.

**Ответ:**
```json
{
  "success": true,
  "data": {
    "id": 12,
    "name": "ГБЦ",
    "path": "root.5.12",
    "nodeTypeId": 2,
    "nodeTypeName": "subsystem",
    "parentId": 5,
    "sortOrder": 1,
    "attributes": {}
  }
}
```

---

### POST `/api/hierarchy`

Создать новый узел.

**Права:** `admin`

**Тело запроса:**
```json
{
  "name": "Тормозная система",
  "parentId": 1,
  "nodeTypeId": 2,
  "sortOrder": 1,
  "attributes": {}
}
```

---

### PUT `/api/hierarchy/:id`

Обновить узел.

**Права:** `admin`

**Тело запроса:**
```json
{
  "name": "Тормозная система (обновлено)",
  "nodeTypeId": 3,
  "sortOrder": 2,
  "attributes": { "color": "red" }
}
```

---

### DELETE `/api/hierarchy/:id`

Удалить узел (каскадно).

**Права:** `admin`

---

### POST `/api/hierarchy/:id/move`

Переместить узел.

**Права:** `admin`

**Тело запроса:**
```json
{
  "newParentId": 10,
  "newSortOrder": 5
}
```

---

## 2. Запчасти (Parts)

### GET `/api/parts`

Получить список запчастей узла или выполнить поиск.

**Права:** `catalog_view`

**Параметры:**
- `nodeId` (query) — ID узла для списка
- `q` (query) — Поисковый запрос
- `page`, `limit` — Пагинация

**Ответ (список):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 100,
        "name": "Прокладка ГБЦ",
        "partNumber": "12345-AB",
        "stock": 50,
        "price": "1500.00",
        "primaryImage": "/uploads/parts/100/main.jpg"
      }
    ],
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

**Ответ (поиск):**
```json
{
  "success": true,
  "data": {
    "parts": [...],
    "nodes": [...]
  }
}
```

---

### GET `/api/parts/:id`

Детальная информация о запчасти.

**Ответ:**
```json
{
  "success": true,
  "data": {
    "id": 100,
    "name": "Прокладка ГБЦ",
    "partNumber": "12345-AB",
    "description": "...",
    "stock": 50,
    "price": "1500.00",
    "hierarchy": { "id": 12, "name": "ГБЦ", "path": "root.5.12" },
    "images": [
      { "id": 1, "imageUrl": "/uploads/parts/100/main.jpg", "isPrimary": true }
    ]
  }
}
```

---

### POST `/api/parts`

Создать запчасть.

**Права:** `parts_manage`

**Тело запроса:**
```json
{
  "name": "Прокладка ГБЦ",
  "partNumber": "12345-AB",
  "hierarchyId": 12,
  "stock": 100,
  "price": "1500.00"
}
```

---

### PUT `/api/parts/:id`

Обновить запчасть.

**Права:** `parts_manage`

---

### DELETE `/api/parts/:id`

Удалить запчасть.

**Права:** `parts_manage`

---

### POST `/api/parts/:id/images`

Загрузить изображение.

**Права:** `parts_manage`

**Content-Type:** `multipart/form-data`

**FormData:**
- `image` (File) — Файл изображения
- `isPrimary` (boolean) — Сделать основным

---

### DELETE `/api/parts/:partId/images/:imageId`

Удалить изображение.

**Права:** `parts_manage`

---

## 3. Заказы (Orders)

### GET `/api/orders`

Список заказов с фильтрацией.

**Права:** `order_view_own` или `order_view_all`

**Параметры:**
- `status`, `priority`, `mechanicId` — Фильтры
- `page`, `limit` — Пагинация

---

### GET `/api/orders/:id`

Детали заказа с позициями.

---

### POST `/api/orders`

Создать заказ из корзины.

**Права:** `order_create`

**Тело запроса:**
```json
{
  "items": [
    { "partId": 100, "quantity": 2 },
    { "partId": 105, "quantity": 1 }
  ],
  "notes": "Комментарий"
}
```

---

### PUT `/api/orders/:id`

Обновить заказ (только draft).

**Права:** `order_edit_own_draft`

---

### DELETE `/api/orders/:id`

Удалить черновик.

**Права:** `order_edit_own_draft`

---

### POST `/api/orders/:id/submit`

Отправить на согласование.

**Права:** `order_create` (владелец)

---

### POST `/api/orders/:id/approve`

Согласовать заказ.

**Права:** `order_approve`

**Тело запроса:**
```json
{
  "priority": 1,
  "notes": "Согласовано"
}
```

---

### POST `/api/orders/:id/reject`

Отклонить заказ.

**Права:** `order_approve`

**Тело запроса:**
```json
{
  "rejectionReason": "Причина отказа"
}
```

---

### POST `/api/orders/:id/fulfill`

Отметить выдачу.

**Права:** `order_fulfill`

**Тело запроса:**
```json
{
  "items": [
    { "orderItemId": 200, "quantityFulfilled": 2 }
  ],
  "notes": "Выдано"
}
```

---

## 4. Склад (Stock)

### GET `/api/stock`

Текущие остатки.

**Права:** `stock_view` / `stock_manage`

**Параметры:**
- `search`, `lowStock`, `nodeId` — Фильтры
- `page`, `limit` — Пагинация

---

### POST `/api/stock/receipt`

Приход запчастей.

**Права:** `stock_manage`

**Тело запроса:**
```json
{
  "partId": 100,
  "quantity": 50,
  "reason": "stock_receipt",
  "notes": "Поставка"
}
```

---

### POST `/api/stock/write-off`

Списание запчастей.

**Права:** `stock_manage`

**Тело запроса:**
```json
{
  "partId": 100,
  "quantity": 3,
  "reason": "manual_correction",
  "notes": "Брак"
}
```

---

### GET `/api/stock/history`

История изменений.

**Права:** `stock_view_history`

**Параметры:**
- `partId`, `userId`, `orderId`, `reason` — Фильтры
- `fromDate`, `toDate` — Период
- `page`, `limit` — Пагинация

---

## 5. Пользователи (Users)

### GET `/api/users`

Список пользователей.

**Права:** `admin`

---

### GET `/api/users/:id`

Детали пользователя.

**Права:** `admin`

---

### POST `/api/users`

Создать пользователя.

**Права:** `admin`

**Тело запроса:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "Имя Фамилия",
  "roleTypeId": 1
}
```

---

### PUT `/api/users/:id`

Обновить пользователя.

**Права:** `admin`

---

### DELETE `/api/users/:id`

Удалить пользователя.

**Права:** `admin`

**Ограничение:** Нельзя удалить первого администратора (id=1)

---

## 6. Роли (Roles)

### GET `/api/roles`

Список ролей.

**Права:** `admin`

---

### POST `/api/roles`

Создать роль.

**Права:** `admin`

**Тело запроса:**
```json
{
  "name": "senior_storekeeper",
  "displayName": "Старший кладовщик",
  "permissions": ["catalog_view", "stock_manage"],
  "sortOrder": 4
}
```

---

### PUT `/api/roles/:id`

Обновить роль.

**Права:** `admin`

**Ограничение:** Нельзя изменять системные роли

---

### DELETE `/api/roles/:id`

Удалить роль.

**Права:** `admin`

**Ограничения:**
- Нельзя удалить системную роль
- Нельзя удалить роль с пользователями

---

## 7. Отчёты (Reports)

### GET `/api/reports/dashboard`

Данные для аналитики.

**Права:** `reports_view`

**Ответ:**
```json
{
  "success": true,
  "data": {
    "ordersByStatus": [...],
    "popularParts": [...],
    "lowStockParts": [...],
    "recentOrders": [...],
    "stats": {
      "totalUsers": 12,
      "totalParts": 500,
      "totalOrders": 150,
      "totalRoles": 4
    },
    "recentActivity": [...]
  }
}
```

---

## Матрица прав доступа

| Permission | MECHANIC | REPAIR_MANAGER | STOREKEEPER | ADMIN |
|------------|----------|----------------|-------------|-------|
| `catalog_view` | ✅ | ✅ | ✅ | ✅ |
| `hierarchy_manage` | ❌ | ❌ | ❌ | ✅ |
| `parts_manage` | ❌ | ❌ | ❌ | ✅ |
| `order_create` | ✅ | ✅ | ❌ | ✅ |
| `order_view_own` | ✅ | ❌ | ❌ | ✅ |
| `order_view_all` | ❌ | ✅ | ✅ | ✅ |
| `order_edit_own_draft` | ✅ | ❌ | ❌ | ✅ |
| `order_approve` | ❌ | ✅ | ❌ | ✅ |
| `order_fulfill` | ❌ | ❌ | ✅ | ✅ |
| `stock_view` | ❌ | ❌ | ✅ | ✅ |
| `stock_view_history` | ❌ | ❌ | ✅ | ✅ |
| `stock_manage` | ❌ | ❌ | ✅ | ✅ |
| `user_manage` | ❌ | ❌ | ❌ | ✅ |
| `role_manage` | ❌ | ❌ | ❌ | ✅ |
| `reports_view` | ❌ | ✅ | ✅ | ✅ |

---

## Формат ответов

### Успешный ответ
```json
{
  "success": true,
  "data": { ... }
}
```

### Ошибка
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Ошибка валидации данных",
    "details": [...]
  }
}
```

### Пагинация
```json
{
  "success": true,
  "data": {
    "items": [...],
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

---

## Коды ошибок

| Код | HTTP | Описание |
|-----|------|----------|
| `UNAUTHORIZED` | 401 | Требуется аутентификация |
| `FORBIDDEN` | 403 | Недостаточно прав |
| `NOT_FOUND` | 404 | Ресурс не найден |
| `VALIDATION_ERROR` | 400 | Ошибка валидации |
| `CONFLICT` | 409 | Конфликт данных |
| `BAD_REQUEST` | 400 | Неверный запрос |
| `INTERNAL_ERROR` | 500 | Внутренняя ошибка |

---

## Безопасность

- ✅ Все endpoints защищены middleware аутентификации
- ✅ Проверка прав через permissions
- ✅ Валидация входных данных с Zod
- ✅ Транзакции для критических операций
- ✅ Защита от удаления системных данных

---

## Тестирование

Для тестирования API используйте:

```bash
# Пример запроса с curl
curl -X GET http://localhost:3000/api/hierarchy/children \
  -H "Cookie: next-auth.session-token=..."
```

Или импортируйте коллекцию в Postman/Insomnia.
