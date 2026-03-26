import { NextRequest } from 'next/server';
import { successResponse, errorResponse, ApiErrorCode, HttpStatus } from '@/lib/api';
import { ensureAuth, hasPermission } from '@/lib/api';
import { ordersService } from '@/lib/services';
import { z } from 'zod';

const updateItemSchema = z.object({
  quantity: z.number().int().positive().min(1),
});

/**
 * PATCH /api/orders/:id/items/:itemId
 * Обновить позицию заказа
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const session = await ensureAuth();
    if (session instanceof Response) {
      return session;
    }

    if (!hasPermission(session, 'order_edit_own_draft')) {
      return errorResponse(
        ApiErrorCode.FORBIDDEN,
        'Недостаточно прав для редактирования заказа',
        HttpStatus.FORBIDDEN
      );
    }

    const orderId = parseInt((await params).id, 10);
    const orderItemId = parseInt((await params).itemId, 10);

    if (isNaN(orderId) || isNaN(orderItemId)) {
      return errorResponse(
        ApiErrorCode.BAD_REQUEST,
        'Неверный формат ID',
        HttpStatus.BAD_REQUEST
      );
    }

    const body = await request.json();
    const validation = updateItemSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(
        ApiErrorCode.VALIDATION_ERROR,
        'Ошибка валидации данных',
        HttpStatus.BAD_REQUEST,
        validation.error.errors
      );
    }

    // Проверяем что заказ принадлежит пользователю
    const order = await ordersService.getOrderById(orderId, session.user.id, session.user.roleName);
    if (!order || order.mechanicId !== session.user.id) {
      return errorResponse(
        ApiErrorCode.FORBIDDEN,
        'Доступ только к своим заказам',
        HttpStatus.FORBIDDEN
      );
    }

    const result = await ordersService.updateOrderItem(
      orderId,
      orderItemId,
      validation.data.quantity
    );

    return successResponse(result);
  } catch (error: any) {
    console.error('Error updating order item:', error);

    if (error.message.includes('только заказы в статусе draft')) {
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

/**
 * DELETE /api/orders/:id/items/:itemId
 * Удалить позицию из заказа
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const session = await ensureAuth();
    if (session instanceof Response) {
      return session;
    }

    if (!hasPermission(session, 'order_edit_own_draft')) {
      return errorResponse(
        ApiErrorCode.FORBIDDEN,
        'Недостаточно прав для редактирования заказа',
        HttpStatus.FORBIDDEN
      );
    }

    const orderId = parseInt((await params).id, 10);
    const orderItemId = parseInt((await params).itemId, 10);

    if (isNaN(orderId) || isNaN(orderItemId)) {
      return errorResponse(
        ApiErrorCode.BAD_REQUEST,
        'Неверный формат ID',
        HttpStatus.BAD_REQUEST
      );
    }

    // Проверяем что заказ принадлежит пользователю
    const order = await ordersService.getOrderById(orderId, session.user.id, session.user.roleName);
    if (!order || order.mechanicId !== session.user.id) {
      return errorResponse(
        ApiErrorCode.FORBIDDEN,
        'Доступ только к своим заказам',
        HttpStatus.FORBIDDEN
      );
    }

    const result = await ordersService.removeOrderItem(orderId, orderItemId);

    return successResponse({ deleted: result });
  } catch (error: any) {
    console.error('Error removing order item:', error);

    if (error.message.includes('только заказы в статусе draft')) {
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
