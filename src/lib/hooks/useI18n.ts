/**
 * Хук useI18n для получения информации о текущей локали
 * 
 * Предоставляет:
 * - Текущую локаль
 * - Направление письма (LTR/RTL)
 * - Функцию смены локали
 * - RTL классы и стили
 */

'use client';

import { useMemo } from 'react';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import {
  locales,
  type Locale,
  localeNames,
  localeFlags,
  localeDirections,
  localeHtmlLang,
  isRTL,
  isLTR,
  getDirection,
} from '@/i18n/config';
import { getRTLClasses, getRTLStyles } from '@/lib/utils/rtl';

/**
 * Результат работы хука useI18n
 */
export interface UseI18nResult {
  /** Текущая локаль */
  locale: Locale;
  /** Направление письма */
  direction: 'ltr' | 'rtl';
  /** Является ли текущая локаль RTL */
  isRTL: boolean;
  /** Является ли текущая локаль LTR */
  isLTR: boolean;
  /** HTML lang атрибут */
  lang: string;
  /** Название локали */
  localeName: string;
  /** Флаг локали */
  localeFlag: string;
  /** Доступные локали */
  availableLocales: readonly Locale[];
  /** Функция смены локали */
  setLocale: (locale: Locale) => Promise<void>;
  /** RTL классы */
  rtlClasses: ReturnType<typeof getRTLClasses>;
  /** RTL стили */
  rtlStyles: React.CSSProperties;
  /** Переключить на следующую локаль */
  toggleLocale: () => Promise<void>;
}

/**
 * Хук для работы с i18n
 * 
 * @example
 * ```tsx
 * const { locale, direction, setLocale, isRTL } = useI18n();
 * 
 * return (
 *   <div dir={direction}>
 *     <p>Текущий язык: {locale}</p>
 *     <button onClick={() => setLocale('en')}>English</button>
 *   </div>
 * );
 * ```
 */
export function useI18n(): UseI18nResult {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  const direction = useMemo(() => getDirection(locale), [locale]);
  const rtl = useMemo(() => isRTL(locale), [locale]);
  const ltr = useMemo(() => isLTR(locale), [locale]);
  const lang = useMemo(() => localeHtmlLang[locale], [locale]);
  const localeName = useMemo(() => localeNames[locale], [locale]);
  const localeFlag = useMemo(() => localeFlags[locale], [locale]);
  const rtlClasses = useMemo(() => getRTLClasses(locale), [locale]);
  const rtlStyles = useMemo(() => getRTLStyles(locale), [locale]);

  /**
   * Смена локали с сохранением в cookie
   */
  const setLocale = async (newLocale: Locale): Promise<void> => {
    // Валидация локали
    if (!locales.includes(newLocale)) {
      console.error(`Invalid locale: ${newLocale}`);
      return;
    }

    // Сохранение в cookie на 1 год
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);
    document.cookie = `NEXT_LOCALE=${newLocale}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;

    // Переход на ту же страницу с новой локалью
    router.push(pathname, { locale: newLocale });
  };

  /**
   * Переключение на следующую локаль в списке
   */
  const toggleLocale = async (): Promise<void> => {
    const currentIndex = locales.indexOf(locale);
    const nextIndex = (currentIndex + 1) % locales.length;
    const nextLocale = locales[nextIndex];
    await setLocale(nextLocale);
  };

  return {
    locale,
    direction,
    isRTL: rtl,
    isLTR: ltr,
    lang,
    localeName,
    localeFlag,
    availableLocales: locales,
    setLocale,
    rtlClasses,
    rtlStyles,
    toggleLocale,
  };
}

/**
 * Хук для получения функции перевода из указанного namespace
 * 
 * @example
 * ```tsx
 * const { t } = useTranslation('common');
 * return <h1>{t('appName')}</h1>;
 * ```
 */
export function useTranslation<T extends string = string>(namespace?: string) {
  const { locale } = useI18n();

  // В клиентских компонентах используем useTranslations из next-intl
  // Этот хук предоставляет дополнительный интерфейс
  const t = (key: string, params?: Record<string, string | number>): string => {
    // В реальной реализации здесь будет вызов next-intl useTranslations
    // Для типобезопасности используем заглушку
    const fullKey = namespace ? `${namespace}.${key}` : key;
    
    // Возвращаем ключ как fallback
    // В production это будет заменено на реальный перевод
    if (params) {
      let result = fullKey;
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        result = result.replace(`{${paramKey}}`, String(paramValue));
      });
      return result;
    }
    
    return fullKey;
  };

  return {
    t,
    locale,
  };
}

export default useI18n;
