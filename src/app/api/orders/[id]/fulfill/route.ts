import { NextRequest } from 'next/server';
import { successResponse, errorResponse, ApiErrorCode, HttpStatus } from '@/lib/api';
import { ensureAuth, hasPermission, orderFulfillSchema } from '@/lib/api';
import { ordersService } from '@/lib/services';

/**
 * POST /api/orders/:id/fulfill
 * Отметить выдачу заказа (частичную или полную)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Проверка аутентификации и прав
    const session = await ensureAuth();
    if (session instanceof Response) {
      return session;
    }

    if (!hasPermission(session, 'order_fulfill')) {
      return errorResponse(
        ApiErrorCode.FORBIDDEN,
        'Недостаточно прав для выдачи заказа',
        HttpStatus.FORBIDDEN
      );
    }

    const id = parseInt((await params).id, 10);
    if (isNaN(id)) {
      return errorResponse(
        ApiErrorCode.BAD_REQUEST,
        'Неверный формат ID заказа',
        HttpStatus.BAD_REQUEST
      );
    }

    const body = await request.json();
    const validation = orderFulfillSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(
        ApiErrorCode.VALIDATION_ERROR,
        'Ошибка валидации данных',
        HttpStatus.BAD_REQUEST,
        validation.error.errors
      );
    }

    const result = await ordersService.fulfillOrder(
      id,
      validation.data.items,
      session.user.id,
      validation.data.notes
    );

    return successResponse(result);
  } catch (error: any) {
    console.error('Error fulfilling order:', error);
    return errorResponse(
      ApiErrorCode.INTERNAL_ERROR,
      'Внутренняя ошибка сервера',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
