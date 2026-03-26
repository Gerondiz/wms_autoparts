import { NextRequest } from 'next/server';
import { successResponse, errorResponse, ApiErrorCode, HttpStatus } from '@/lib/api';
import { ensureAuth, hasPermission, stockHistorySchema } from '@/lib/api';
import { stockService } from '@/lib/services';

/**
 * GET /api/stock/history
 * Получить историю изменений остатков
 */
export async function GET(request: NextRequest) {
  try {
    // Проверка аутентификации
    const session = await ensureAuth();
    if (session instanceof Response) {
      return session;
    }

    // Проверка прав
    if (!hasPermission(session, 'stock_view_history')) {
      return errorResponse(
        ApiErrorCode.FORBIDDEN,
        'Недостаточно прав для просмотра истории склада',
        HttpStatus.FORBIDDEN
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const validation = stockHistorySchema.safeParse({
      partId: searchParams.get('partId') ? parseInt(searchParams.get('partId')!, 10) : undefined,
      userId: searchParams.get('userId') ? parseInt(searchParams.get('userId')!, 10) : undefined,
      orderId: searchParams.get('orderId') ? parseInt(searchParams.get('orderId')!, 10) : undefined,
      reason: searchParams.get('reason'),
      fromDate: searchParams.get('fromDate'),
      toDate: searchParams.get('toDate'),
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

    const result = await stockService.getStockHistory(validation.data);

    return successResponse(result);
  } catch (error) {
    console.error('Error in stock/history:', error);
    return errorResponse(
      ApiErrorCode.INTERNAL_ERROR,
      'Внутренняя ошибка сервера',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
