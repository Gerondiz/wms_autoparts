/**
 * Root Layout для WMS Autoparts
 *
 * Корневой layout без параметров - просто обёртка для глобальных стилей
 * Логика с локалью находится в [locale]/layout.tsx
 */

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'WMS Autoparts - Система управления заказами запчастей',
    template: '%s | WMS Autoparts',
  },
  description: 'Внутренняя система управления заказами на автозапчасти',
  keywords: [
    'WMS',
    'автозапчасти',
    'склад',
    'управление заказами',
    'inventory',
    'autoparts',
  ],
  authors: [{ name: 'WMS Autoparts Team' }],
  creator: 'WMS Autoparts',
  publisher: 'WMS Autoparts',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

/**
 * Root Layout компонент
 *
 * @param children - Дочерние компоненты
 */
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
