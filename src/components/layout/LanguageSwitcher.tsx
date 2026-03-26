/**
 * LanguageSwitcher компонент для переключения языка
 * 
 * Особенности:
 * - Выпадающее меню с флагами и названиями
 * - Сохранение выбора в cookie
 * - RTL поддержка для арабского языка
 * - Плавные анимации
 * - Доступность (a11y)
 * 
 * @example
 * ```tsx
 * <LanguageSwitcher />
 * ```
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import {
  locales,
  type Locale,
  localeNames,
  localeFlags,
  localeDirections,
  isRTL,
} from '@/i18n/config';

/**
 * Пропсы компонента LanguageSwitcher
 */
export interface LanguageSwitcherProps {
  /** Вариант отображения */
  variant?: 'dropdown' | 'list' | 'icons';
  /** Показывать флаги */
  showFlags?: boolean;
  /** Показывать названия */
  showNames?: boolean;
  /** Показывать текущую локаль */
  showCurrentLocale?: boolean;
  /** CSS класс */
  className?: string;
  /** Размер иконки */
  iconSize?: 'sm' | 'md' | 'lg';
}

/**
 * Компонент переключателя языка
 */
export default function LanguageSwitcher({
  variant = 'dropdown',
  showFlags = true,
  showNames = true,
  showCurrentLocale = true,
  className = '',
  iconSize = 'md',
}: LanguageSwitcherProps) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Компонент смонтирован (для избежания гидратационных ошибок)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Закрытие меню при клике вне его
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Закрытие меню при нажатии Escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  /**
   * Обработчик смены языка
   */
  const handleLocaleChange = useCallback(
    (newLocale: Locale) => {
      // Сохраняем выбор в cookie (next-intl делает это автоматически)
      // Устанавливаем cookie на 1 год
      const expires = new Date();
      expires.setFullYear(expires.getFullYear() + 1);
      document.cookie = `NEXT_LOCALE=${newLocale}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;

      // Переходим на ту же страницу с новой локалью
      router.push(pathname, { locale: newLocale });
      setIsOpen(false);
    },
    [router, pathname]
  );

  /**
   * Переключение состояния меню
   */
  const toggleMenu = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  /**
   * Размеры иконок
   */
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  /**
   * Текущая локаль информация
   */
  const currentLocaleInfo = {
    code: locale,
    name: localeNames[locale],
    flag: localeFlags[locale],
    direction: localeDirections[locale],
  };

  // Не рендерим до монтирования (избегаем гидратационных ошибок)
  if (!isMounted) {
    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${className}`}
        aria-label="Выбор языка"
      >
        <span className="text-lg">🌐</span>
        {showNames && showCurrentLocale && (
          <span className="text-sm font-medium">...</span>
        )}
      </div>
    );
  }

  /**
   * Рендер dropdown варианта
   */
  if (variant === 'dropdown') {
    return (
      <div
        ref={menuRef}
        className={`relative inline-block text-left ${className}`}
        dir={currentLocaleInfo.direction}
      >
        {/* Кнопка переключателя */}
        <button
          ref={buttonRef}
          type="button"
          onClick={toggleMenu}
          aria-expanded={isOpen}
          aria-haspopup="true"
          aria-label="Выбрать язык"
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg
                     bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700
                     transition-colors duration-200 ease-in-out
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                     dark:focus:ring-offset-gray-900"
        >
          {showFlags && (
            <span className={`${iconSizes.lg}`} role="img" aria-label={currentLocaleInfo.name}>
              {currentLocaleInfo.flag}
            </span>
          )}
          {showNames && showCurrentLocale && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {currentLocaleInfo.name}
            </span>
          )}
          {/* Иконка стрелки */}
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Выпадающее меню */}
        {isOpen && (
          <div
            className={`absolute z-50 mt-2 w-48 rounded-xl shadow-lg ring-1 ring-black ring-opacity-5
                       bg-white dark:bg-gray-800
                       transform transition-all duration-200 ease-out
                       origin-top ${
                         isRTL(locale)
                           ? 'right-0 origin-top-right'
                           : 'left-0 origin-top-left'
                       }
                       animate-in fade-in zoom-in-95 duration-200`}
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="language-menu"
          >
            <div
              className="py-1"
              role="none"
              dir={isRTL(locale) ? 'rtl' : 'ltr'}
            >
              {locales.map((loc) => {
                const isActive = loc === locale;
                return (
                  <button
                    key={loc}
                    type="button"
                    role="menuitem"
                    onClick={() => handleLocaleChange(loc)}
                    aria-current={isActive ? 'true' : undefined}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm
                               transition-colors duration-150 ease-in-out
                               focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700
                               ${
                                 isActive
                                   ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                   : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                               }
                               ${isRTL(loc) ? 'flex-row-reverse' : ''}`}
                  >
                    {showFlags && (
                      <span
                        className={`${iconSizes.md}`}
                        role="img"
                        aria-label={localeNames[loc]}
                      >
                        {localeFlags[loc]}
                      </span>
                    )}
                    {showNames && (
                      <span className="font-medium">{localeNames[loc]}</span>
                    )}
                    {isActive && (
                      <svg
                        className={`w-4 h-4 ml-auto ${
                          isRTL(loc) ? 'mr-auto' : ''
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  /**
   * Рендер list варианта
   */
  if (variant === 'list') {
    return (
      <div
        className={`inline-flex items-center gap-1 ${className}`}
        role="group"
        aria-label="Выбор языка"
        dir={currentLocaleInfo.direction}
      >
        {locales.map((loc) => {
          const isActive = loc === locale;
          return (
            <button
              key={loc}
              type="button"
              onClick={() => handleLocaleChange(loc)}
              aria-current={isActive ? 'true' : undefined}
              aria-label={`Переключить на ${localeNames[loc]}`}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm
                         transition-all duration-200 ease-in-out
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         ${
                           isActive
                             ? 'bg-blue-500 text-white shadow-md'
                             : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
                         }
                         ${isRTL(loc) ? 'flex-row-reverse' : ''}`}
            >
              {showFlags && (
                <span className={iconSizes.sm} role="img" aria-hidden="true">
                  {localeFlags[loc]}
                </span>
              )}
              {showNames && (
                <span className="font-medium">{localeNames[loc]}</span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  /**
   * Рендер icons варианта
   */
  if (variant === 'icons') {
    return (
      <div
        className={`inline-flex items-center gap-1 ${className}`}
        role="group"
        aria-label="Выбор языка"
        dir={currentLocaleInfo.direction}
      >
        {locales.map((loc) => {
          const isActive = loc === locale;
          return (
            <button
              key={loc}
              type="button"
              onClick={() => handleLocaleChange(loc)}
              aria-current={isActive ? 'true' : undefined}
              aria-label={`Переключить на ${localeNames[loc]}`}
              title={localeNames[loc]}
              className={`p-2 rounded-lg transition-all duration-200 ease-in-out
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         ${
                           isActive
                             ? 'bg-blue-500 text-white shadow-md scale-110'
                             : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                         }`}
            >
              <span
                className={`${iconSizes.lg}`}
                role="img"
                aria-label={localeNames[loc]}
              >
                {localeFlags[loc]}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  return null;
}
