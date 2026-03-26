/**
 * Global teardown для E2E тестов
 * 
 * Выполняется после всех тестов:
 * - Очистка тестовых данных
 * - Закрытие соединений
 */

import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Запуск global teardown...');

  // Очистка тестовых данных (опционально)
  // В production среде лучше не очищать БД автоматически

  console.log('✅ Global teardown завершен');
}

export default globalTeardown;
