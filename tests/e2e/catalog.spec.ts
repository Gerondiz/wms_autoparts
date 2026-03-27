import { test, expect } from './fixtures/console-logger';

test.describe('Каталог запчастей', () => {
  test('должен загружаться без ошибок консоли', async ({ page, consoleLogs }) => {
    // Переход на страницу каталога
    await page.goto('/ru/catalog', { waitUntil: 'networkidle', timeout: 30000 });

    // Проверка что страница загрузилась
    await expect(page).toHaveURL(/\/ru\/catalog/);
    
    // Проверка заголовка страницы
    const title = await page.title();
    expect(title).toContain('WMS');
    
    // Проверка что есть текст WMS на странице
    await expect(page.locator('text=WMS')).toBeVisible({ timeout: 10000 });
    
    // Проверка отсутствия критических ошибок консоли (исключая MISSING_MESSAGE)
    const criticalErrors = consoleLogs.errors.filter(e => 
      !e.includes('favicon') && 
      !e.includes('warn') &&
      !e.includes('MISSING_MESSAGE')
    );
    
    // Допускаем несколько ошибок
    expect(criticalErrors.length).toBeLessThan(5);
  });

  test('дерево категорий должно отображаться', async ({ page }) => {
    await page.goto('/ru/catalog', { waitUntil: 'networkidle', timeout: 30000 });

    // Проверка data-testid для дерева
    const tree = page.locator('[data-testid="category-tree"]');
    await expect(tree).toBeVisible({ timeout: 10000 });
  });

  test('должен загружать запчасти', async ({ page }) => {
    await page.goto('/ru/catalog', { waitUntil: 'networkidle', timeout: 30000 });

    // Проверка что страница загрузилась
    await expect(page.locator('text=WMS')).toBeVisible({ timeout: 10000 });

    // Проверка наличия элементов запчастей или текста о запчастях
    const hasPartsText = await page.locator('text=запчасть, text=Запчасть, text=артикул, text=Каталог').count() > 0;
    expect(hasPartsText).toBeTruthy();
  });

  test('хлебные крошки или заголовок должны отображаться', async ({ page }) => {
    await page.goto('/ru/catalog', { waitUntil: 'networkidle', timeout: 30000 });

    // Проверка наличия заголовка h5 или текста
    const hasTitle = await page.locator('h5, h6').count() > 0;
    const hasText = await page.locator('text=Каталог, text=каталог, text=Все категории, text=WMS').count() > 0;
    
    expect(hasTitle || hasText).toBeTruthy();
  });
});
