import { NextRequest } from 'next/server';
import { successResponse, errorResponse, ApiErrorCode, HttpStatus } from '@/lib/api';
import { ensureAuth, ensureAdmin, hierarchyCreateSchema, hierarchyUpdateSchema, hierarchyMoveSchema } from '@/lib/api';
import { hierarchyService } from '@/lib/services';

/**
 * GET /api/hierarchy
 * Получить корневые узлы иерархии
 */
export async function GET(request: NextRequest) {
  try {
    const session = await ensureAuth();
    if (session instanceof Response) {
      return session;
    }

    const searchParams = request.nextUrl.searchParams;
    const parentIdParam = searchParams.get('parentId');

    // Если указан parentId, получаем детей
    if (parentIdParam !== null) {
      let id: number | null = null;
      if (parentIdParam !== 'null') {
        id = parseInt(parentIdParam, 10);
        if (isNaN(id)) {
          return errorResponse(
            ApiErrorCode.BAD_REQUEST,
            'Неверный формат parentId',
            HttpStatus.BAD_REQUEST
          );
        }
      }
      const children = await hierarchyService.getHierarchyChildren(id);
      return successResponse(children);
    }

    // По умолчанию получаем корневые узлы
    const children = await hierarchyService.getHierarchyChildren(null);
    return successResponse(children);
  } catch (error) {
    console.error('Error in hierarchy:', error);
    return errorResponse(
      ApiErrorCode.INTERNAL_ERROR,
      'Внутренняя ошибка сервера',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

/**
 * POST /api/hierarchy
 * Создать новый узел иерархии
 */
export async function POST(request: NextRequest) {
  try {
    const session = await ensureAuth();
    if (session instanceof Response) {
      return session;
    }

    const adminCheck = ensureAdmin(session);
    if (adminCheck instanceof Response) {
      return adminCheck;
    }

    const body = await request.json();
    const validation = hierarchyCreateSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(
        ApiErrorCode.VALIDATION_ERROR,
        'Ошибка валидации данных',
        HttpStatus.BAD_REQUEST,
        validation.error.errors
      );
    }

    const newNode = await hierarchyService.createHierarchyNode(validation.data);

    return successResponse(newNode, HttpStatus.CREATED);
  } catch (error: any) {
    console.error('Error creating hierarchy node:', error);

    if (error.message === 'Родительский узел не найден') {
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
