import { NextRequest } from 'next/server';
import { successResponse, errorResponse, ApiErrorCode, HttpStatus } from '@/lib/api';
import { ensureAuth, hasPermission, orderUpdateSchema } from '@/lib/api';
import { ordersService } from '@/lib/services';

/**
 * GET /api/orders/:id
 * Получить детали заказа
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Проверка аутентификации
    const session = await ensureAuth();
    if (session instanceof Response) {
      return session;
    }

    const id = parseInt((await params).id, 10);
    if (isNaN(id)) {
      return errorResponse(
        ApiErrorCode.BAD_REQUEST,
        'Неверный формат ID заказа',
        HttpStatus.BAD_REQUEST
      );
    }

    const canViewAll = hasPermission(session, 'order_view_all');
    const canViewOwn = hasPermission(session, 'order_view_own');

    if (!canViewAll && !canViewOwn) {
      return errorResponse(
        ApiErrorCode.FORBIDDEN,
        'Недостаточно прав для просмотра заказов',
        HttpStatus.FORBIDDEN
      );
    }

    const order = await ordersService.getOrderById(id, session.user.id, session.user.roleName);

    if (!order) {
      return errorResponse(
        ApiErrorCode.NOT_FOUND,
        'Заказ не найден',
        HttpStatus.NOT_FOUND
      );
    }

    return successResponse(order);
  } catch (error: any) {
    console.error('Error in orders/[id]:', error);

    if (error.message === 'Доступ только к своим заказам') {
      return errorResponse(
        ApiErrorCode.FORBIDDEN,
        error.message,
        HttpStatus.FORBIDDEN
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
 * PUT /api/orders/:id
 * Обновить заказ (только draft)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Проверка аутентификации и прав
    const session = await ensureAuth();
    if (session instanceof Response) {
      return session;
    }

    const id = parseInt((await params).id, 10);
    if (isNaN(id)) {
      return errorResponse(
        ApiErrorCode.BAD_REQUEST,
        'Неверный формат ID заказа',
        HttpStatus.BAD_REQUEST
      );
    }

    // Проверка прав на редактирование черновика
    const canEditOwnDraft = hasPermission(session, 'order_edit_own_draft');
    const isAdmin = session.user.roleName === 'admin';

    if (!canEditOwnDraft && !isAdmin) {
      return errorResponse(
        ApiErrorCode.FORBIDDEN,
        'Недостаточно прав для редактирования заказа',
        HttpStatus.FORBIDDEN
      );
    }

    const body = await request.json();
    const validation = orderUpdateSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(
        ApiErrorCode.VALIDATION_ERROR,
        'Ошибка валидации данных',
        HttpStatus.BAD_REQUEST,
        validation.error.errors
      );
    }

    // Проверяем что заказ принадлежит пользователю (если не админ)
    if (!isAdmin) {
      const orderCheck = await ordersService.getOrderById(id, session.user.id, session.user.roleName);
      if (!orderCheck || orderCheck.mechanicId !== session.user.id) {
        return errorResponse(
          ApiErrorCode.FORBIDDEN,
          'Доступ только к своим заказам',
          HttpStatus.FORBIDDEN
        );
      }
    }

    const result = await ordersService.updateOrder(id, validation.data);

    return successResponse(result);
  } catch (error: any) {
    console.error('Error updating order:', error);

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
 * DELETE /api/orders/:id
 * Удалить заказ (только draft)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Проверка аутентификации и прав
    const session = await ensureAuth();
    if (session instanceof Response) {
      return session;
    }

    const id = parseInt((await params).id, 10);
    if (isNaN(id)) {
      return errorResponse(
        ApiErrorCode.BAD_REQUEST,
        'Неверный формат ID заказа',
        HttpStatus.BAD_REQUEST
      );
    }

    const canEditOwnDraft = hasPermission(session, 'order_edit_own_draft');
    const isAdmin = session.user.roleName === 'admin';

    if (!canEditOwnDraft && !isAdmin) {
      return errorResponse(
        ApiErrorCode.FORBIDDEN,
        'Недостаточно прав для удаления заказа',
        HttpStatus.FORBIDDEN
      );
    }

    const deleted = await ordersService.deleteOrder(id);

    return successResponse({ deleted });
  } catch (error: any) {
    console.error('Error deleting order:', error);

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
