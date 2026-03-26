import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users, roleTypes } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { forbiddenError, unauthorizedError } from './types';

/**
 * Расширенная сессия с данными пользователя
 */
export interface ExtendedSession {
  user: {
    id: number;
    email: string;
    fullName: string | null;
    roleTypeId: number | null;
    roleName: string | null;
    permissions: string[];
  };
}

/**
 * Получить сессию с расширенными данными пользователя
 */
export async function getExtendedSession(): Promise<ExtendedSession | null> {
  const session = await auth();

  if (!session?.user?.email) {
    return null;
  }

  // Получаем пользователя из БД с ролью
  const userRecord = await db
    .select({
      id: users.id,
      email: users.email,
      fullName: users.fullName,
      roleTypeId: users.roleTypeId,
      roleName: roleTypes.name,
      permissions: roleTypes.permissions,
    })
    .from(users)
    .leftJoin(roleTypes, eq(users.roleTypeId, roleTypes.id))
    .where(eq(users.email, session.user.email))
    .limit(1);

  if (userRecord.length === 0) {
    return null;
  }

  const user = userRecord[0];

  return {
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      roleTypeId: user.roleTypeId,
      roleName: user.roleName,
      permissions: (user.permissions as string[]) || [],
    },
  };
}

/**
 * Middleware для проверки аутентификации
 * Возвращает сессию или null если не аутентифицирован
 */
export async function requireAuth(): Promise<ExtendedSession | null> {
  const session = await getExtendedSession();

  if (!session) {
    return null;
  }

  return session;
}

/**
 * Middleware для проверки аутентификации с автоматическим ответом
 * @returns сессию если успешна, или NextResponse с ошибкой
 */
export async function ensureAuth(): Promise<ExtendedSession | NextResponse> {
  const session = await requireAuth();

  if (!session) {
    return unauthorizedError();
  }

  return session;
}

/**
 * Проверка наличия хотя бы одного разрешения
 */
export function hasPermission(session: ExtendedSession, permissions: string | string[]): boolean {
  const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];
  return requiredPermissions.some((perm) => session.user.permissions.includes(perm));
}

/**
 * Middleware для проверки прав доступа
 * @param session - сессия пользователя
 * @param permissions - требуемые разрешения (хотя бы одно)
 * @returns true если есть права, false иначе
 */
export function requirePermission(session: ExtendedSession, permissions: string | string[]): boolean {
  return hasPermission(session, permissions);
}

/**
 * Middleware для проверки прав доступа с автоматическим ответом
 * @param session - сессия пользователя
 * @param permissions - требуемые разрешения
 * @returns true если есть права, или NextResponse с ошибкой
 */
export function ensurePermission(
  session: ExtendedSession,
  permissions: string | string[]
): true | NextResponse {
  if (!hasPermission(session, permissions)) {
    return forbiddenError();
  }
  return true;
}

/**
 * Проверка роли пользователя
 */
export function hasRole(session: ExtendedSession, roles: string | string[]): boolean {
  const requiredRoles = Array.isArray(roles) ? roles : [roles];
  return requiredRoles.includes(session.user.roleName || '');
}

/**
 * Middleware для проверки роли с автоматическим ответом
 */
export function ensureRole(session: ExtendedSession, roles: string | string[]): true | NextResponse {
  if (!hasRole(session, roles)) {
    return forbiddenError(`Требуется одна из ролей: ${Array.isArray(roles) ? roles.join(', ') : roles}`);
  }
  return true;
}

/**
 * Проверка на администратора
 */
export function isAdmin(session: ExtendedSession): boolean {
  return session.user.roleName === 'admin';
}

/**
 * Middleware для проверки администратора с автоматическим ответом
 */
export function ensureAdmin(session: ExtendedSession): true | NextResponse {
  if (!isAdmin(session)) {
    return forbiddenError('Требуется роль администратора');
  }
  return true;
}

/**
 * Создать обработчик API с проверкой аутентификации и прав
 * @param handler - функция обработчика
 * @param requiredPermissions - требуемые разрешения
 */
export function createApiHandler<T>(
  handler: (session: ExtendedSession, request: Request) => Promise<T>,
  requiredPermissions?: string | string[]
) {
  return async (request: Request) => {
    // Проверка аутентификации
    const authResult = await ensureAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const session = authResult;

    // Проверка прав если указаны
    if (requiredPermissions) {
      const permissionResult = ensurePermission(session, requiredPermissions);
      if (permissionResult instanceof NextResponse) {
        return permissionResult;
      }
    }

    // Вызов обработчика
    try {
      return await handler(session, request);
    } catch (error) {
      console.error('API handler error:', error);
      throw error;
    }
  };
}

/**
 * Получить ID пользователя из сессии
 */
export function getUserId(session: ExtendedSession): number {
  return session.user.id;
}

/**
 * Проверка что пользователь является владельцем ресурса
 */
export function isOwner(session: ExtendedSession, ownerId: number): boolean {
  return session.user.id === ownerId;
}

/**
 * Проверка что пользователь является владельцем с автоматическим ответом
 */
export function ensureOwnership(
  session: ExtendedSession,
  ownerId: number
): true | NextResponse {
  if (!isOwner(session, ownerId)) {
    return forbiddenError('Доступ только к своим ресурсам');
  }
  return true;
}
