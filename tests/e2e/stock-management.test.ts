/**
 * E2E тесты для управления складом
 * 
 * Сценарии:
 * - Приход запчастей
 * - Списание запчастей
 * - Просмотр истории склада
 * - Управление остатками
 */

import { test, expect, Page } from '@playwright/test';

const testUsers = {
  storekeeper: {
    email: 'storekeeper@wms-autoparts.local',
    password: 'password123',
  },
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
  await page.waitForURL(/\/(catalog|stock|dashboard)/);
}

test.describe('Управление складом', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.storekeeper.email, testUsers.storekeeper.password);
  });

  test('должен отобразить страницу склада', async ({ page }) => {
    await page.goto('/stock');

    await expect(page.locator('[data-testid="stock-page"]')).toBeVisible();
    await expect(page.locator('[data-testid="stock-table"]')).toBeVisible();
    await expect(page.locator('[data-testid="stock-item"]')).toHaveCount(1);
  });

  test('должен выполнить поиск запчастей на складе', async ({ page }) => {
    await page.goto('/stock');

    await page.fill('[data-testid="stock-search"]', 'фильтр');
    await page.press('[data-testid="stock-search"]', 'Enter');

    await expect(page.locator('[data-testid="stock-table"]')).toBeVisible();
  });

  test('должен отфильтровать запчасти с низким остатком', async ({ page }) => {
    await page.goto('/stock?lowStock=true');

    await expect(page.locator('[data-testid="low-stock-badge"]')).toHaveCount(0);
  });

  test('должен открыть форму прихода', async ({ page }) => {
    await page.goto('/stock');

    await page.click('[data-testid="receipt-button"]');

    await expect(page.locator('[data-testid="receipt-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="part-select"]')).toBeVisible();
    await expect(page.locator('[data-testid="quantity-input"]')).toBeVisible();
  });

  test('должен выполнить приход запчастей', async ({ page }) => {
    await page.goto('/stock');

    await page.click('[data-testid="receipt-button"]');

    // Выбор запчасти
    await page.click('[data-testid="part-select"]');
    await page.click('[data-testid="part-option"]:first-child');

    // Ввод количества
    await page.fill('[data-testid="quantity-input"]', '50');

    // Выбор причины
    await page.selectOption('[data-testid="reason-select"]', 'receipt');

    // Заметки
    await page.fill('[data-testid="notes-input"]', 'Приход от поставщика');

    // Подтверждение
    await page.click('[data-testid="submit-receipt-button"]');

    // Проверка успешного прихода
    await expect(page.locator('[data-testid="success-message"]')).toContainText(
      /приход выполнен/i
    );
  });

  test('должен открыть форму списания', async ({ page }) => {
    await page.goto('/stock');

    await page.click('[data-testid="write-off-button"]');

    await expect(page.locator('[data-testid="write-off-modal"]')).toBeVisible();
  });

  test('должен выполнить списание запчастей', async ({ page }) => {
    await page.goto('/stock');

    await page.click('[data-testid="write-off-button"]');

    // Выбор запчасти
    await page.click('[data-testid="part-select"]');
    await page.click('[data-testid="part-option"]:first-child');

    // Ввод количества
    await page.fill('[data-testid="quantity-input"]', '5');

    // Выбор причины
    await page.selectOption('[data-testid="reason-select"]', 'write_off');

    // Заметки
    await page.fill('[data-testid="notes-input"]', 'Списание по акту');

    // Подтверждение
    await page.click('[data-testid="submit-write-off-button"]');

    // Проверка успешного списания
    await expect(page.locator('[data-testid="success-message"]')).toContainText(
      /списание выполнено/i
    );
  });

  test('должен показать ошибку при недостаточном количестве', async ({ page }) => {
    await page.goto('/stock');

    await page.click('[data-testid="write-off-button"]');

    // Выбор запчасти
    await page.click('[data-testid="part-select"]');
    await page.click('[data-testid="part-option"]:first-child');

    // Ввод большого количества
    await page.fill('[data-testid="quantity-input"]', '99999');

    // Выбор причины
    await page.selectOption('[data-testid="reason-select"]', 'write_off');

    // Подтверждение
    await page.click('[data-testid="submit-write-off-button"]');

    // Проверка ошибки
    await expect(page.locator('[data-testid="error-message"]')).toContainText(
      /недостаточно/i
    );
  });

  test('должен отобразить историю операций', async ({ page }) => {
    await page.goto('/stock/history');

    await expect(page.locator('[data-testid="stock-history-page"]')).toBeVisible();
    await expect(page.locator('[data-testid="history-table"]')).toBeVisible();
    await expect(page.locator('[data-testid="history-item"]')).toHaveCount(0);
  });

  test('должен отфильтровать историю по дате', async ({ page }) => {
    await page.goto('/stock/history');

    await page.fill('[data-testid="from-date"]', '2024-01-01');
    await page.fill('[data-testid="to-date"]', '2024-12-31');
    await page.click('[data-testid="apply-filters-button"]');

    await expect(page.locator('[data-testid="history-table"]')).toBeVisible();
  });

  test('должен отфильтровать историю по причине', async ({ page }) => {
    await page.goto('/stock/history');

    await page.selectOption('[data-testid="reason-filter"]', 'receipt');
    await page.click('[data-testid="apply-filters-button"]');

    // Все записи должны быть с причиной receipt
    const historyItems = page.locator('[data-testid="history-item"]');
    const count = await historyItems.count();

    for (let i = 0; i < count; i++) {
      await expect(historyItems.nth(i)).toContainText(/приход/i);
    }
  });
});

test.describe('Массовые операции на складе', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.admin.email, testUsers.admin.password);
  });

  test('должен открыть импорт остатков', async ({ page }) => {
    await page.goto('/stock/manage');

    await page.click('[data-testid="import-button"]');

    await expect(page.locator('[data-testid="import-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="file-upload"]')).toBeVisible();
  });

  test('должен загрузить файл импорта', async ({ page }) => {
    await page.goto('/stock/manage');

    await page.click('[data-testid="import-button"]');

    // Загрузка файла
    const fileContent = JSON.stringify([
      { partId: 1, stock: 100, reason: 'inventory_adjustment' },
      { partId: 2, stock: 50, reason: 'inventory_adjustment' },
    ]);

    await page.locator('[data-testid="file-upload"]').setInputFiles({
      name: 'import.json',
      mimeType: 'application/json',
      buffer: Buffer.from(fileContent),
    });

    await page.click('[data-testid="submit-import-button"]');

    await expect(page.locator('[data-testid="success-message"]')).toContainText(
      /импорт выполнен/i
    );
  });

  test('должен показать ошибку при невалидном файле', async ({ page }) => {
    await page.goto('/stock/manage');

    await page.click('[data-testid="import-button"]');

    // Загрузка невалидного файла
    await page.locator('[data-testid="file-upload"]').setInputFiles({
      name: 'invalid.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('invalid content'),
    });

    await page.click('[data-testid="submit-import-button"]');

    await expect(page.locator('[data-testid="error-message"]')).toContainText(
      /ошибка/i
    );
  });
});
