/** @type {import('next').NextConfig} */
const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin();

const nextConfig = {
  images: {
    remotePatterns: [],
  },
  // Next.js 15: serverComponentsExternalPackages больше не нужен
  // Drizzle ORM и postgres теперь корректно работают без этой настройки
  // Standalone режим для Docker деплоя
  output: 'standalone',
  // Next.js 15: явное указание совместимости с React 19
  reactStrictMode: true,
};

module.exports = withNextIntl(nextConfig);
