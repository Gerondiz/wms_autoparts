/**
 * Middleware для WMS Autoparts
 * 
 * Минимальная версия для обхода проблем с Edge Runtime в Next.js 15
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const pathname = nextUrl.pathname;

  // Health check - публичный endpoint
  if (pathname === '/api/health') {
    return NextResponse.next();
  }

  // Статические файлы
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.match(/\.[\w]+$/) // файлы с расширениями
  ) {
    return NextResponse.next();
  }

  // Редирект с корня на /ru
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/ru', request.url));
  }

  // RTL cookie для арабского
  const response = NextResponse.next();
  const isArabic = pathname.startsWith('/ar');
  
  response.cookies.set('dir', isArabic ? 'rtl' : 'ltr', {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  });

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
