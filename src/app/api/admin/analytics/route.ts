import { NextRequest } from 'next/server';
import { successResponse, errorResponse, ApiErrorCode, HttpStatus } from '@/lib/api';
import { ensureAuth, ensureAdmin } from '@/lib/api';
import { reportsService } from '@/lib/services';

/**
 * GET /api/admin/analytics
 * Получить данные для аналитики
 */
export async function GET(request: NextRequest) {
  try {
    // Проверка аутентификации и прав администратора
    const session = await ensureAuth();
    if (session instanceof Response) {
      return session;
    }

    const adminCheck = ensureAdmin(session);
    if (adminCheck instanceof Response) {
      return adminCheck;
    }

    const analyticsData = await reportsService.getDashboardData();

    return successResponse(analyticsData);
  } catch (error) {
    console.error('Error in admin analytics:', error);
    return errorResponse(
      ApiErrorCode.INTERNAL_ERROR,
      'Внутренняя ошибка сервера',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
