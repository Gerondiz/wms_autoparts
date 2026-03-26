# Руководство по тестированию WMS Autoparts

## Обзор

Система тестирования WMS Autoparts включает три уровня тестов:

1. **Unit тесты** - тестирование отдельных модулей и функций
2. **Интеграционные тесты** - тестирование API endpoints
3. **E2E тесты** - сквозное тестирование пользовательских сценариев

## Структура тестов

```
tests/
├── unit/                    # Unit тесты
│   ├── services/           # Тесты сервисов
│   │   ├── ordersService.test.ts
│   │   ├── stockService.test.ts
│   │   └── partsService.test.ts
│   ├── stores/             # Тесты Zustand stores
│   │   └── cartStore.test.ts
│   ├── hooks/              # Тесты React hooks
│   │   ├── hooks.test.ts
│   │   └── usePermission.test.ts
│   └── utils/              # Тесты утилит
│       └── utils.test.ts
├── integration/            # Интеграционные тесты
│   └── api/                # Тесты API endpoints
│       ├── orders.api.test.ts
│       └── stock.api.test.ts
├── e2e/                    # E2E тесты Playwright
│   ├── critical-scenarios.test.ts
│   ├── stock-management.test.ts
│   ├── users-roles.test.ts
│   ├── global-setup.ts
│   └── global-teardown.ts
├── mocks/                  # Мок файлы
│   └── fileMock.js
├── setup.ts                # Глобальная настройка Jest
└── mocks.ts                # Тестовые данные и фабрики
```

## Запуск тестов

### Unit и интеграционные тесты

```bash
# Запустить все тесты
npm run test

# Запустить в режиме watch
npm run test:watch

# Запустить с покрытием
npm run test:coverage

# Запустить конкретный тест
npm run test -- ordersService
npm run test -- tests/unit/services/ordersService.test.ts
```

### E2E тесты

```bash
# Запустить все E2E тесты
npm run test:e2e

# Запустить в режиме браузера (headed)
npm run test:e2e:headed

# Запустить в режиме отладки
npm run test:e2e:debug

# Открыть UI для выбора тестов
npm run test:e2e:ui

# Запустить тесты в конкретном браузере
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Запустить мобильные тесты
npx playwright test --project="Mobile Chrome"
npx playwright test --project="Mobile Safari"

# Запустить по названию
npx playwright test -g "Аутентификация"
npx playwright test -g "Создание заказа"
```

## Покрытие кода

Требуемое покрытие: **не менее 70%** для ключевых модулей.

### Отчеты о покрытии

После запуска `npm run test:coverage` отчеты доступны в:

- `coverage/lcov.info` - для Codecov
- `coverage/index.html` - HTML отчет (открыть в браузере)
- `coverage/junit.xml` - JUnit формат для CI

### Проверка покрытия

```bash
# Запустить с проверкой порогов
npm run test -- --coverage --coverageThreshold='{"global":{"branches":60,"functions":70,"lines":70,"statements":70}}'
```

## Тестовые данные

### Фабрики данных

В `tests/mocks.ts` определены фабрики для создания тестовых данных:

```typescript
import { factories } from '../tests/mocks';

// Пользователи
const admin = factories.user.admin();
const mechanic = factories.user.mechanic();
const repairManager = factories.user.repairManager();
const storekeeper = factories.user.storekeeper();

// Запчасти
const part = factories.part.basic();
const lowStockPart = factories.part.lowStock();

// Заказы
const draftOrder = factories.order.draft();
const approvedOrder = factories.order.approved();

// Корзина
const cart = factories.cart.multipleItems();
```

### Валидационные данные

```typescript
import { validationData } from '../tests/mocks';

// Email
validationData.validEmails
validationData.invalidEmails

// Пароли
validationData.validPasswords
validationData.invalidPasswords

// Цены
validationData.validPrices
validationData.invalidPrices
```

## Написание тестов

### Unit тесты

```typescript
import { describe, it, expect, beforeEach } from '@jest/globals';

describe('serviceName', () => {
  beforeEach(() => {
    // Очистка моков
    jest.clearAllMocks();
  });

  describe('functionName', () => {
    it('должен выполнить действие', async () => {
      // Arrange
      // Настройка моков и данных

      // Act
      // Вызов тестируемой функции

      // Assert
      // Проверка результата
    });

    it('должен выбросить ошибку при невалидных данных', async () => {
      await expect(functionCall()).rejects.toThrow('ошибка');
    });
  });
});
```

### Интеграционные тесты API

```typescript
import { describe, it, expect, jest } from '@jest/globals';

// Моки зависимостей
jest.mock('@/lib/api', () => ({
  ensureAuth: jest.fn(),
  hasPermission: jest.fn(),
}));

describe('API Endpoint', () => {
  it('должен вернуть 401 для неаутентифицированного', async () => {
    // Arrange
    mockEnsureAuth.mockResolvedValue({ status: 401 });

    // Act
    const response = await GET(request);

    // Assert
    expect(response.status).toBe(401);
  });

  it('должен вернуть данные для авторизованного', async () => {
    // Arrange
    mockEnsureAuth.mockResolvedValue(mockSession);

    // Act
    const response = await GET(request);

    // Assert
    expect(response.status).toBe(200);
  });
});
```

### E2E тесты

```typescript
import { test, expect } from '@playwright/test';

test.describe('Название группы', () => {
  test.beforeEach(async ({ page }) => {
    // Подготовка перед каждым тестом
    await login(page, 'email@test.local', 'password');
  });

  test('должен выполнить действие', async ({ page }) => {
    await page.goto('/path');

    // Взаимодействие
    await page.click('[data-testid="button"]');

    // Проверка
    await expect(page.locator('[data-testid="result"]')).toBeVisible();
  });
});
```

## Best Practices

###命名 conventions

- **Unit тесты**: `serviceName.test.ts`
- **E2E тесты**: `scenario.test.ts`
- **Описательные названия тестов**: `должен + действие + при условиях`

### Data-testid

Используйте `data-testid` атрибуты для стабильных селекторов:

```tsx
<div data-testid="catalog-page">
  <button data-testid="add-to-cart-button">
  <input data-testid="search-input" />
</div>
```

### Изоляция тестов

- Каждый тест должен быть независимым
- Используйте `beforeEach` для сброса состояния
- Очищайте моки после каждого теста

### Асинхронные операции

```typescript
// Правильно
it('должен загрузить данные', async () => {
  await page.waitForSelector('[data-testid="loaded"]');
  expect(...).toBe(...);
});

// Неправильно
it('должен загрузить данные', () => {
  setTimeout(() => {
    expect(...).toBe(...); // Может не выполниться
  }, 1000);
});
```

## CI/CD

### GitHub Actions

Workflow `.github/workflows/test.yml` включает:

1. **Unit & Integration Tests** - запуск Jest тестов
2. **E2E Tests** - запуск Playwright тестов
3. **E2E Matrix** - тесты в разных браузерах
4. **E2E Mobile** - тесты на мобильных устройствах

### Переменные окружения для CI

```yaml
env:
  DATABASE_URL: 'postgresql://...'
  AUTH_SECRET: '...'
  AUTH_URL: 'http://localhost:3000'
```

### Артефакты

После выполнения workflow доступны:

- `unit-test-results` - результаты unit тестов
- `playwright-report` - отчет Playwright
- `e2e-test-results` - результаты E2E тестов

## Отладка тестов

### Jest

```bash
# Запустить с выводом логов
npm run test -- --verbose

# Запустить один файл
npm run test -- --testPathPattern=ordersService

# Запустить по имени теста
npm run test -- --testNamePattern="должен создать заказ"
```

### Playwright

```bash
# Режим отладки
npm run test:e2e:debug

# Трейсинг
npx playwright test --trace on

# Просмотр трейса
npx playwright show-trace trace.zip
```

## Покрытие функциональности

### Unit тесты

| Модуль | Файл | Покрытие |
|--------|------|----------|
| ordersService | `tests/unit/services/ordersService.test.ts` | ✅ |
| stockService | `tests/unit/services/stockService.test.ts` | ✅ |
| partsService | `tests/unit/services/partsService.test.ts` | ✅ |
| cartStore | `tests/unit/stores/cartStore.test.ts` | ✅ |
| useStock hook | `tests/unit/hooks/hooks.test.ts` | ✅ |
| usePermission | `tests/unit/hooks/usePermission.test.ts` | ✅ |
| Utils (cn, rtl) | `tests/unit/utils/utils.test.ts` | ✅ |

### Интеграционные тесты

| API | Файл | Тесты |
|-----|------|-------|
| Orders | `tests/integration/api/orders.api.test.ts` | ✅ |
| Stock | `tests/integration/api/stock.api.test.ts` | ✅ |

### E2E тесты

| Сценарий | Файл | Статус |
|----------|------|--------|
| Аутентификация | `tests/e2e/critical-scenarios.test.ts` | ✅ |
| Каталог | `tests/e2e/critical-scenarios.test.ts` | ✅ |
| Корзина | `tests/e2e/critical-scenarios.test.ts` | ✅ |
| Создание заказа | `tests/e2e/critical-scenarios.test.ts` | ✅ |
| Согласование | `tests/e2e/critical-scenarios.test.ts` | ✅ |
| Выдача заказа | `tests/e2e/critical-scenarios.test.ts` | ✅ |
| Управление складом | `tests/e2e/stock-management.test.ts` | ✅ |
| Пользователи/роли | `tests/e2e/users-roles.test.ts` | ✅ |

## Устранение проблем

### Частые ошибки

**"Cannot find module"**
```bash
npm install
npm run build
```

**"Timeout exceeded" в E2E**
```typescript
// Увеличьте таймаут
test('должен загрузиться', async ({ page }) => {
  await page.waitForSelector('[data-testid="loaded"]', { timeout: 30000 });
});
```

**"Mock not implemented"**
```typescript
// Реализуйте все вызовы мока
mockDb.select.mockReturnValue(mockDb);
mockDb.from.mockReturnValue(mockDb);
```

## Дополнительные ресурсы

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro)
- [Zustand Testing](https://github.com/pmndrs/zustand#testing)
