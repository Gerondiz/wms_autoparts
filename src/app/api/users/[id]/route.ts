import { NextRequest } from 'next/server';
import { successResponse, errorResponse, ApiErrorCode, HttpStatus } from '@/lib/api';
import { ensureAuth, ensureAdmin, userUpdateSchema } from '@/lib/api';
import { usersService } from '@/lib/services';

/**
 * GET /api/users/[id]
 * Получить пользователя по ID
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

    const user = await usersService.getUserById(id);

    if (!user) {
      return errorResponse(
        ApiErrorCode.NOT_FOUND,
        'Пользователь не найден',
        HttpStatus.NOT_FOUND
      );
    }

    return successResponse(user);
  } catch (error) {
    console.error('Error in users/[id]:', error);
    return errorResponse(
      ApiErrorCode.INTERNAL_ERROR,
      'Внутренняя ошибка сервера',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

/**
 * PUT /api/users/[id]
 * Обновить пользователя
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
    const validation = userUpdateSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(
        ApiErrorCode.VALIDATION_ERROR,
        'Ошибка валидации данных',
        HttpStatus.BAD_REQUEST,
        validation.error.errors
      );
    }

    const updatedUser = await usersService.updateUser(id, validation.data);

    const { passwordHash, ...userWithoutPassword } = updatedUser as any;

    return successResponse(userWithoutPassword);
  } catch (error: any) {
    console.error('Error updating user:', error);

    if (error.message.includes('не найден')) {
      return errorResponse(
        ApiErrorCode.NOT_FOUND,
        error.message,
        HttpStatus.NOT_FOUND
      );
    }

    if (error.message.includes('уже существует')) {
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

/**
 * DELETE /api/users/[id]
 * Удалить пользователя
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

    await usersService.deleteUser(id);

    return successResponse({ message: 'Пользователь удалён' });
  } catch (error: any) {
    console.error('Error deleting user:', error);

    if (error.message.includes('нельзя удалить')) {
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
