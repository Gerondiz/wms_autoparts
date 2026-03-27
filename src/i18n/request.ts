/**
 * Конфигурация getRequestConfig для next-intl
 *
 * Загружает все namespace переводов для запрошенной локали
 *
 * @see https://next-intl-docs.com/docs/getting-started/app-router/server-components
 */

import { getRequestConfig, type RequestConfig } from 'next-intl/server';
import { routing } from './routing';
import type { Locale, Namespace } from './config';
import type { AbstractIntlMessages } from 'next-intl';

/**
 * Список namespace для загрузки
 */
const namespaces: Namespace[] = [
  'common',
  'catalog',
  'orders',
  'stock',
  'admin',
  'auth',
];

/**
 * Динамический импорт файла переводов
 */
async function loadNamespace(locale: string, namespace: string) {
  try {
    const mod = await import(`../../locales/${locale}/${namespace}.json`);
    return mod.default as AbstractIntlMessages;
  } catch (error) {
    console.warn(
      `Failed to load namespace "${namespace}" for locale "${locale}":`,
      error instanceof Error ? error.message : error
    );
    return {};
  }
}

/**
 * Загрузка всех namespace для локали
 */
async function loadTranslations(locale: string) {
  const translations: Record<string, AbstractIntlMessages> = {};

  for (const namespace of namespaces) {
    translations[namespace] = await loadNamespace(locale, namespace);
  }

  return translations;
}

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

  // Загружаем все переводы для локали
  const messages = await loadTranslations(locale as string);

  // Объединяем все namespace в один объект messages
  // Каждый namespace остаётся в своём ключевом пространстве
  const combinedMessages: AbstractIntlMessages = {
    ...messages.common,
    ...messages.catalog,
    ...messages.orders,
    ...messages.stock,
    ...messages.admin,
    ...messages.auth,
  };

  const config: RequestConfig = {
    locale: locale as Locale,
    messages: combinedMessages,
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
