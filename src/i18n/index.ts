/**
 * Экспорт всех i18n утилит и компонентов
 * 
 * @module @/i18n
 */

// Конфигурация
export {
  locales,
  defaultLocale,
  localePrefix,
  localeDirections,
  localeNames,
  localeNamesEn,
  localeFlags,
  localeHtmlLang,
  namespaces,
  isRTL,
  isLTR,
  getDirection,
  isValidLocale,
  type Locale,
  type Namespace,
} from './config';

// Роутинг
export { Link, redirect, usePathname, useRouter, routing } from './routing';

// Типы
export type {
  Direction,
  LocaleInfo,
  NamespaceContent,
  AllTranslations,
  TranslationFunction,
  WithTranslations,
  LanguageSwitcherProps,
  GetTranslationsConfig,
  TranslationsResult,
  LocaleCookie,
  UseTranslationsOptions,
  TranslationError,
  InterpolationParams,
  PluralizationParams,
  DateFormatOptions,
  NumberFormatOptions,
  RelativeTimeFormatOptions,
  I18nContextType,
} from './types';
