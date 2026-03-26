/**
 * Конфигурация локалей для next-intl
 * 
 * Определяет поддерживаемые языки, их направления (LTR/RTL)
 * и другие настройки локализации
 */

import { LocalePrefix } from 'next-intl/routing';

/**
 * Список поддерживаемых локалей
 */
export const locales = ['ru', 'en', 'ar'] as const;

/**
 * Тип локали - извлекается из массива locales
 */
export type Locale = (typeof locales)[number];

/**
 * Локаль по умолчанию
 */
export const defaultLocale: Locale = 'ru';

/**
 * Префикс локали в URL
 * - 'always': всегда показывать локаль в URL
 * - 'as-needed': показывать только когда отличается от default
 * - 'never': никогда не показывать (не рекомендуется для мультиязычных сайтов)
 */
export const localePrefix: LocalePrefix = 'always';

/**
 * Настройки направлений письма для каждой локали
 * 
 * @remarks
 * - LTR (Left-to-Right): слева направо (русский, английский)
 * - RTL (Right-to-Left): справа налево (арабский, иврит)
 */
export const localeDirections: Record<Locale, 'ltr' | 'rtl'> = {
  ru: 'ltr',
  en: 'ltr',
  ar: 'rtl',
};

/**
 * Названия локалей на родном языке
 */
export const localeNames: Record<Locale, string> = {
  ru: 'Русский',
  en: 'English',
  ar: 'العربية',
};

/**
 * Названия локалей на английском (для fallback)
 */
export const localeNamesEn: Record<Locale, string> = {
  ru: 'Russian',
  en: 'English',
  ar: 'Arabic',
};

/**
 * Флаги локалей (emoji)
 */
export const localeFlags: Record<Locale, string> = {
  ru: '🇷🇺',
  en: '🇬🇧',
  ar: '🇸🇦',
};

/**
 * Проверка, является ли локаль RTL
 */
export function isRTL(locale: Locale): boolean {
  return localeDirections[locale] === 'rtl';
}

/**
 * Проверка, является ли локаль LTR
 */
export function isLTR(locale: Locale): boolean {
  return localeDirections[locale] === 'ltr';
}

/**
 * Получение направления для локали
 */
export function getDirection(locale: Locale): 'ltr' | 'rtl' {
  return localeDirections[locale];
}

/**
 * Проверка валидности локали
 */
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

/**
 * Файлы переводов, доступные для каждой локали
 */
export const namespaces = [
  'common',
  'catalog',
  'orders',
  'stock',
  'admin',
  'auth',
] as const;

/**
 * Тип namespace
 */
export type Namespace = (typeof namespaces)[number];

/**
 * HTML lang атрибут для каждой локали
 */
export const localeHtmlLang: Record<Locale, string> = {
  ru: 'ru',
  en: 'en',
  ar: 'ar',
};
