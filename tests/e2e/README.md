# E2E Тесты WMS Autoparts

## 📋 Запуск тестов

```bash
# Все тесты
npm run test:e2e

# Только Chrome
npm run test:e2e -- --project=chromium

# В режиме браузера (headed)
npm run test:e2e -- --headed

# Конкретный тест
npx playwright test catalog.spec.ts

# С отчётом
npx playwright test --reporter=html
npx playwright show-report
```

## 🎯 Тестовые сценарии

### 1. Каталог запчастей (`catalog.spec.ts`)

**Фикстура:** `console-logger` - собирает логи консоли браузера

Тесты:
- ✅ Загрузка страницы без ошибок консоли
- ✅ Отсутствие MISSING_MESSAGE в переводах
- ✅ Отображение дерева категорий
- ✅ Загрузка запчастей при выборе узла
- ✅ Хлебные крошки отображают путь

### 2. Мультиязычность (`i18n.spec.ts`)

Тесты:
- ✅ Загрузка переводов для RU, EN, AR
- ✅ Переключение языка через dropdown
- ✅ RTL для арабского языка
- ✅ Отсутствие ошибок консоли при переключении

### 3. Header (`header.spec.ts`)

Тесты:
- ✅ Header на всех страницах
- ✅ Логотип
- ✅ Переключатель языка
- ✅ Иконка профиля
- ✅ Отсутствие ошибок рендеринга

## 📊 Отчёт об ошибках

Тесты собирают следующие ошибки:

1. **Ошибки консоли:**
```typescript
consoleLogs.errors // Массив ошибок
consoleLogs.warnings // Массив предупреждений
```

2. **Ошибки страницы:**
```typescript
page.on('pageerror', (error) => {
  errors.push(`Page Error: ${error.message}`);
});
```

3. **Failed запросы:**
```typescript
page.on('requestfailed', (request) => {
  errors.push(`Request Failed: ${request.url()}`);
});
```

## 🔧 Фикстуры

### console-logger

Автоматически собирает все логи консоли для каждого теста:

```typescript
import { test, expect } from './fixtures/console-logger';

test('пример', async ({ page, consoleLogs }) => {
  await page.goto('/ru/catalog');
  
  // Проверка отсутствия ошибок
  expect(consoleLogs.errors).toEqual([]);
  
  // Вывод всех логов
  console.log(consoleLogs.logs);
});
```

## 📁 Структура

```
tests/e2e/
├── fixtures/
│   └── console-logger.ts    # Фикстура для сбора логов
├── catalog.spec.ts          # Тесты каталога
├── i18n.spec.ts             # Тесты мультиязычности
├── header.spec.ts           # Тесты Header
├── critical-scenarios.test.ts
├── stock-management.test.ts
├── users-roles.test.ts
├── global-setup.ts
└── global-teardown.ts
```

## 🐛 Известные проблемы

1. **Тесты могут зависать** - убедитесь что приложение запущено
2. **Долгий первый запуск** - Playwright загружает браузеры
3. **Ложные срабатывания translation keys** - некоторые URL содержат точки

## ✅ CI/CD Интеграция

```yaml
# .github/workflows/test.yml
- name: Run E2E tests
  run: npm run test:e2e
  
- name: Upload test report
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```
