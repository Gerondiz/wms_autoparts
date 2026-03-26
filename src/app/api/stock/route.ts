import { NextRequest } from 'next/server';
import { successResponse, errorResponse, ApiErrorCode, HttpStatus } from '@/lib/api';
import { ensureAuth, hasPermission, stockListSchema } from '@/lib/api';
import { stockService } from '@/lib/services';

/**
 * GET /api/stock
 * Получить текущие остатки
 */
export async function GET(request: NextRequest) {
  try {
    // Проверка аутентификации
    const session = await ensureAuth();
    if (session instanceof Response) {
      return session;
    }

    // Проверка прав
    const canView = hasPermission(session, 'stock_view');
    const canViewHistory = hasPermission(session, 'stock_view_history');
    const canManage = hasPermission(session, 'stock_manage');

    if (!canView && !canViewHistory && !canManage) {
      return errorResponse(
        ApiErrorCode.FORBIDDEN,
        'Недостаточно прав для просмотра остатков',
        HttpStatus.FORBIDDEN
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const validation = stockListSchema.safeParse({
      search: searchParams.get('search'),
      lowStock: searchParams.get('lowStock'),
      nodeId: searchParams.get('nodeId') ? parseInt(searchParams.get('nodeId')!, 10) : undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : undefined,
    });

    if (!validation.success) {
      return errorResponse(
        ApiErrorCode.VALIDATION_ERROR,
        'Ошибка валидации данных',
        HttpStatus.BAD_REQUEST,
        validation.error.errors
      );
    }

    const result = await stockService.getStock(validation.data);

    return successResponse(result);
  } catch (error) {
    console.error('Error in stock:', error);
    return errorResponse(
      ApiErrorCode.INTERNAL_ERROR,
      'Внутренняя ошибка сервера',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
