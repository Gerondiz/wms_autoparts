/**
 * Типы для системы локализации next-intl
 * 
 * Содержит типобезопасные определения для:
 * - Локалей и их направлений
 * - Namespace переводов
 * - Функций работы с переводами
 */

import type { Locale, Namespace } from './config';

/**
 * Направление письма
 */
export type Direction = 'ltr' | 'rtl';

/**
 * Информация о локали
 */
export interface LocaleInfo {
  /** Код локали (ru, en, ar) */
  code: Locale;
  /** Название на родном языке */
  name: string;
  /** Название на английском */
  nameEn: string;
  /** Emoji флаг */
  flag: string;
  /** Направление письма */
  direction: Direction;
  /** HTML lang атрибут */
  htmlLang: string;
}

/**
 * Преобразует вложенный объект переводов в плоский тип с точечными ключами
 * @example
 * { common: { appName: string } } → { 'common.appName': string }
 */
export type FlattenTranslations<T extends Record<string, unknown>, Prefix extends string = ''> = {
  [K in keyof T as K extends string
    ? T[K] extends Record<string, unknown>
      ? `${Prefix}${K}.${FlattenTranslations<T[K], ''> & string}`
      : `${Prefix}${K}`
    : never]: T[K] extends Record<string, unknown>
    ? FlattenTranslations<T[K], ''>
    : string;
} extends infer Flat
  ? { [K in keyof Flat as K extends string ? K : never]: Flat[K] }
  : never;

/**
 * Базовый тип для плоских ключей перевода
 */
export type TranslationKeys<T extends Record<string, unknown>> = {
  [K in keyof T]: T[K] extends Record<string, unknown>
    ? `${string & K}.${keyof T[K] & string}`
    : K extends string
      ? K
      : never;
}[keyof T];

/**
 * Контент для namespace с поддержкой вложенной структуры
 *
 * next-intl использует точечную нотацию для доступа к вложенным ключам:
 * t('common.appName') → обращается к { common: { appName: "..." } }
 */
export type NamespaceContent<T extends Namespace> = Record<string, string>;

/**
 * Объединённый тип всех переводов
 */
export type AllTranslations = {
  [K in Namespace]: NamespaceContent<K>;
};

/**
 * Тип для функции useTranslations
 * 
 * @example
 * ```tsx
 * const t = useTranslations('common');
 * t('appName') // "WMS Autoparts"
 * 
 * const t = useTranslations();
 * t('common.appName') // "WMS Autoparts"
 * ```
 */
export type TranslationFunction<T extends Namespace = Namespace> = (
  key: keyof NamespaceContent<T> | string,
  params?: Record<string, string | number>
) => string;

/**
 * Пропсы для компонента с переводами
 */
export interface WithTranslations<T extends Namespace = Namespace> {
  /** Функция перевода */
  t: TranslationFunction<T>;
  /** Текущая локаль */
  locale: Locale;
  /** Направление письма */
  direction: Direction;
}

/**
 * Пропсы для переключателя языка
 */
export interface LanguageSwitcherProps {
  /** Текущая локаль */
  currentLocale: Locale;
  /** Callback при смене локали */
  onLocaleChange?: (locale: Locale) => void;
  /** Показывать флаги */
  showFlags?: boolean;
  /** Показывать названия */
  showNames?: boolean;
  /** Стиль отображения */
  variant?: 'dropdown' | 'list' | 'icons';
  /** CSS класс */
  className?: string;
}

/**
 * Конфигурация для получения переводов
 */
export interface GetTranslationsConfig {
  /** Локаль для загрузки */
  locale: Locale;
  /** Namespace для загрузки */
  namespaces?: Namespace[];
}

/**
 * Результат загрузки переводов
 */
export interface TranslationsResult {
  /** Загруженная локаль */
  locale: Locale;
  /** Загруженные namespace */
  namespaces: Record<Namespace, Record<string, unknown>>;
}

/**
 * Тип для cookie с локалью
 */
export type LocaleCookie = {
  /** Код локали */
  locale: Locale;
  /** Дата установки */
  setAt: number;
};

/**
 * Опции для хука useTranslations
 */
export interface UseTranslationsOptions {
  /** Namespace по умолчанию */
  defaultNamespace?: Namespace;
  /** Fallback локаль */
  fallbackLocale?: Locale;
}

/**
 * Тип для сообщений об ошибках перевода
 */
export interface TranslationError {
  /** Тип ошибки */
  type: 'missing_key' | 'missing_namespace' | 'invalid_locale';
  /** Сообщение */
  message: string;
  /** Ключ, который вызвал ошибку */
  key?: string;
  /** Локаль */
  locale?: Locale;
}

/**
 * Тип для интерполяции параметров в переводах
 * 
 * @example
 * ```json
 * {
 *   "welcome": "Добро пожаловать, {name}!"
 * }
 * ```
 * ```ts
 * t('welcome', { name: 'Иван' }) // "Добро пожаловать, Иван!"
 * ```
 */
export type InterpolationParams = Record<string, string | number | boolean>;

/**
 * Тип для плюрализации
 * 
 * @example
 * ```json
 * {
 *   "items": "{count, plural, one {элемент} few {элемента} many {элементов} other {элементов}}"
 * }
 * ```
 */
export type PluralizationParams = {
  count: number;
  [key: string]: string | number;
};

/**
 * Тип для форматирования даты
 */
export interface DateFormatOptions extends Intl.DateTimeFormatOptions {
  /** Предопределённый формат */
  format?: 'short' | 'medium' | 'long' | 'full';
}

/**
 * Тип для форматирования чисел
 */
export interface NumberFormatOptions extends Intl.NumberFormatOptions {
  /** Предопределённый формат */
  format?: 'decimal' | 'currency' | 'percent' | 'unit';
  /** Валюта */
  currency?: string;
  /** Единица измерения */
  unit?: string;
}

/**
 * Тип для форматирования относительного времени
 */
export interface RelativeTimeFormatOptions extends Intl.RelativeTimeFormatOptions {
  /** Стиль отображения */
  style?: 'long' | 'short' | 'narrow';
  /** Порог для отображения в секундах/минутах/часах */
  threshold?: number;
}

/**
 * Тип для контекста локализации
 */
export interface I18nContextType {
  /** Текущая локаль */
  locale: Locale;
  /** Направление письма */
  direction: Direction;
  /** Функция перевода */
  t: TranslationFunction;
  /** Функция смены локали */
  setLocale: (locale: Locale) => void;
  /** Доступные локали */
  locales: readonly Locale[];
  /** Информация о текущей локали */
  localeInfo: LocaleInfo;
}
