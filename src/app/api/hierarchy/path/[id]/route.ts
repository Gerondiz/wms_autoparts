import { NextRequest } from 'next/server';
import { successResponse, errorResponse, ApiErrorCode, HttpStatus } from '@/lib/api';
import { ensureAuth, hasPermission } from '@/lib/api/middleware';
import { hierarchyService } from '@/lib/services';

/**
 * GET /api/hierarchy/path/:id
 * Получить путь к узлу (хлебные крошки)
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

    // Проверка прав
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
        'Неверный формат ID узла',
        HttpStatus.BAD_REQUEST
      );
    }

    const path = await hierarchyService.getHierarchyPath(id);

    return successResponse(path);
  } catch (error) {
    console.error('Error in hierarchy/path:', error);
    return errorResponse(
      ApiErrorCode.INTERNAL_ERROR,
      'Внутренняя ошибка сервера',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
