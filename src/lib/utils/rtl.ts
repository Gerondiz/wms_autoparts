/**
 * Утилиты для RTL (Right-to-Left) поддержки
 * 
 * Предоставляет функции для работы с направлениями текста
 * и генерации CSS классов для RTL локалей
 */

import type { Locale } from '@/i18n/config';

/**
 * Проверка, является ли локаль RTL
 */
export function isRTL(locale: Locale): boolean {
  return locale === 'ar';
}

/**
 * Проверка, является ли локаль LTR
 */
export function isLTR(locale: Locale): boolean {
  return !isRTL(locale);
}

/**
 * Получение HTML direction атрибута
 */
export function getDirection(locale: Locale): 'ltr' | 'rtl' {
  return isRTL(locale) ? 'rtl' : 'ltr';
}

/**
 * Получение HTML lang атрибута
 */
export function getLang(locale: Locale): string {
  const langMap: Record<Locale, string> = {
    ru: 'ru',
    en: 'en',
    ar: 'ar',
  };
  return langMap[locale];
}

/**
 * Генерация RTL-aware CSS класса
 * 
 * @example
 * ```tsx
 * // Для margin-left в LTR и margin-right в RTL:
 * className={rtlClass('ml-4', 'rtl:ml-0 rtl:mr-4')}
 * 
 * // Для text alignment:
 * className={rtlClass('text-left', 'rtl:text-right')}
 * ```
 */
export function rtlClass(ltrClass: string, rtlClass?: string): string {
  if (!rtlClass) return ltrClass;
  return `${ltrClass} ${rtlClass}`;
}

/**
 * RTL-aware классы для отступов
 * 
 * Возвращает классы для margin/padding с учётом направления
 */
export const rtlSpacing = {
  /** Margin left/right с учётом RTL */
  mx: (value: string) => `ml-${value} rtl:ml-0 rtl:mr-${value}`,
  /** Padding left/right с учётом RTL */
  px: (value: string) => `pl-${value} rtl:pl-0 rtl:pr-${value}`,
  /** Margin left с учётом RTL */
  ml: (value: string) => `ml-${value} rtl:ml-0 rtl:mr-${value}`,
  /** Margin right с учётом RTL */
  mr: (value: string) => `mr-${value} rtl:mr-0 rtl:ml-${value}`,
  /** Padding left с учётом RTL */
  pl: (value: string) => `pl-${value} rtl:pl-0 rtl:pr-${value}`,
  /** Padding right с учётом RTL */
  pr: (value: string) => `pr-${value} rtl:pr-0 rtl:pl-${value}`,
};

/**
 * RTL-aware классы для выравнивания текста
 */
export const rtlText = {
  left: 'text-left rtl:text-right',
  right: 'text-right rtl:text-left',
  center: 'text-center',
  justify: 'text-justify',
};

/**
 * RTL-aware классы для flexbox
 */
export const rtlFlex = {
  /** Flex row с учётом RTL */
  row: 'flex-row rtl:flex-row-reverse',
  /** Flex row-reverse с учётом RTL */
  rowReverse: 'flex-row-reverse rtl:flex-row',
  /** Items start с учётом RTL */
  itemsStart: 'items-start rtl:items-end',
  /** Items end с учётом RTL */
  itemsEnd: 'items-end rtl:items-start',
  /** Justify start с учётом RTL */
  justifyStart: 'justify-start rtl:justify-end',
  /** Justify end с учётом RTL */
  justifyEnd: 'justify-end rtl:justify-start',
};

/**
 * RTL-aware классы для позиционирования
 */
export const rtlPosition = {
  /** Left с учётом RTL */
  left: (value: string) => `left-${value} rtl:left-auto rtl:right-${value}`,
  /** Right с учётом RTL */
  right: (value: string) => `right-${value} rtl:right-auto rtl:left-${value}`,
  /** Top left с учётом RTL */
  topLeft: 'top-0 left-0 rtl:left-auto rtl:right-0',
  /** Top right с учётом RTL */
  topRight: 'top-0 right-0 rtl:right-auto rtl:left-0',
};

/**
 * RTL-aware классы для border radius
 */
export const rtlBorderRadius = {
  /** Rounded left с учётом RTL */
  left: (value: string) => `rounded-l-${value} rtl:rounded-l-none rtl:rounded-r-${value}`,
  /** Rounded right с учётом RTL */
  right: (value: string) => `rounded-r-${value} rtl:rounded-r-none rtl:rounded-l-${value}`,
};

/**
 * RTL-aware классы для иконок
 * 
 * Для иконок, которые должны быть зеркальны в RTL
 */
export const rtlIcon = {
  /** Зеркальная иконка в RTL */
  flip: 'rtl:scale-x-[-1]',
  /** Не зеркальная иконка в RTL */
  noFlip: '',
};

/**
 * Получение всех RTL-aware классов для компонента
 */
export interface RTLClasses {
  direction: 'ltr' | 'rtl';
  isRTL: boolean;
  isLTR: boolean;
  spacing: typeof rtlSpacing;
  text: typeof rtlText;
  flex: typeof rtlFlex;
  position: typeof rtlPosition;
  borderRadius: typeof rtlBorderRadius;
  icon: typeof rtlIcon;
}

/**
 * Создание объекта RTL классов для локали
 */
export function getRTLClasses(locale: Locale): RTLClasses {
  const direction = getDirection(locale);
  const isRtl = isRTL(locale);
  const isLtr = isLTR(locale);

  return {
    direction,
    isRTL: isRtl,
    isLTR: isLtr,
    spacing: rtlSpacing,
    text: rtlText,
    flex: rtlFlex,
    position: rtlPosition,
    borderRadius: rtlBorderRadius,
    icon: rtlIcon,
  };
}

/**
 * CSS переменные для RTL
 * 
 * Добавляются в :root или [dir="rtl"]
 */
export const rtlCSSVariables = {
  /** Направление текста по умолчанию */
  direction: '--direction: ltr',
  /** Направление текста для RTL */
  directionRTL: '--direction: rtl',
  /** Отступ для start (left в LTR, right в RTL) */
  inlineStart: '--inline-start: left',
  /** Отступ для end (right в LTR, left в RTL) */
  inlineEnd: '--inline-end: right',
};

/**
 * Генерация inline стилей для RTL
 */
export function getRTLStyles(locale: Locale): React.CSSProperties {
  return {
    direction: getDirection(locale),
  };
}

/**
 * Хук для получения RTL информации
 * 
 * @deprecated Используйте useI18n из @/lib/hooks/useI18n
 */
export function useRTLInfo(locale: Locale) {
  return {
    direction: getDirection(locale),
    isRTL: isRTL(locale),
    isLTR: isLTR(locale),
    lang: getLang(locale),
    classes: getRTLClasses(locale),
    styles: getRTLStyles(locale),
  };
}
