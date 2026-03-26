import { NextRequest } from 'next/server';
import { successResponse, errorResponse, ApiErrorCode, HttpStatus } from '@/lib/api';
import { ensureAuth, ensureAdmin, hierarchyMoveSchema } from '@/lib/api';
import { hierarchyService } from '@/lib/services';

/**
 * POST /api/hierarchy/:id/move
 * Переместить узел в другое место иерархии
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Next.js 15: params теперь Promise
    const { id: idParam } = await params;
    
    // Проверка аутентификации и прав администратора
    const session = await ensureAuth();
    if (session instanceof Response) {
      return session;
    }

    const adminCheck = ensureAdmin(session);
    if (adminCheck instanceof Response) {
      return adminCheck;
    }

    const id = parseInt(idParam, 10);
    if (isNaN(id)) {
      return errorResponse(
        ApiErrorCode.BAD_REQUEST,
        'Неверный формат ID узла',
        HttpStatus.BAD_REQUEST
      );
    }

    const body = await request.json();
    const validation = hierarchyMoveSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(
        ApiErrorCode.VALIDATION_ERROR,
        'Ошибка валидации данных',
        HttpStatus.BAD_REQUEST,
        validation.error.errors
      );
    }

    const result = await hierarchyService.moveHierarchyNode(
      id,
      validation.data.newParentId,
      validation.data.newSortOrder
    );

    return successResponse(result);
  } catch (error: any) {
    console.error('Error moving hierarchy node:', error);

    if (error.message.includes('не найден')) {
      return errorResponse(
        ApiErrorCode.NOT_FOUND,
        error.message,
        HttpStatus.NOT_FOUND
      );
    }

    if (error.message.includes('Нельзя переместить')) {
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
