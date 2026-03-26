import { NextRequest } from 'next/server';
import { successResponse, errorResponse, ApiErrorCode, HttpStatus } from '@/lib/api';
import { ensureAuth, hasPermission, stockReceiptSchema } from '@/lib/api';
import { stockService } from '@/lib/services';

/**
 * POST /api/stock/receipt
 * Приход запчастей на склад
 */
export async function POST(request: NextRequest) {
  try {
    // Проверка аутентификации и прав
    const session = await ensureAuth();
    if (session instanceof Response) {
      return session;
    }

    if (!hasPermission(session, 'stock_manage')) {
      return errorResponse(
        ApiErrorCode.FORBIDDEN,
        'Недостаточно прав для управления складом',
        HttpStatus.FORBIDDEN
      );
    }

    const body = await request.json();
    const validation = stockReceiptSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(
        ApiErrorCode.VALIDATION_ERROR,
        'Ошибка валидации данных',
        HttpStatus.BAD_REQUEST,
        validation.error.errors
      );
    }

    const result = await stockService.stockReceipt({
      ...validation.data,
      userId: session.user.id,
    });

    return successResponse(result, HttpStatus.CREATED);
  } catch (error: any) {
    console.error('Error in stock receipt:', error);

    if (error.message === 'Запчасть не найдена') {
      return errorResponse(
        ApiErrorCode.NOT_FOUND,
        error.message,
        HttpStatus.NOT_FOUND
      );
    }

    return errorResponse(
      ApiErrorCode.INTERNAL_ERROR,
      'Внутренняя ошибка сервера',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
