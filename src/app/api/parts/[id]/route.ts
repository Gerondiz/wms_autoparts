import { NextRequest } from 'next/server';
import { successResponse, errorResponse, ApiErrorCode, HttpStatus } from '@/lib/api';
import { ensureAuth, hasPermission, partUpdateSchema } from '@/lib/api';
import { partsService } from '@/lib/services';

/**
 * GET /api/parts/[id]
 * Получить запчасть по ID
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

    if (!hasPermission(session, 'catalog_view')) {
      return errorResponse(
        ApiErrorCode.FORBIDDEN,
        'Недостаточно прав для просмотра каталога',
        HttpStatus.FORBIDDEN
      );
    }

    const id = parseInt((await params).id, 10);
    if (isNaN(id)) {
      return errorResponse(
        ApiErrorCode.BAD_REQUEST,
        'Неверный формат ID',
        HttpStatus.BAD_REQUEST
      );
    }

    const part = await partsService.getPartById(id);

    if (!part) {
      return errorResponse(
        ApiErrorCode.NOT_FOUND,
        'Запчасть не найдена',
        HttpStatus.NOT_FOUND
      );
    }

    return successResponse(part);
  } catch (error) {
    console.error('Error in parts/[id]:', error);
    return errorResponse(
      ApiErrorCode.INTERNAL_ERROR,
      'Внутренняя ошибка сервера',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

/**
 * PUT /api/parts/[id]
 * Обновить запчасть
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await ensureAuth();
    if (session instanceof Response) {
      return session;
    }

    if (!hasPermission(session, 'parts_manage')) {
      return errorResponse(
        ApiErrorCode.FORBIDDEN,
        'Недостаточно прав для управления запчастями',
        HttpStatus.FORBIDDEN
      );
    }

    const id = parseInt((await params).id, 10);
    if (isNaN(id)) {
      return errorResponse(
        ApiErrorCode.BAD_REQUEST,
        'Неверный формат ID',
        HttpStatus.BAD_REQUEST
      );
    }

    const body = await request.json();
    const validation = partUpdateSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(
        ApiErrorCode.VALIDATION_ERROR,
        'Ошибка валидации данных',
        HttpStatus.BAD_REQUEST,
        validation.error.errors
      );
    }

    const updatedPart = await partsService.updatePart(id, validation.data);

    return successResponse(updatedPart);
  } catch (error: any) {
    console.error('Error updating part:', error);

    if (error.message.includes('не найдена')) {
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

/**
 * DELETE /api/parts/[id]
 * Удалить запчасть
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await ensureAuth();
    if (session instanceof Response) {
      return session;
    }

    if (!hasPermission(session, 'parts_manage')) {
      return errorResponse(
        ApiErrorCode.FORBIDDEN,
        'Недостаточно прав для управления запчастями',
        HttpStatus.FORBIDDEN
      );
    }

    const id = parseInt((await params).id, 10);
    if (isNaN(id)) {
      return errorResponse(
        ApiErrorCode.BAD_REQUEST,
        'Неверный формат ID',
        HttpStatus.BAD_REQUEST
      );
    }

    await partsService.deletePart(id);

    return successResponse({ message: 'Запчасть удалена' });
  } catch (error) {
    console.error('Error deleting part:', error);
    return errorResponse(
      ApiErrorCode.INTERNAL_ERROR,
      'Внутренняя ошибка сервера',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
