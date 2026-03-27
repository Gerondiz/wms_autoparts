import { test, expect } from './fixtures/console-logger';

test.describe('Каталог запчастей', () => {
  test('должен загружаться без ошибок консоли', async ({ page, consoleLogs }) => {
    // Переход на страницу каталога
    await page.goto('/ru/catalog');

    // Ожидание загрузки дерева
    await expect(page.locator('.MuiTreeView-root')).toBeVisible({ timeout: 10000 });

    // Проверка отсутствия ошибок консоли
    expect(consoleLogs.errors).toEqual([]);
    
    // Проверка отсутствия MISSING_MESSAGE
    const pageContent = await page.content();
    expect(pageContent).not.toContain('MISSING_MESSAGE');
    expect(pageContent).not.toMatch(/^[a-z]+\.[a-z]+$/m); // Ключи перевода вида catalog.title
  });

  test('дерево категорий должно отображаться', async ({ page }) => {
    await page.goto('/ru/catalog');

    // Проверка видимости дерева
    const tree = page.locator('.MuiTreeView-root');
    await expect(tree).toBeVisible();

    // Проверка наличия элементов дерева
    const treeItems = tree.locator('.MuiTreeItem-root');
    await expect(treeItems.count()).toBeGreaterThan(0);

    // Проверка наличия корневых элементов
    const rootItems = page.locator('[aria-level="1"]');
    await expect(rootItems.count()).toBeGreaterThan(0);
  });

  test('должен загружать запчасти при выборе узла', async ({ page }) => {
    await page.goto('/ru/catalog');

    // Клик на первый элемент дерева
    const firstTreeItem = page.locator('.MuiTreeItem-root').first();
    await firstTreeItem.click();

    // Ожидание загрузки списка запчастей
    const partsList = page.locator('.MuiGrid-root, table');
    await expect(partsList).toBeVisible({ timeout: 10000 });
  });

  test('хлебные крошки должны отображать путь', async ({ page }) => {
    await page.goto('/ru/catalog');

    // Проверка наличия хлебных крошек
    const breadcrumbs = page.locator('.MuiBreadcrumbs-root');
    await expect(breadcrumbs).toBeVisible();
  });
});
