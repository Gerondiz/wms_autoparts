import { NextRequest } from 'next/server';
import { successResponse, errorResponse, ApiErrorCode, HttpStatus } from '@/lib/api';
import { ensureAuth, ensureAdmin, roleCreateSchema } from '@/lib/api';
import { rolesService } from '@/lib/services';

/**
 * GET /api/roles
 * Получить список ролей
 */
export async function GET(request: NextRequest) {
  try {
    const session = await ensureAuth();
    if (session instanceof Response) {
      return session;
    }

    const adminCheck = ensureAdmin(session);
    if (adminCheck instanceof Response) {
      return adminCheck;
    }

    const roles = await rolesService.getRoles();

    return successResponse(roles);
  } catch (error) {
    console.error('Error in roles:', error);
    return errorResponse(
      ApiErrorCode.INTERNAL_ERROR,
      'Внутренняя ошибка сервера',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

/**
 * POST /api/roles
 * Создать роль
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
    const validation = roleCreateSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(
        ApiErrorCode.VALIDATION_ERROR,
        'Ошибка валидации данных',
        HttpStatus.BAD_REQUEST,
        validation.error.errors
      );
    }

    const newRole = await rolesService.createRole(validation.data);

    return successResponse(newRole, HttpStatus.CREATED);
  } catch (error: any) {
    console.error('Error creating role:', error);

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
