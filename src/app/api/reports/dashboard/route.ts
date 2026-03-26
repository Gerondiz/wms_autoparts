import { NextRequest } from 'next/server';
import { successResponse, errorResponse, ApiErrorCode, HttpStatus } from '@/lib/api';
import { ensureAuth, hasPermission } from '@/lib/api';
import { reportsService } from '@/lib/services';

/**
 * GET /api/reports/dashboard
 * Получить данные для dashboard аналитики
 */
export async function GET(request: NextRequest) {
  try {
    // Проверка аутентификации
    const session = await ensureAuth();
    if (session instanceof Response) {
      return session;
    }

    // Проверка прав
    if (!hasPermission(session, 'reports_view')) {
      return errorResponse(
        ApiErrorCode.FORBIDDEN,
        'Недостаточно прав для просмотра отчётов',
        HttpStatus.FORBIDDEN
      );
    }

    const dashboardData = await reportsService.getDashboardData();

    return successResponse(dashboardData);
  } catch (error) {
    console.error('Error in reports/dashboard:', error);
    return errorResponse(
      ApiErrorCode.INTERNAL_ERROR,
      'Внутренняя ошибка сервера',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
