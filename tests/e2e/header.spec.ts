import { test, expect } from './fixtures/console-logger';

test.describe('Header и навигация', () => {
  test('Header должен отображаться на всех страницах', async ({ page }) => {
    const pages = [
      '/ru/catalog',
      '/ru/admin',
      '/ru/orders',
      '/ru/stock',
    ];

    for (const path of pages) {
      await page.goto(path);
      
      // Проверка видимости Header
      const header = page.locator('header, .MuiAppBar-root, [role="banner"]');
      await expect(header).toBeVisible();
    }
  });

  test('Header должен содержать логотип', async ({ page }) => {
    await page.goto('/ru/catalog');

    // Поиск логотипа по тексту
    const logo = page.locator('text=WMS Autoparts').first();
    await expect(logo).toBeVisible();
  });

  test('Header должен содержать переключатель языка', async ({ page }) => {
    await page.goto('/ru/catalog');

    // Поиск кнопки языка
    const languageSwitcher = page.locator(
      '[aria-label*="Language"], [aria-label*="Язык"], .MuiIconButton-root:has-text("🌐")'
    ).first();
    
    await expect(languageSwitcher).toBeVisible();
  });

  test('Header должен содержать иконку профиля', async ({ page }) => {
    await page.goto('/ru/catalog');

    // Поиск иконки профиля
    const profileIcon = page.locator(
      '[aria-label*="Profile"], [aria-label*="Профиль"], .MuiAvatar-root'
    ).first();
    
    await expect(profileIcon).toBeVisible();
  });

  test('Header не должен иметь ошибок рендеринга', async ({ page, consoleLogs }) => {
    await page.goto('/ru/catalog');

    // Проверка отсутствия ошибок рендеринга
    const pageErrors = consoleLogs.errors.filter(err => 
      !err.includes('favicon') && // Игнорируем ошибки favicon
      !err.includes('404')
    );
    
    expect(pageErrors).toEqual([]);
  });
});
