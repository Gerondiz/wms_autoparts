import { defineRouting } from 'next-intl/routing';
import { createSharedPathnamesNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['ru', 'en', 'ar'],
  defaultLocale: 'ru',
  localePrefix: 'always',
  localeDetection: true,
});

export const { Link, redirect, usePathname, useRouter } =
  createSharedPathnamesNavigation(routing);
