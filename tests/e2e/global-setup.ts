/**
 * Global setup для E2E тестов
 * 
 * Выполняется перед всеми тестами:
 * - Подготовка тестовых данных
 * - Запуск миграций БД
 * - Создание тестовых пользователей
 */

import { FullConfig } from '@playwright/test';
import { execSync } from 'child_process';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Запуск global setup для E2E тестов...');

  const baseURL = config.projects[0].use.baseURL || 'http://localhost:3000';

  // Подготовка БД
  console.log('📦 Подготовка тестовой базы данных...');
  try {
    // Запуск миграций
    execSync('npm run db:push', { stdio: 'inherit' });
    console.log('✅ Миграции выполнены');

    // Сидирование тестовых данных
    execSync('npm run db:seed', { stdio: 'inherit' });
    console.log('✅ Тестовые данные загружены');
  } catch (error) {
    console.error('❌ Ошибка при подготовке БД:', error);
    throw error;
  }

  // Сохранение базового URL в процесс
  process.env.BASE_URL = baseURL;

  console.log(`✅ Global setup завершен. baseURL: ${baseURL}`);
}

export default globalSetup;
