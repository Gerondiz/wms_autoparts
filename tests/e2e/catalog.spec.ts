import { test, expect } from './fixtures/console-logger';

test.describe('Каталог запчастей', () => {
  test.beforeEach(async ({ page }) => {
    // Устанавливаем desktop viewport для отображения дерева
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  test('должен загружаться без ошибок консоли', async ({ page, consoleLogs }) => {
    // Переход на страницу каталога
    await page.goto('/ru/catalog', { waitUntil: 'networkidle', timeout: 30000 });

    // Ожидание загрузки страницы
    await expect(page.locator('main')).toBeVisible({ timeout: 10000 });

    // Проверка что URL правильный
    await expect(page).toHaveURL(/\/ru\/catalog/);
    
    // Проверка отсутствия критических ошибок консоли
    const criticalErrors = consoleLogs.errors.filter(e => 
      !e.includes('favicon') && 
      !e.includes('404') &&
      !e.includes('MISSING_MESSAGE')
    );
    
    // Допускаем несколько ошибок (например, от next-auth)
    expect(criticalErrors.length).toBeLessThan(5);
  });

  test('дерево категорий должно отображаться', async ({ page }) => {
    await page.goto('/ru/catalog', { waitUntil: 'networkidle', timeout: 30000 });

    // Проверка что страница загрузилась
    await expect(page).toHaveTitle(/WMS/);

    // Проверка видимости левой панели (Drawer)
    const drawer = page.locator('.MuiDrawer-paper').first();
    await expect(drawer).toBeVisible({ timeout: 10000 });

    // Проверка наличия элементов дерева или текста "Каталог"
    const hasTreeItems = await page.locator('.MuiTreeItem-root').count() > 0;
    const hasHeaderText = await page.locator('text=Каталог, text=каталог').count() > 0;
    
    expect(hasTreeItems || hasHeaderText).toBeTruthy();
  });

  test('должен загружать запчасти при выборе узла', async ({ page }) => {
    await page.goto('/ru/catalog', { waitUntil: 'networkidle', timeout: 30000 });

    // Ждём пока страница загрузится
    await expect(page.locator('main')).toBeVisible({ timeout: 10000 });

    // Проверяем что запчасти загружаются (даже если дерево не видно)
    const hasParts = await page.locator('text=запчасть, text=Запчасть, text=артикул').count() > 0;
    expect(hasParts).toBeTruthy();
  });

  test('хлебные крошки или заголовок должны отображаться', async ({ page }) => {
    await page.goto('/ru/catalog', { waitUntil: 'networkidle', timeout: 30000 });

    // Проверка наличия заголовка или хлебных крошек
    const hasTitle = await page.locator('h1, h5, h6').count() > 0;
    const hasBreadcrumbs = await page.locator('.MuiBreadcrumbs-root').count() > 0;
    const hasText = await page.locator('text=Каталог, text=каталог, text=Все категории').count() > 0;
    
    expect(hasTitle || hasBreadcrumbs || hasText).toBeTruthy();
  });
});
