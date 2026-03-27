import { test, expect } from './fixtures/console-logger';

test.describe('Мультиязычность', () => {
  const locales = ['ru', 'en', 'ar'];

  for (const locale of locales) {
    test(`должен загружать переводы для ${locale.toUpperCase()}`, async ({ page, consoleLogs }) => {
      await page.goto(`/${locale}/catalog`);

      // Ожидание загрузки
      await expect(page.locator('.MuiTreeView-root')).toBeVisible({ timeout: 10000 });

      // Проверка отсутствия ошибок перевода
      expect(consoleLogs.errors).toEqual([]);

      // Проверка отсутствия MISSING_MESSAGE
      const pageContent = await page.content();
      expect(pageContent).not.toContain('MISSING_MESSAGE');
      
      // Проверка что нет ключей перевода вместо значений
      const translationKeys = pageContent.match(/\b[a-z]+\.[a-z]+\b/gi) || [];
      const filteredKeys = translationKeys.filter(key => 
        !key.includes('http') && 
        !key.includes('www') &&
        key.length < 30
      );
      expect(filteredKeys.length).toBeLessThan(5); // Допускаем несколько ложных срабатываний
    });
  }

  test('должен переключать язык через dropdown', async ({ page }) => {
    await page.goto('/ru/catalog');

    // Поиск кнопки переключения языка
    const languageButton = page.locator('[aria-label*="Language"], [aria-label*="Язык"]').first();
    await expect(languageButton).toBeVisible();

    // Клик для открытия меню
    await languageButton.click();

    // Ожидание появления меню
    const menu = page.locator('[role="menu"], .MuiMenu-paper');
    await expect(menu).toBeVisible({ timeout: 5000 });

    // Выбор английского
    const englishOption = menu.locator('text=English').first();
    if (await englishOption.isVisible()) {
      await englishOption.click();
      
      // Ожидание перехода на /en
      await expect(page).toHaveURL(/\/en\/catalog/);
    }
  });

  test('должен применять RTL для арабского языка', async ({ page }) => {
    await page.goto('/ar/catalog');

    // Проверка dir="rtl" на html элементе
    const html = page.locator('html');
    await expect(html).toHaveAttribute('dir', 'rtl');

    // Проверка что Header имеет правильный direction
    const header = page.locator('header, [role="banner"]');
    if (await header.isVisible()) {
      const direction = await header.evaluate(el => 
        window.getComputedStyle(el).flexDirection
      );
      // Для RTL flexDirection должен быть row-reverse
      expect(direction).toBe('row-reverse');
    }

    // Проверка alignment текста
    const body = page.locator('body');
    const bodyDirection = await body.evaluate(el =>
      window.getComputedStyle(el).direction
    );
    expect(bodyDirection).toBe('rtl');
  });

  test('не должен иметь ошибок консоли при переключении языков', async ({ page, consoleLogs }) => {
    await page.goto('/ru/catalog');
    
    // Переключение на EN
    await page.goto('/en/catalog');
    await expect(page.locator('.MuiTreeView-root')).toBeVisible();
    
    // Переключение на AR
    await page.goto('/ar/catalog');
    await expect(page.locator('.MuiTreeView-root')).toBeVisible();

    // Проверка отсутствия ошибок
    expect(consoleLogs.errors).toEqual([]);
  });
});
