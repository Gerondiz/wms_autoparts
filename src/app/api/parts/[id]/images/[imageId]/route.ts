import { NextRequest } from 'next/server';
import { successResponse, errorResponse, ApiErrorCode, HttpStatus } from '@/lib/api';
import { ensureAuth, hasPermission } from '@/lib/api';
import { partsService } from '@/lib/services';
import { unlink } from 'fs/promises';
import { join } from 'path';

/**
 * DELETE /api/parts/:id/images/:imageId
 * Удалить изображение запчасти
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    // Проверка аутентификации и прав
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

    const imageId = parseInt((await params).imageId, 10);
    if (isNaN(imageId)) {
      return errorResponse(
        ApiErrorCode.BAD_REQUEST,
        'Неверный формат ID изображения',
        HttpStatus.BAD_REQUEST
      );
    }

    // Получаем информацию об изображении перед удалением
    // (в реальной реализации нужно добавить метод получения изображения по ID)

    // Удаляем запись из БД
    const deleted = await partsService.deletePartImage(imageId);

    if (!deleted) {
      return errorResponse(
        ApiErrorCode.NOT_FOUND,
        'Изображение не найдено',
        HttpStatus.NOT_FOUND
      );
    }

    // Примечание: физическое удаление файла можно реализовать отдельно
    // или оставить файл как есть (например, если он используется в других местах)

    return successResponse({ deleted: true });
  } catch (error: any) {
    console.error('Error deleting image:', error);
    return errorResponse(
      ApiErrorCode.INTERNAL_ERROR,
      'Внутренняя ошибка сервера',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
