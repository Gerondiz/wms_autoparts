/**
 * E2E тесты для WMS Autoparts
 * 
 * Критические сценарии:
 * - Аутентификация (вход/выход)
 * - Просмотр каталога
 * - Добавление в корзину
 * - Создание заказа
 * - Согласование заказа
 * - Выдача заказа
 */

import { test, expect, Page } from '@playwright/test';

// ============================================
// Тестовые данные
// ============================================

const testUsers = {
  mechanic: {
    email: 'mechanic@wms-autoparts.local',
    password: 'password123',
    fullName: 'Механик Тестовый',
  },
  repairManager: {
    email: 'repair.manager@wms-autoparts.local',
    password: 'password123',
    fullName: 'Менеджер Тестовый',
  },
  storekeeper: {
    email: 'storekeeper@wms-autoparts.local',
    password: 'password123',
    fullName: 'Кладовщик Тестовый',
  },
  admin: {
    email: 'admin@wms-autoparts.local',
    password: 'password123',
    fullName: 'Администратор',
  },
};

// ============================================
// Вспомогательные функции
// ============================================

async function login(page: Page, email: string, password: string) {
  await page.goto('/auth/signin');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/(catalog|orders|dashboard)/);
}

async function logout(page: Page) {
  await page.click('[data-testid="user-menu"]');
  await page.click('[data-testid="logout-button"]');
  await page.waitForURL(/\/auth\/signin/);
}

// ============================================
// Аутентификация
// ============================================

test.describe('Аутентификация', () => {
  test('должен выполнить вход механика', async ({ page }) => {
    await page.goto('/auth/signin');

    // Ввод данных
    await page.fill('input[name="email"]', testUsers.mechanic.email);
    await page.fill('input[name="password"]', testUsers.mechanic.password);

    // Отправка формы
    await page.click('button[type="submit"]');

    // Ожидание перехода на главную
    await page.waitForURL(/\/catalog/);

    // Проверка успешного входа
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-name"]')).toContainText(
      testUsers.mechanic.fullName
    );
  });

  test('должен выполнить вход менеджера по ремонту', async ({ page }) => {
    await login(page, testUsers.repairManager.email, testUsers.repairManager.password);

    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-name"]')).toContainText(
      testUsers.repairManager.fullName
    );
  });

  test('должен выполнить вход кладовщика', async ({ page }) => {
    await login(page, testUsers.storekeeper.email, testUsers.storekeeper.password);

    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-name"]')).toContainText(
      testUsers.storekeeper.fullName
    );
  });

  test('должен выполнить выход', async ({ page }) => {
    // Вход
    await login(page, testUsers.mechanic.email, testUsers.mechanic.password);

    // Проверка что вошли
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();

    // Выход
    await logout(page);

    // Проверка что вышли
    await expect(page).toHaveURL(/\/auth\/signin/);
  });

  test('должен показать ошибку при неверном пароле', async ({ page }) => {
    await page.goto('/auth/signin');

    await page.fill('input[name="email"]', testUsers.mechanic.email);
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Ожидание сообщения об ошибке
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText(
      /неверный/i
    );
  });

  test('должен показать ошибку при пустом email', async ({ page }) => {
    await page.goto('/auth/signin');

    await page.fill('input[name="password"]', testUsers.mechanic.password);
    await page.click('button[type="submit"]');

    // Проверка валидации
    await expect(page.locator('input[name="email"]')).toBeFocused();
  });
});

// ============================================
// Каталог запчастей
// ============================================

test.describe('Просмотр каталога', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.mechanic.email, testUsers.mechanic.password);
  });

  test('должен отобразить страницу каталога', async ({ page }) => {
    await page.goto('/catalog');

    await expect(page.locator('[data-testid="catalog-page"]')).toBeVisible();
    await expect(page.locator('[data-testid="parts-list"]')).toBeVisible();
  });

  test('должен отобразить дерево иерархии', async ({ page }) => {
    await page.goto('/catalog');

    await expect(page.locator('[data-testid="hierarchy-tree"]')).toBeVisible();
    await expect(
      page.locator('[data-testid="hierarchy-node"]:has-text("Фильтры")')
    ).toBeVisible();
  });

  test('должен выполнить поиск запчастей', async ({ page }) => {
    await page.goto('/catalog');

    await page.fill('[data-testid="search-input"]', 'фильтр');
    await page.press('[data-testid="search-input"]', 'Enter');

    await expect(page.locator('[data-testid="parts-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="part-item"]')).toHaveCount(1);
  });

  test('должен отобразить детальную информацию о запчасти', async ({ page }) => {
    await page.goto('/catalog/parts/1');

    await expect(page.locator('[data-testid="part-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="part-number"]')).toBeVisible();
    await expect(page.locator('[data-testid="part-stock"]')).toBeVisible();
    await expect(page.locator('[data-testid="part-price"]')).toBeVisible();
  });
});

// ============================================
// Корзина
// ============================================

test.describe('Добавление в корзину', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.mechanic.email, testUsers.mechanic.password);
  });

  test('должен добавить запчасть в корзину', async ({ page }) => {
    await page.goto('/catalog/parts/1');

    // Добавление в корзину
    await page.click('[data-testid="add-to-cart-button"]');

    // Проверка что добавлено
    await expect(page.locator('[data-testid="cart-badge"]')).toContainText('1');
    await expect(
      page.locator('[data-testid="cart-notification"]')
    ).toContainText(/добавлен/i);
  });

  test('должен увеличить количество при повторном добавлении', async ({ page }) => {
    await page.goto('/catalog/parts/1');

    // Первое добавление
    await page.click('[data-testid="add-to-cart-button"]');
    await expect(page.locator('[data-testid="cart-badge"]')).toContainText('1');

    // Второе добавление
    await page.click('[data-testid="add-to-cart-button"]');
    await expect(page.locator('[data-testid="cart-badge"]')).toContainText('2');
  });

  test('должен открыть корзину при клике на иконку', async ({ page }) => {
    await page.goto('/catalog');

    // Добавление товара
    await page.click('[data-testid="add-to-cart-button"]:first-child');

    // Открытие корзины
    await page.click('[data-testid="cart-button"]');

    await expect(page.locator('[data-testid="cart-drawer"]')).toBeVisible();
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(1);
  });

  test('должен изменить количество в корзине', async ({ page }) => {
    await page.goto('/catalog/parts/1');
    await page.click('[data-testid="add-to-cart-button"]');
    await page.click('[data-testid="cart-button"]');

    // Увеличение количества
    await page.click('[data-testid="quantity-increase"]');
    await expect(page.locator('[data-testid="quantity-display"]')).toContainText('2');

    // Уменьшение количества
    await page.click('[data-testid="quantity-decrease"]');
    await expect(page.locator('[data-testid="quantity-display"]')).toContainText('1');
  });

  test('должен удалить товар из корзины', async ({ page }) => {
    await page.goto('/catalog/parts/1');
    await page.click('[data-testid="add-to-cart-button"]');
    await page.click('[data-testid="cart-button"]');

    // Удаление
    await page.click('[data-testid="remove-item-button"]');

    await expect(page.locator('[data-testid="cart-empty"]')).toBeVisible();
    await expect(page.locator('[data-testid="cart-badge"]')).toContainText('0');
  });

  test('должен очистить корзину', async ({ page }) => {
    await page.goto('/catalog');

    // Добавление нескольких товаров
    await page.click('[data-testid="add-to-cart-button"]:nth-match(1)');
    await page.click('[data-testid="add-to-cart-button"]:nth-match(2)');

    await page.click('[data-testid="cart-button"]');

    // Очистка
    await page.click('[data-testid="clear-cart-button"]');

    await expect(page.locator('[data-testid="cart-empty"]')).toBeVisible();
  });
});

// ============================================
// Создание заказа
// ============================================

test.describe('Создание заказа', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.mechanic.email, testUsers.mechanic.password);
  });

  test('должен создать заказ из корзины', async ({ page }) => {
    // Добавление товаров
    await page.goto('/catalog/parts/1');
    await page.click('[data-testid="add-to-cart-button"]');

    // Переход к оформлению
    await page.click('[data-testid="cart-button"]');
    await page.click('[data-testid="checkout-button"]');

    // Заполнение заметок
    await page.fill('[data-testid="order-notes"]', 'Тестовый заказ');

    // Выбор приоритета
    await page.selectOption('[data-testid="order-priority"]', '1');

    // Создание заказа
    await page.click('[data-testid="create-order-button"]');

    // Ожидание перехода к заказу
    await page.waitForURL(/\/orders\/\d+/);

    // Проверка успешного создания
    await expect(page.locator('[data-testid="order-success"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-status"]')).toContainText(
      /черновик/i
    );
  });

  test('должен создать заказ с несколькими товарами', async ({ page }) => {
    // Добавление нескольких товаров
    await page.goto('/catalog');
    await page.click('[data-testid="add-to-cart-button"]:nth-match(1)');
    await page.click('[data-testid="add-to-cart-button"]:nth-match(2)');
    await page.click('[data-testid="add-to-cart-button"]:nth-match(3)');

    // Проверка количества в корзине
    await expect(page.locator('[data-testid="cart-badge"]')).toContainText('3');

    // Оформление
    await page.click('[data-testid="cart-button"]');
    await page.click('[data-testid="checkout-button"]');

    await page.fill('[data-testid="order-notes"]', 'Заказ с несколькими товарами');
    await page.click('[data-testid="create-order-button"]');

    await page.waitForURL(/\/orders\/\d+/);

    // Проверка количества позиций
    await expect(page.locator('[data-testid="order-items"]')).toHaveCount(2);
  });

  test('должен показать ошибку при пустой корзине', async ({ page }) => {
    await page.goto('/orders/create');

    await page.click('[data-testid="create-order-button"]');

    await expect(page.locator('[data-testid="error-message"]')).toContainText(
      /корзина пуста/i
    );
  });
});

// ============================================
// Согласование заказа
// ============================================

test.describe('Согласование заказа', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.repairManager.email, testUsers.repairManager.password);
  });

  test('должен показать заказы на согласование', async ({ page }) => {
    await page.goto('/orders?roleFilter=for_approval');

    await expect(page.locator('[data-testid="orders-list"]')).toBeVisible();
    await expect(
      page.locator('[data-testid="order-status-submitted"]')
    ).toHaveCount(0);
  });

  test('должен согласовать заказ', async ({ page }) => {
    // Переход к заказу на согласование
    await page.goto('/orders?roleFilter=for_approval');

    const orderRow = page.locator('[data-testid="order-row"]:first-child');
    const orderId = await orderRow.getAttribute('data-order-id');

    if (orderId) {
      await page.goto(`/orders/${orderId}`);

      // Согласование
      await page.click('[data-testid="approve-order-button"]');

      // Заполнение приоритета
      await page.selectOption('[data-testid="approval-priority"]', '2');
      await page.fill('[data-testid="approval-notes"]', 'Согласовано');

      // Подтверждение
      await page.click('[data-testid="confirm-approve-button"]');

      // Проверка успешного согласования
      await expect(page.locator('[data-testid="order-status"]')).toContainText(
        /согласован/i
      );
    }
  });

  test('должен отклонить заказ', async ({ page }) => {
    await page.goto('/orders?roleFilter=for_approval');

    const orderRow = page.locator('[data-testid="order-row"]:first-child');
    const orderId = await orderRow.getAttribute('data-order-id');

    if (orderId) {
      await page.goto(`/orders/${orderId}`);

      // Отклонение
      await page.click('[data-testid="reject-order-button"]');

      // Ввод причины
      await page.fill(
        '[data-testid="rejection-reason"]',
        'Недостаточно обоснования'
      );

      // Подтверждение
      await page.click('[data-testid="confirm-reject-button"]');

      // Проверка успешного отклонения
      await expect(page.locator('[data-testid="order-status"]')).toContainText(
        /отклонен/i
      );
    }
  });
});

// ============================================
// Выдача заказа
// ============================================

test.describe('Выдача заказа', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.storekeeper.email, testUsers.storekeeper.password);
  });

  test('должен показать согласованные заказы', async ({ page }) => {
    await page.goto('/orders?roleFilter=for_fulfillment');

    await expect(page.locator('[data-testid="orders-list"]')).toBeVisible();
    await expect(
      page.locator('[data-testid="order-status-approved"]')
    ).toHaveCount(0);
  });

  test('должен выдать заказ полностью', async ({ page }) => {
    await page.goto('/orders?roleFilter=for_fulfillment');

    const orderRow = page.locator('[data-testid="order-row"]:first-child');
    const orderId = await orderRow.getAttribute('data-order-id');

    if (orderId) {
      await page.goto(`/orders/${orderId}/fulfill`);

      // Отметка всех позиций как выданных
      await page.check('[data-testid="fulfill-all-checkbox"]');

      // Подтверждение выдачи
      await page.fill('[data-testid="fulfill-notes"]', 'Выдано полностью');
      await page.click('[data-testid="confirm-fulfill-button"]');

      // Проверка успешной выдачи
      await expect(page.locator('[data-testid="order-status"]')).toContainText(
        /выдан/i
      );
    }
  });

  test('должен выдать заказ частично', async ({ page }) => {
    await page.goto('/orders?roleFilter=for_fulfillment');

    const orderRow = page.locator('[data-testid="order-row"]:first-child');
    const orderId = await orderRow.getAttribute('data-order-id');

    if (orderId) {
      await page.goto(`/orders/${orderId}/fulfill`);

      // Отметка только первой позиции
      await page.check('[data-testid="fulfill-item-1"]');

      // Указание количества
      await page.fill('[data-testid="fulfill-quantity-1"]', '1');

      // Подтверждение
      await page.click('[data-testid="confirm-fulfill-button"]');

      // Проверка частичной выдачи
      await expect(page.locator('[data-testid="order-status"]')).toContainText(
        /частично/i
      );
    }
  });
});

// ============================================
// Сквозные сценарии
// ============================================

test.describe('Сквозные сценарии', () => {
  test('полный цикл создания и выдачи заказа', async ({ page }) => {
    // 1. Механик создает заказ
    await login(page, testUsers.mechanic.email, testUsers.mechanic.password);

    await page.goto('/catalog/parts/1');
    await page.click('[data-testid="add-to-cart-button"]');

    await page.click('[data-testid="cart-button"]');
    await page.click('[data-testid="checkout-button"]');

    await page.fill('[data-testid="order-notes"]', 'Сквозной тест');
    await page.click('[data-testid="create-order-button"]');

    await page.waitForURL(/\/orders\/\d+/);
    const orderUrl = page.url();
    const orderId = orderUrl.split('/').pop();

    // Отправка на согласование
    await page.click('[data-testid="submit-order-button"]');
    await expect(page.locator('[data-testid="order-status"]')).toContainText(
      /на согласовании/i
    );

    await logout(page);

    // 2. Менеджер согласует заказ
    await login(
      page,
      testUsers.repairManager.email,
      testUsers.repairManager.password
    );

    await page.goto(`/orders/${orderId}`);
    await page.click('[data-testid="approve-order-button"]');
    await page.selectOption('[data-testid="approval-priority"]', '2');
    await page.fill('[data-testid="approval-notes"]', 'Согласовано для теста');
    await page.click('[data-testid="confirm-approve-button"]');

    await expect(page.locator('[data-testid="order-status"]')).toContainText(
      /согласован/i
    );

    await logout(page);

    // 3. Кладовщик выдает заказ
    await login(page, testUsers.storekeeper.email, testUsers.storekeeper.password);

    await page.goto(`/orders/${orderId}/fulfill`);
    await page.check('[data-testid="fulfill-all-checkbox"]');
    await page.click('[data-testid="confirm-fulfill-button"]');

    await expect(page.locator('[data-testid="order-status"]')).toContainText(
      /выдан/i
    );
  });
});
