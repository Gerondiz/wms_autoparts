/**
 * Конфигурация getRequestConfig для next-intl
 *
 * Загружает переводы для запрошенной локали
 *
 * @see https://next-intl-docs.com/docs/getting-started/app-router/server-components
 */

import { getRequestConfig, type RequestConfig } from 'next-intl/server';
import { routing } from './routing';
import type { Locale } from './config';
import type { AbstractIntlMessages } from 'next-intl';

/**
 * Конфигурация для next-intl
 *
 * @example
 * ```tsx
 * // В серверном компоненте:
 * import { getTranslations } from 'next-intl/server';
 *
 * const t = await getTranslations('common');
 * return <h1>{t('appName')}</h1>;
 * ```
 *
 * @example
 * ```tsx
 * // В клиентском компоненте:
 * 'use client';
 * import { useTranslations } from 'next-intl';
 *
 * export default function MyComponent() {
 *   const t = useTranslations('common');
 *   return <h1>{t('appName')}</h1>;
 * }
 * ```
 */
export default getRequestConfig(async ({ requestLocale }) => {
  // Ожидаем локаль из запроса
  let locale = await requestLocale;

  // Валидация локали - если невалидна, используем локаль по умолчанию
  if (
    !locale ||
    !routing.locales.includes(locale as 'ru' | 'en' | 'ar')
  ) {
    locale = routing.defaultLocale;
  }

  // Загружаем переводы для локали
  let messages: AbstractIntlMessages;
  try {
    const mod = await import(`../../locales/${locale}/common.json`);
    messages = mod.default as AbstractIntlMessages;
  } catch (error) {
    console.warn(
      `Failed to load translations for locale "${locale}":`,
      error instanceof Error ? error.message : error
    );
    messages = {};
  }

  const config: RequestConfig = {
    locale: locale as Locale,
    messages,
    // Опционально: включаем onError для отладки
    onError: (error) => {
      // В production логируем только предупреждения
      if (process.env.NODE_ENV === 'development') {
        console.error('i18n error:', error);
      }
    },
  };

  return config;
});
