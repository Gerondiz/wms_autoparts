import { NextRequest } from 'next/server';
import { successResponse, errorResponse, ApiErrorCode, HttpStatus } from '@/lib/api';
import { ensureAuth, hasPermission, orderApproveSchema } from '@/lib/api';
import { ordersService } from '@/lib/services';

/**
 * POST /api/orders/:id/approve
 * Согласовать заказ
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

    if (!hasPermission(session, 'order_approve')) {
      return errorResponse(
        ApiErrorCode.FORBIDDEN,
        'Недостаточно прав для согласования заказа',
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
    const validation = orderApproveSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(
        ApiErrorCode.VALIDATION_ERROR,
        'Ошибка валидации данных',
        HttpStatus.BAD_REQUEST,
        validation.error.errors
      );
    }

    const result = await ordersService.approveOrder(
      id,
      session.user.id,
      validation.data.priority,
      validation.data.notes
    );

    return successResponse(result);
  } catch (error: any) {
    console.error('Error approving order:', error);
    return errorResponse(
      ApiErrorCode.INTERNAL_ERROR,
      'Внутренняя ошибка сервера',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
