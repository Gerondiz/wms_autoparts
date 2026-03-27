// tests/e2e/catalog-page.spec.ts
import { test, expect, Page } from '@playwright/test';

/**
 * Собирает все ошибки консоли (console.error и pageerror) на странице.
 * Возвращает Promise, который резолвится через 1 секунду после загрузки страницы,
 * чтобы успеть поймать все асинхронные ошибки.
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
    const response = await page.goto('/ru/catalog', { waitUntil: 'networkidle' });

    // 3. Проверяем HTTP статус; если не 200 – выводим тело ответа
    if (response?.status() !== 200) {
      const body = await response?.text();
      console.error(`HTTP ${response?.status()}: ${body}`);
      throw new Error(`Страница вернула статус ${response?.status()}, ожидался 200.`);
    }

    // 4. Проверяем, что тело страницы отображается
    await expect(page.locator('body')).toBeVisible();

    // 5. Ждём, пока ошибки соберутся
    const consoleErrors = await consoleErrorsPromise;

    // 6. Если есть ошибки, делаем скриншот и проваливаем тест
    if (consoleErrors.length > 0) {
      await page.screenshot({ path: 'test-results/catalog-errors.png', fullPage: true });
      console.error('Консольные ошибки:', consoleErrors);
      throw new Error(`Страница содержит ошибки консоли: ${consoleErrors.join('; ')}`);
    }

    // 7. Дополнительная проверка: наличие дерева категорий (если у вас есть data-testid)
    const tree = page.locator('[data-testid="category-tree"]');
    await expect(tree).toBeVisible({ timeout: 5000 });
  });
});
