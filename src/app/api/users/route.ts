import { NextRequest } from 'next/server';
import { successResponse, errorResponse, ApiErrorCode, HttpStatus } from '@/lib/api';
import { ensureAuth, ensureAdmin, userCreateSchema, userUpdateSchema } from '@/lib/api';
import { usersService } from '@/lib/services';

/**
 * GET /api/users
 * Получить список пользователей
 */
export async function GET(request: NextRequest) {
  try {
    // Проверка аутентификации и прав администратора
    const session = await ensureAuth();
    if (session instanceof Response) {
      return session;
    }

    const adminCheck = ensureAdmin(session);
    if (adminCheck instanceof Response) {
      return adminCheck;
    }

    const users = await usersService.getUsers();

    return successResponse(users);
  } catch (error) {
    console.error('Error in users:', error);
    return errorResponse(
      ApiErrorCode.INTERNAL_ERROR,
      'Внутренняя ошибка сервера',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

/**
 * POST /api/users
 * Создать пользователя
 */
export async function POST(request: NextRequest) {
  try {
    // Проверка аутентификации и прав администратора
    const session = await ensureAuth();
    if (session instanceof Response) {
      return session;
    }

    const adminCheck = ensureAdmin(session);
    if (adminCheck instanceof Response) {
      return adminCheck;
    }

    const body = await request.json();
    const validation = userCreateSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(
        ApiErrorCode.VALIDATION_ERROR,
        'Ошибка валидации данных',
        HttpStatus.BAD_REQUEST,
        validation.error.errors
      );
    }

    const newUser = await usersService.createUser(validation.data);

    // Не возвращаем хеш пароля
    const { passwordHash, ...userWithoutPassword } = newUser as any;

    return successResponse(userWithoutPassword, HttpStatus.CREATED);
  } catch (error: any) {
    console.error('Error creating user:', error);

    if (error.message.includes('уже существует')) {
      return errorResponse(
        ApiErrorCode.CONFLICT,
        error.message,
        HttpStatus.CONFLICT
      );
    }

    if (error.message === 'Роль не найдена') {
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
