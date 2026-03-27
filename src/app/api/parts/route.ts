import { NextRequest } from 'next/server';
import { successResponse, errorResponse, ApiErrorCode, HttpStatus } from '@/lib/api';
import { ensureAuth, hasPermission, partsListSchema, partsSearchSchema, partCreateSchema } from '@/lib/api';
import { partsService } from '@/lib/services';

/**
 * GET /api/parts
 * Получить список запчастей для узла
 * Доступно без аутентификации для просмотра каталога
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const nodeIdParam = searchParams.get('nodeId');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    // Если это поиск
    const query = searchParams.get('q');
    if (query) {
      const validation = partsSearchSchema.safeParse({ q: query, limit });

      if (!validation.success) {
        return errorResponse(
          ApiErrorCode.VALIDATION_ERROR,
          'Ошибка валидации данных',
          HttpStatus.BAD_REQUEST,
          validation.error.errors
        );
      }

      const results = await partsService.searchPartsAndNodes(validation.data.q, validation.data.limit);
      return successResponse(results);
    }

    // Список запчастей узла - nodeId опционален (null = корневой уровень)
    let nodeId: number | null = null;
    if (nodeIdParam && nodeIdParam !== 'null' && nodeIdParam !== '') {
      nodeId = parseInt(nodeIdParam, 10);
      if (isNaN(nodeId)) {
        return errorResponse(
          ApiErrorCode.BAD_REQUEST,
          'Неверный формат nodeId',
          HttpStatus.BAD_REQUEST
        );
      }
    }

    const validation = partsListSchema.safeParse({ nodeId, page, limit });

    if (!validation.success) {
      return errorResponse(
        ApiErrorCode.VALIDATION_ERROR,
        'Ошибка валидации данных',
        HttpStatus.BAD_REQUEST,
        validation.error.errors
      );
    }

    const result = await partsService.getPartsByNodeId(
      validation.data.nodeId,
      validation.data.page,
      validation.data.limit
    );

    return successResponse(result);
  } catch (error) {
    console.error('Error in parts:', error);
    return errorResponse(
      ApiErrorCode.INTERNAL_ERROR,
      'Внутренняя ошибка сервера',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

/**
 * POST /api/parts
 * Создать запчасть
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const validation = partCreateSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(
        ApiErrorCode.VALIDATION_ERROR,
        'Ошибка валидации данных',
        HttpStatus.BAD_REQUEST,
        validation.error.errors
      );
    }

    const newPart = await partsService.createPart(validation.data);

    return successResponse(newPart, HttpStatus.CREATED);
  } catch (error: any) {
    console.error('Error creating part:', error);

    if (error.message === 'Узел иерархии не найден') {
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
