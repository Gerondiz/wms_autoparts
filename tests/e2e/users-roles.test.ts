/**
 * E2E тесты для управления пользователями и ролями
 * 
 * Сценарии:
 * - Просмотр пользователей
 * - Создание пользователя
 * - Редактирование пользователя
 * - Управление ролями
 */

import { test, expect, Page } from '@playwright/test';

const testUsers = {
  admin: {
    email: 'admin@wms-autoparts.local',
    password: 'password123',
  },
};

async function login(page: Page, email: string, password: string) {
  await page.goto('/auth/signin');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/(admin|dashboard)/);
}

test.describe('Управление пользователями', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.admin.email, testUsers.admin.password);
  });

  test('должен отобразить страницу пользователей', async ({ page }) => {
    await page.goto('/admin/users');

    await expect(page.locator('[data-testid="users-page"]')).toBeVisible();
    await expect(page.locator('[data-testid="users-table"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-row"]')).toHaveCount(1);
  });

  test('должен выполнить поиск пользователей', async ({ page }) => {
    await page.goto('/admin/users');

    await page.fill('[data-testid="user-search"]', 'механик');
    await page.press('[data-testid="user-search"]', 'Enter');

    const userRows = page.locator('[data-testid="user-row"]');
    const count = await userRows.count();

    for (let i = 0; i < count; i++) {
      await expect(userRows.nth(i)).toContainText(/механик/i);
    }
  });

  test('должен отфильтровать пользователей по роли', async ({ page }) => {
    await page.goto('/admin/users');

    await page.selectOption('[data-testid="role-filter"]', 'mechanic');
    await page.click('[data-testid="apply-filters-button"]');

    const userRows = page.locator('[data-testid="user-row"]');
    const count = await userRows.count();

    for (let i = 0; i < count; i++) {
      await expect(userRows.nth(i)).toContainText(/механик/i);
    }
  });

  test('должен открыть форму создания пользователя', async ({ page }) => {
    await page.goto('/admin/users');

    await page.click('[data-testid="create-user-button"]');

    await expect(page.locator('[data-testid="user-form-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="password-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="fullName-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="role-select"]')).toBeVisible();
  });

  test('должен создать пользователя', async ({ page }) => {
    await page.goto('/admin/users');

    await page.click('[data-testid="create-user-button"]');

    // Заполнение формы
    await page.fill('[data-testid="email-input"]', 'newuser@test.local');
    await page.fill('[data-testid="password-input"]', 'SecurePass123!');
    await page.fill('[data-testid="fullName-input"]', 'Новый Пользователь');
    await page.selectOption('[data-testid="role-select"]', '2');

    // Подтверждение
    await page.click('[data-testid="submit-user-button"]');

    // Проверка успешного создания
    await expect(page.locator('[data-testid="success-message"]')).toContainText(
      /пользователь создан/i
    );
  });

  test('должен показать ошибку при существующем email', async ({ page }) => {
    await page.goto('/admin/users');

    await page.click('[data-testid="create-user-button"]');

    // Ввод существующего email
    await page.fill('[data-testid="email-input"]', 'admin@wms-autoparts.local');
    await page.fill('[data-testid="password-input"]', 'SecurePass123!');
    await page.fill('[data-testid="fullName-input"]', 'Дубликат');
    await page.selectOption('[data-testid="role-select"]', '1');

    await page.click('[data-testid="submit-user-button"]');

    await expect(page.locator('[data-testid="error-message"]')).toContainText(
      /уже существует/i
    );
  });

  test('должен открыть форму редактирования', async ({ page }) => {
    await page.goto('/admin/users');

    await page.click('[data-testid="edit-user-button"]:first-child');

    await expect(page.locator('[data-testid="user-form-modal"]')).toBeVisible();
  });

  test('должен отредактировать пользователя', async ({ page }) => {
    await page.goto('/admin/users');

    await page.click('[data-testid="edit-user-button"]:first-child');

    // Изменение имени
    await page.fill('[data-testid="fullName-input"]', 'Обновленное Имя');

    await page.click('[data-testid="submit-user-button"]');

    await expect(page.locator('[data-testid="success-message"]')).toContainText(
      /обновлен/i
    );
  });

  test('должен деактивировать пользователя', async ({ page }) => {
    await page.goto('/admin/users');

    await page.click('[data-testid="deactivate-user-button"]:first-child');

    // Подтверждение
    await page.click('[data-testid="confirm-deactivate-button"]');

    await expect(page.locator('[data-testid="success-message"]')).toContainText(
      /деактивирован/i
    );
  });

  test('должен активировать пользователя', async ({ page }) => {
    await page.goto('/admin/users?status=inactive');

    await page.click('[data-testid="activate-user-button"]:first-child');

    // Подтверждение
    await page.click('[data-testid="confirm-activate-button"]');

    await expect(page.locator('[data-testid="success-message"]')).toContainText(
      /активирован/i
    );
  });
});

test.describe('Управление ролями', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.admin.email, testUsers.admin.password);
  });

  test('должен отобразить страницу ролей', async ({ page }) => {
    await page.goto('/admin/roles');

    await expect(page.locator('[data-testid="roles-page"]')).toBeVisible();
    await expect(page.locator('[data-testid="roles-table"]')).toBeVisible();
    await expect(page.locator('[data-testid="role-row"]')).toHaveCount(1);
  });

  test('должен открыть форму создания роли', async ({ page }) => {
    await page.goto('/admin/roles');

    await page.click('[data-testid="create-role-button"]');

    await expect(page.locator('[data-testid="role-form-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="role-name-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="role-displayName-input"]')).toBeVisible();
  });

  test('должен создать роль', async ({ page }) => {
    await page.goto('/admin/roles');

    await page.click('[data-testid="create-role-button"]');

    // Заполнение формы
    await page.fill('[data-testid="role-name-input"]', 'test_role');
    await page.fill(
      '[data-testid="role-displayName-input"]',
      'Тестовая роль'
    );

    // Выбор разрешений
    await page.check('[data-testid="permission-catalog_view"]');
    await page.check('[data-testid="permission-order_create"]');

    await page.click('[data-testid="submit-role-button"]');

    await expect(page.locator('[data-testid="success-message"]')).toContainText(
      /роль создана/i
    );
  });

  test('должен отредактировать роль', async ({ page }) => {
    await page.goto('/admin/roles');

    await page.click('[data-testid="edit-role-button"]:first-child');

    // Изменение отображаемого имени
    await page.fill(
      '[data-testid="role-displayName-input"]',
      'Обновленная роль'
    );

    // Изменение разрешений
    await page.check('[data-testid="permission-order_view_own"]');

    await page.click('[data-testid="submit-role-button"]');

    await expect(page.locator('[data-testid="success-message"]')).toContainText(
      /роль обновлена/i
    );
  });

  test('должен удалить роль', async ({ page }) => {
    await page.goto('/admin/roles');

    await page.click('[data-testid="delete-role-button"]:first-child');

    // Подтверждение удаления
    await page.click('[data-testid="confirm-delete-button"]');

    await expect(page.locator('[data-testid="success-message"]')).toContainText(
      /роль удалена/i
    );
  });
});

test.describe('Проверка прав доступа', () => {
  test('должен запретить доступ механику к странице пользователей', async ({
    page,
  }) => {
    // Вход как механик
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', 'mechanic@wms-autoparts.local');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/catalog/);

    // Попытка доступа к админке
    await page.goto('/admin/users');

    // Должен получить ошибку доступа
    await expect(page.locator('[data-testid="forbidden-page"]')).toBeVisible();
  });

  test('должен запретить доступ механику к странице ролей', async ({ page }) => {
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', 'mechanic@wms-autoparts.local');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/catalog/);

    await page.goto('/admin/roles');

    await expect(page.locator('[data-testid="forbidden-page"]')).toBeVisible();
  });

  test('должен разрешить доступ администратору к странице пользователей', async ({
    page,
  }) => {
    await login(page, testUsers.admin.email, testUsers.admin.password);

    await page.goto('/admin/users');

    await expect(page.locator('[data-testid="users-page"]')).toBeVisible();
  });

  test('должен разрешить доступ администратору к странице ролей', async ({
    page,
  }) => {
    await login(page, testUsers.admin.email, testUsers.admin.password);

    await page.goto('/admin/roles');

    await expect(page.locator('[data-testid="roles-page"]')).toBeVisible();
  });
});
