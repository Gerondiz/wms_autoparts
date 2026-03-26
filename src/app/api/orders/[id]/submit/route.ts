import { NextRequest } from 'next/server';
import { successResponse, errorResponse, ApiErrorCode, HttpStatus } from '@/lib/api';
import { ensureAuth, hasPermission, orderSubmitSchema } from '@/lib/api';
import { ordersService } from '@/lib/services';

/**
 * POST /api/orders/:id/submit
 * Отправить заказ на согласование
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

    if (!hasPermission(session, 'order_create')) {
      return errorResponse(
        ApiErrorCode.FORBIDDEN,
        'Недостаточно прав для отправки заказа',
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

    // Проверяем что заказ принадлежит пользователю
    const order = await ordersService.getOrderById(id, session.user.id, session.user.roleName);
    if (!order || order.mechanicId !== session.user.id) {
      return errorResponse(
        ApiErrorCode.FORBIDDEN,
        'Можно отправить только свой заказ',
        HttpStatus.FORBIDDEN
      );
    }

    const body = await request.json();
    const validation = orderSubmitSchema.safeParse(body || {});

    if (!validation.success) {
      return errorResponse(
        ApiErrorCode.VALIDATION_ERROR,
        'Ошибка валидации данных',
        HttpStatus.BAD_REQUEST,
        validation.error.errors
      );
    }

    const result = await ordersService.submitOrder(id, validation.data.notes);

    return successResponse(result);
  } catch (error: any) {
    console.error('Error submitting order:', error);

    if (error.message.includes('только заказ в статусе draft')) {
      return errorResponse(
        ApiErrorCode.BAD_REQUEST,
        error.message,
        HttpStatus.BAD_REQUEST
      );
    }

    return errorResponse(
      ApiErrorCode.INTERNAL_ERROR,
      'Внутренняя ошибка сервера',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
