import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { auth } from '@/lib/auth';
import { SessionProvider } from 'next-auth/react';
import MUIProvider from '@/components/layout/MUIProvider';
import { getDirection } from '@/lib/utils/rtl';
import { locales, type Locale } from '@/i18n/config';
import { HierarchyProvider } from '@/contexts/HierarchyContext';
import AppLayoutContent from '@/components/layout/AppLayoutContent';

/**
 * Генерация статических параметров для всех локалей
 */
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Next.js 15: params теперь Promise
  const { locale: localeParam } = await params;

  // Получаем локаль из параметров или используем локаль по умолчанию
  const locale: Locale =
    localeParam === 'ru' || localeParam === 'en' || localeParam === 'ar'
      ? localeParam
      : routing.defaultLocale;

  const messages = await getMessages();
  const session = await auth();
  const direction = getDirection(locale);
  const htmlLang = locale === 'ru' ? 'ru' : locale === 'en' ? 'en' : 'ar';

  return (
    <html lang={htmlLang} dir={direction}>
      <body style={{ direction }}>
        <SessionProvider session={session}>
          <NextIntlClientProvider messages={messages} locale={locale}>
            <MUIProvider>
              <HierarchyProvider>
                <AppLayoutContent>{children}</AppLayoutContent>
              </HierarchyProvider>
            </MUIProvider>
          </NextIntlClientProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
