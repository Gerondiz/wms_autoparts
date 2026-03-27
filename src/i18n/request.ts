/**
 * Конфигурация getRequestConfig для next-intl
 *
 * Загружает переводы для запрошенной локали
 */

import { getRequestConfig, type RequestConfig } from 'next-intl/server';
import { routing } from './routing';
import type { Locale } from './config';
import type { AbstractIntlMessages } from 'next-intl';

export default getRequestConfig(async ({ requestLocale }) => {
  // Ожидаем локаль из запроса
  let locale = await requestLocale;

  // Валидация локали
  if (
    !locale ||
    !routing.locales.includes(locale as 'ru' | 'en' | 'ar')
  ) {
    locale = routing.defaultLocale;
  }

  // Загружаем все namespace переводов
  const namespaces = ['common', 'auth', 'catalog', 'orders', 'stock', 'admin'];
  const messages: Record<string, any> = {};

  for (const namespace of namespaces) {
    try {
      const mod = await import(`../../locales/${locale}/${namespace}.json`);
      // Сохраняем структуру namespace
      messages[namespace] = mod.default;
    } catch (error) {
      console.warn(
        `Failed to load translations for namespace "${namespace}" (${locale}):`,
        error instanceof Error ? error.message : error
      );
    }
  }

  const config: RequestConfig = {
    locale: locale as Locale,
    messages: messages as AbstractIntlMessages,
    onError: (error) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('i18n error:', error);
      }
    },
  };

  return config;
});
