import { NextRequest } from 'next/server';
import { successResponse, errorResponse, ApiErrorCode, HttpStatus } from '@/lib/api';
import { ensureAuth, ensureAdmin, hierarchyUpdateSchema, hierarchyMoveSchema } from '@/lib/api';
import { hierarchyService } from '@/lib/services';

/**
 * GET /api/hierarchy/[id]
 * Получить узел по ID
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

    const id = parseInt((await params).id, 10);
    if (isNaN(id)) {
      return errorResponse(
        ApiErrorCode.BAD_REQUEST,
        'Неверный формат ID узла',
        HttpStatus.BAD_REQUEST
      );
    }

    const node = await hierarchyService.getHierarchyById(id);

    if (!node) {
      return errorResponse(
        ApiErrorCode.NOT_FOUND,
        'Узел иерархии не найден',
        HttpStatus.NOT_FOUND
      );
    }

    return successResponse(node);
  } catch (error) {
    console.error('Error in hierarchy/[id]:', error);
    return errorResponse(
      ApiErrorCode.INTERNAL_ERROR,
      'Внутренняя ошибка сервера',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

/**
 * PUT /api/hierarchy/[id]
 * Обновить узел иерархии
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

    const adminCheck = ensureAdmin(session);
    if (adminCheck instanceof Response) {
      return adminCheck;
    }

    const id = parseInt((await params).id, 10);
    if (isNaN(id)) {
      return errorResponse(
        ApiErrorCode.BAD_REQUEST,
        'Неверный формат ID узла',
        HttpStatus.BAD_REQUEST
      );
    }

    const body = await request.json();
    const validation = hierarchyUpdateSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(
        ApiErrorCode.VALIDATION_ERROR,
        'Ошибка валидации данных',
        HttpStatus.BAD_REQUEST,
        validation.error.errors
      );
    }

    const updatedNode = await hierarchyService.updateHierarchyNode(id, validation.data);

    return successResponse(updatedNode);
  } catch (error: any) {
    console.error('Error updating hierarchy node:', error);

    if (error.message.includes('не найден')) {
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
 * DELETE /api/hierarchy/[id]
 * Удалить узел иерархии
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

    const adminCheck = ensureAdmin(session);
    if (adminCheck instanceof Response) {
      return adminCheck;
    }

    const id = parseInt((await params).id, 10);
    if (isNaN(id)) {
      return errorResponse(
        ApiErrorCode.BAD_REQUEST,
        'Неверный формат ID узла',
        HttpStatus.BAD_REQUEST
      );
    }

    await hierarchyService.deleteHierarchyNode(id);

    return successResponse({ message: 'Узел удалён' });
  } catch (error) {
    console.error('Error deleting hierarchy node:', error);
    return errorResponse(
      ApiErrorCode.INTERNAL_ERROR,
      'Внутренняя ошибка сервера',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

/**
 * POST /api/hierarchy/[id]/move
 * Переместить узел
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await ensureAuth();
    if (session instanceof Response) {
      return session;
    }

    const adminCheck = ensureAdmin(session);
    if (adminCheck instanceof Response) {
      return adminCheck;
    }

    const id = parseInt((await params).id, 10);
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

    if (error.message.includes('нельзя переместить')) {
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
