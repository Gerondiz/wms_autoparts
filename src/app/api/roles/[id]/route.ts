import { NextRequest } from 'next/server';
import { successResponse, errorResponse, ApiErrorCode, HttpStatus } from '@/lib/api';
import { ensureAuth, ensureAdmin, roleUpdateSchema } from '@/lib/api';
import { rolesService } from '@/lib/services';

/**
 * GET /api/roles/[id]
 * Получить роль по ID
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

    const adminCheck = ensureAdmin(session);
    if (adminCheck instanceof Response) {
      return adminCheck;
    }

    const id = parseInt((await params).id, 10);
    if (isNaN(id)) {
      return errorResponse(
        ApiErrorCode.BAD_REQUEST,
        'Неверный формат ID',
        HttpStatus.BAD_REQUEST
      );
    }

    const role = await rolesService.getRoleById(id);

    if (!role) {
      return errorResponse(
        ApiErrorCode.NOT_FOUND,
        'Роль не найдена',
        HttpStatus.NOT_FOUND
      );
    }

    return successResponse(role);
  } catch (error) {
    console.error('Error in roles/[id]:', error);
    return errorResponse(
      ApiErrorCode.INTERNAL_ERROR,
      'Внутренняя ошибка сервера',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

/**
 * PUT /api/roles/[id]
 * Обновить роль
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
        'Неверный формат ID',
        HttpStatus.BAD_REQUEST
      );
    }

    const body = await request.json();
    const validation = roleUpdateSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(
        ApiErrorCode.VALIDATION_ERROR,
        'Ошибка валидации данных',
        HttpStatus.BAD_REQUEST,
        validation.error.errors
      );
    }

    const updatedRole = await rolesService.updateRole(id, validation.data);

    return successResponse(updatedRole);
  } catch (error: any) {
    console.error('Error updating role:', error);

    if (error.message.includes('не найдена')) {
      return errorResponse(
        ApiErrorCode.NOT_FOUND,
        error.message,
        HttpStatus.NOT_FOUND
      );
    }

    if (error.message.includes('нельзя изменять системную')) {
      return errorResponse(
        ApiErrorCode.FORBIDDEN,
        error.message,
        HttpStatus.FORBIDDEN
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
 * DELETE /api/roles/[id]
 * Удалить роль
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
        'Неверный формат ID',
        HttpStatus.BAD_REQUEST
      );
    }

    await rolesService.deleteRole(id);

    return successResponse({ message: 'Роль удалена' });
  } catch (error: any) {
    console.error('Error deleting role:', error);

    if (error.message.includes('не найдена')) {
      return errorResponse(
        ApiErrorCode.NOT_FOUND,
        error.message,
        HttpStatus.NOT_FOUND
      );
    }

    if (error.message.includes('нельзя удалить системную')) {
      return errorResponse(
        ApiErrorCode.FORBIDDEN,
        error.message,
        HttpStatus.FORBIDDEN
      );
    }

    if (error.message.includes('нельзя удалить, есть пользователи')) {
      return errorResponse(
        ApiErrorCode.CONFLICT,
        error.message,
        HttpStatus.CONFLICT
      );
    }

    return errorResponse(
      ApiErrorCode.INTERNAL_ERROR,
      'Внутренняя ошибка сервера',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
