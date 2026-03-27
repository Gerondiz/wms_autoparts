import { test, expect } from './fixtures/console-logger';

test.describe('Каталог - быстрая проверка', () => {
  test('должен открыть страницу каталога', async ({ page, consoleLogs }) => {
    // Переход на страницу
    await page.goto('/ru/catalog', { waitUntil: 'commit', timeout: 30000 });
    
    // Проверка что страница загрузилась
    await expect(page).toHaveURL(/\/ru\/catalog/);
    
    // Проверка заголовка
    const title = await page.title();
    expect(title).toContain('WMS');
    
    // Проверка что страница содержит заголовок
    await expect(page.locator('h1, h2, h3').first()).toBeVisible({ timeout: 10000 });
    
    // Логи консоли
    console.log('Ошибки:', consoleLogs.errors.length);
    console.log('Предупреждения:', consoleLogs.warnings.length);
    
    // Допускаем некоторые ошибки (favicon, warnings, MISSING_MESSAGE)
    const criticalErrors = consoleLogs.errors.filter(e => 
      !e.includes('favicon') && 
      !e.includes('warn') &&
      !e.includes('MISSING_MESSAGE')
    );
    
    expect(criticalErrors.length).toBeLessThan(5);
  });
});
