// tests/e2e/catalog-page.spec.ts
import { test, expect, Page } from '@playwright/test';

/**
 * Собирает все ошибки консоли (console.error и pageerror) на странице.
 */
const collectConsoleErrors = (page: Page): Promise<string[]> => {
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  page.on('pageerror', error => {
    errors.push(error.message);
  });
  return new Promise(resolve => {
    page.on('load', () => setTimeout(() => resolve(errors), 1000));
  });
};

test.describe('Каталог запчастей', () => {
  test('Страница /ru/catalog загружается без ошибок консоли', async ({ page }) => {
    // 1. Начинаем собирать ошибки
    const consoleErrorsPromise = collectConsoleErrors(page);

    // 2. Переходим на страницу
    const response = await page.goto('/ru/catalog', { waitUntil: 'networkidle', timeout: 30000 });

    // 3. Проверяем HTTP статус
    if (response?.status() !== 200) {
      const body = await response?.text();
      console.error(`HTTP ${response?.status()}: ${body}`);
      throw new Error(`Страница вернула статус ${response?.status()}, ожидался 200.`);
    }

    // 4. Проверяем, что страница содержит заголовок
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });

    // 5. Ждём, пока ошибки соберутся
    const consoleErrors = await consoleErrorsPromise;

    // 6. Если есть критические ошибки (исключая MISSING_MESSAGE), проваливаем тест
    const criticalErrors = consoleErrors.filter(e => 
      !e.includes('favicon') && 
      !e.includes('warn') &&
      !e.includes('MISSING_MESSAGE')
    );
    
    if (criticalErrors.length > 0) {
      await page.screenshot({ path: 'test-results/catalog-errors.png', fullPage: true });
      console.error('Консольные ошибки:', criticalErrors);
      throw new Error(`Страница содержит критические ошибки: ${criticalErrors.join('; ')}`);
    }

    // 7. Проверяем наличие дерева категорий
    const tree = page.locator('[data-testid="category-tree"]');
    await expect(tree).toBeVisible({ timeout: 5000 });
  });
});
