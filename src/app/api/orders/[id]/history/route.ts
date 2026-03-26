import { NextRequest } from 'next/server';
import { successResponse, errorResponse, ApiErrorCode, HttpStatus } from '@/lib/api';
import { ensureAuth, hasPermission } from '@/lib/api';
import { ordersService } from '@/lib/services';

/**
 * GET /api/orders/:id/history
 * Получить историю изменений заказа
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await ensureAuth();
    if (session instanceof Response) {
      return session;
    }

    const orderId = parseInt((await params).id, 10);
    if (isNaN(orderId)) {
      return errorResponse(
        ApiErrorCode.BAD_REQUEST,
        'Неверный формат ID заказа',
        HttpStatus.BAD_REQUEST
      );
    }

    // Проверка прав доступа
    const canViewAll = hasPermission(session, 'order_view_all');
    const canViewOwn = hasPermission(session, 'order_view_own');

    if (!canViewAll && !canViewOwn) {
      return errorResponse(
        ApiErrorCode.FORBIDDEN,
        'Недостаточно прав для просмотра истории заказа',
        HttpStatus.FORBIDDEN
      );
    }

    const history = await ordersService.getOrderHistory(orderId);

    return successResponse(history);
  } catch (error: any) {
    console.error('Error getting order history:', error);
    return errorResponse(
      ApiErrorCode.INTERNAL_ERROR,
      'Внутренняя ошибка сервера',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
