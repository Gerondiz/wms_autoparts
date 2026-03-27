import { test as base, expect } from '@playwright/test';

/**
 * Расширенный тест с поддержкой сбора логов консоли
 * 
 * Использование:
 * const { test } = require('./fixtures/console-logger');
 * 
 * test('пример теста', async ({ page, consoleLogs }) => {
 *   await page.goto('/ru/catalog');
 *   console.log(consoleLogs.errors); // Ошибки консоли
 * });
 */

export const test = base.extend<{
  consoleLogs: {
    logs: string[];
    warnings: string[];
    errors: string[];
  };
}>({
  consoleLogs: async ({ page }, use) => {
    const logs: string[] = [];
    const warnings: string[] = [];
    const errors: string[] = [];

    // Слушаем события консоли
    page.on('console', (msg) => {
      const type = msg.type();
      const text = msg.text();
      
      if (type === 'error') {
        errors.push(text);
      } else if (type === 'warning') {
        warnings.push(text);
      }
      
      logs.push(`[${type}] ${text}`);
    });

    // Слушаем ошибки страницы
    page.on('pageerror', (error) => {
      errors.push(`Page Error: ${error.message}`);
    });

    // Слушаем запросы которые failed
    page.on('requestfailed', (request) => {
      errors.push(`Request Failed: ${request.url()} - ${request.failure()?.errorText}`);
    });

    await use({ logs, warnings, errors });
  },
});

export { expect };
