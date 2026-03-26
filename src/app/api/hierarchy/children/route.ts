import { NextRequest } from 'next/server';
import { successResponse, errorResponse, ApiErrorCode, HttpStatus } from '@/lib/api';
import { ensureAuth, hasPermission } from '@/lib/api/middleware';
import { hierarchyService } from '@/lib/services';

/**
 * GET /api/hierarchy/children
 * Получить дочерние узлы для ленивой загрузки дерева
 */
export async function GET(request: NextRequest) {
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

    // Получаем parentId из query параметров
    const searchParams = request.nextUrl.searchParams;
    const parentIdParam = searchParams.get('parentId');
    
    let parentId: number | null = null;
    if (parentIdParam && parentIdParam !== 'null') {
      parentId = parseInt(parentIdParam, 10);
      if (isNaN(parentId)) {
        return errorResponse(
          ApiErrorCode.BAD_REQUEST,
          'Неверный формат parentId',
          HttpStatus.BAD_REQUEST
        );
      }
    }

    const children = await hierarchyService.getHierarchyChildren(parentId);

    return successResponse(children);
  } catch (error) {
    console.error('Error in hierarchy/children:', error);
    return errorResponse(
      ApiErrorCode.INTERNAL_ERROR,
      'Внутренняя ошибка сервера',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
