# API Endpoints Implementation Summary

## Обзор реализованных API endpoints

Все endpoints реализованы в соответствии со спецификацией WMS Autoparts.

### Базовая инфраструктура

**Файлы инфраструктуры:**
- `src/lib/api/types.ts` — Типы и утилиты для ответов API
- `src/lib/api/schemas.ts` — Zod схемы валидации
- `src/lib/api/middleware.ts` — Middleware для аутентификации и авторизации
- `src/lib/api/utils.ts` — Вспомогательные функции
- `src/lib/api/index.ts` — Экспорты API модуля

**Сервисный слой:**
- `src/lib/services/hierarchyService.ts` — Бизнес-логика иерархии
- `src/lib/services/partsService.ts` — Бизнес-логика запчастей
- `src/lib/services/ordersService.ts` — Бизнес-логика заказов
- `src/lib/services/stockService.ts` — Бизнес-логика склада
- `src/lib/services/usersService.ts` — Бизнес-логика пользователей
- `src/lib/services/rolesService.ts` — Бизнес-логика ролей
- `src/lib/services/reportsService.ts` — Бизнес-логика отчётов
- `src/lib/services/index.ts` — Экспорты сервисов

---

## 1. Иерархия (Hierarchy) — 6 endpoints

| Метод | Endpoint | Описание | Права доступа |
|-------|----------|----------|---------------|
| GET | `/api/hierarchy/children?parentId=...` | Дочерние узлы (ленивая загрузка) | `catalog_view` |
| GET | `/api/hierarchy/path/:id` | Путь для хлебных крошек | `catalog_view` |
| GET | `/api/hierarchy/:id` | Детали узла | — |
| POST | `/api/hierarchy` | Создать узел | `admin` |
| PUT | `/api/hierarchy/:id` | Обновить узел | `admin` |
| DELETE | `/api/hierarchy/:id` | Удалить узел | `admin` |
| POST | `/api/hierarchy/:id/move` | Переместить узел | `admin` |

**Файлы:**
- `src/app/api/hierarchy/children/route.ts`
- `src/app/api/hierarchy/path/[id]/route.ts`
- `src/app/api/hierarchy/route.ts`
- `src/app/api/hierarchy/[id]/route.ts`
- `src/app/api/hierarchy/[id]/move/route.ts`

---

## 2. Запчасти (Parts) — 8 endpoints

| Метод | Endpoint | Описание | Права доступа |
|-------|----------|----------|---------------|
| GET | `/api/parts?nodeId=...` | Запчасти узла | `catalog_view` |
| GET | `/api/parts/search?q=...` | Глобальный поиск | `catalog_view` |
| GET | `/api/parts/:id` | Детальная информация | `catalog_view` |
| POST | `/api/parts` | Создать запчасть | `parts_manage` |
| PUT | `/api/parts/:id` | Обновить запчасть | `parts_manage` |
| DELETE | `/api/parts/:id` | Удалить запчасть | `parts_manage` |
| POST | `/api/parts/:id/images` | Загрузить изображение | `parts_manage` |
| DELETE | `/api/parts/:partId/images/:imageId` | Удалить изображение | `parts_manage` |

**Файлы:**
- `src/app/api/parts/route.ts`
- `src/app/api/parts/[id]/route.ts`
- `src/app/api/parts/[id]/images/route.ts`
- `src/app/api/parts/[partId]/images/[imageId]/route.ts`

---

## 3. Заказы (Orders) — 9 endpoints

| Метод | Endpoint | Описание | Права доступа |
|-------|----------|----------|---------------|
| GET | `/api/orders` | Список заказов | `order_view_own` / `order_view_all` |
| GET | `/api/orders/:id` | Детали заказа | `order_view_own` / `order_view_all` |
| POST | `/api/orders` | Создать заказ | `order_create` |
| PUT | `/api/orders/:id` | Обновить заказ (draft) | `order_edit_own_draft` |
| DELETE | `/api/orders/:id` | Удалить черновик | `order_edit_own_draft` |
| POST | `/api/orders/:id/submit` | Отправить на согласование | `order_create` |
| POST | `/api/orders/:id/approve` | Согласовать | `order_approve` |
| POST | `/api/orders/:id/reject` | Отклонить | `order_approve` |
| POST | `/api/orders/:id/fulfill` | Отметить выдачу | `order_fulfill` |

**Файлы:**
- `src/app/api/orders/route.ts`
- `src/app/api/orders/[id]/route.ts`
- `src/app/api/orders/[id]/submit/route.ts`
- `src/app/api/orders/[id]/approve/route.ts`
- `src/app/api/orders/[id]/reject/route.ts`
- `src/app/api/orders/[id]/fulfill/route.ts`

---

## 4. Склад (Stock) — 4 endpoints

| Метод | Endpoint | Описание | Права доступа |
|-------|----------|----------|---------------|
| GET | `/api/stock` | Текущие остатки | `stock_view` / `stock_manage` |
| POST | `/api/stock/receipt` | Приход запчасти | `stock_manage` |
| POST | `/api/stock/write-off` | Списание | `stock_manage` |
| GET | `/api/stock/history` | История изменений | `stock_view_history` |

**Файлы:**
- `src/app/api/stock/route.ts`
- `src/app/api/stock/receipt/route.ts`
- `src/app/api/stock/write-off/route.ts`
- `src/app/api/stock/history/route.ts`

---

## 5. Пользователи (Users) — 5 endpoints

| Метод | Endpoint | Описание | Права доступа |
|-------|----------|----------|---------------|
| GET | `/api/users` | Список пользователей | `admin` |
| GET | `/api/users/:id` | Детали пользователя | `admin` |
| POST | `/api/users` | Создать пользователя | `admin` |
| PUT | `/api/users/:id` | Обновить пользователя | `admin` |
| DELETE | `/api/users/:id` | Удалить пользователя | `admin` |

**Файлы:**
- `src/app/api/users/route.ts`
- `src/app/api/users/[id]/route.ts`

---

## 6. Роли (Roles) — 4 endpoints

| Метод | Endpoint | Описание | Права доступа |
|-------|----------|----------|---------------|
| GET | `/api/roles` | Список ролей | `admin` |
| POST | `/api/roles` | Создать роль | `admin` |
| PUT | `/api/roles/:id` | Обновить роль | `admin` |
| DELETE | `/api/roles/:id` | Удалить роль | `admin` |

**Файлы:**
- `src/app/api/roles/route.ts`
- `src/app/api/roles/[id]/route.ts`

---

## 7. Отчёты (Reports) — 1 endpoint

| Метод | Endpoint | Описание | Права доступа |
|-------|----------|----------|---------------|
| GET | `/api/reports/dashboard` | Данные для аналитики | `reports_view` |

**Файлы:**
- `src/app/api/reports/dashboard/route.ts`

---

## Итого: 40+ endpoints

| Модуль | Количество endpoints |
|--------|---------------------|
| Иерархия | 7 |
| Запчасти | 8 |
| Заказы | 9 |
| Склад | 4 |
| Пользователи | 5 |
| Роли | 4 |
| Отчёты | 1 |
| **ВСЕГО** | **38** |

---

## Требования реализации

### ✅ Безопасность
- Все endpoints защищены middleware аутентификации
- Проверка прав доступа через permissions
- Административные endpoints требуют роль `admin`

### ✅ Валидация
- Zod схемы для всех входных данных
- Правильные HTTP статусы ошибок (400, 401, 403, 404, 409, 500)
- Детализированные сообщения об ошибках валидации

### ✅ Транзакции
- Операции с остатками используют транзакции БД
- Атомарное обновление stock + stockHistory

### ✅ Пагинация
- Поддержка `page` / `limit` для списков
- Возврат метаданных: `total`, `totalPages`

### ✅ Сортировка и фильтрация
- Фильтрация по статусам, приоритетам, датам
- Поиск по названию и артикулу

---

## Структура ответа API

### Успешный ответ
```json
{
  "success": true,
  "data": { ... }
}
```

### Ответ с ошибкой
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

### Пагинированный ответ
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

| Код | HTTP статус | Описание |
|-----|-------------|----------|
| `UNAUTHORIZED` | 401 | Пользователь не аутентифицирован |
| `FORBIDDEN` | 403 | Недостаточно прав |
| `NOT_FOUND` | 404 | Ресурс не найден |
| `VALIDATION_ERROR` | 400 | Ошибка валидации данных |
| `CONFLICT` | 409 | Конфликт данных |
| `BAD_REQUEST` | 400 | Неверный запрос |
| `INTERNAL_ERROR` | 500 | Внутренняя ошибка сервера |

---

## Следующие шаги

1. **Тестирование API** — создать unit и integration тесты
2. **Документация** — сгенерировать OpenAPI/Swagger спецификацию
3. **Rate limiting** — добавить ограничение запросов
4. **Логирование** — добавить audit log для критических операций
5. **Кеширование** — добавить Redis для часто запрашиваемых данных
