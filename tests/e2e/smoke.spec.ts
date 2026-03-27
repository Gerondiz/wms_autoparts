import { test, expect } from './fixtures/console-logger';

test.describe('Быстрые тесты', () => {
  test('должен загрузить главную страницу', async ({ page, consoleLogs }) => {
    await page.goto('/ru');
    
    // Проверка что страница загрузилась
    await expect(page).toHaveURL(/\/ru/);
    
    // Проверка отсутствия критических ошибок
    const criticalErrors = consoleLogs.errors.filter(e => 
      !e.includes('favicon') && 
      !e.includes('MISSING_MESSAGE')
    );
    
    console.log('Ошибки консоли:', criticalErrors);
    expect(criticalErrors.length).toBeLessThan(3);
  });

  test('должен показать каталог', async ({ page }) => {
    await page.goto('/ru/catalog');
    
    // Проверка что URL правильный
    await expect(page).toHaveURL(/\/ru\/catalog/);
    
    // Проверка заголовка
    const title = await page.title();
    expect(title).toContain('WMS');
  });
});
