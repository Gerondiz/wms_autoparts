import { db } from '@/lib/db';
import { users, roleTypes } from '@/lib/db/schema';
import { eq, sql, asc, and } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

/**
 * Получить список пользователей
 */
export async function getUsers() {
  const userList = await db
    .select({
      id: users.id,
      email: users.email,
      fullName: users.fullName,
      roleTypeId: users.roleTypeId,
      roleId: roleTypes.id,
      roleName: roleTypes.name,
      roleDisplayName: roleTypes.displayName,
      isActive: users.isActive,
      createdAt: users.createdAt,
    })
    .from(users)
    .leftJoin(roleTypes, eq(users.roleTypeId, roleTypes.id))
    .orderBy(sql`${users.fullName} ASC NULLS LAST`, asc(users.email));

  return userList;
}

/**
 * Получить пользователя по ID
 */
export async function getUserById(id: number) {
  const results = await db
    .select({
      id: users.id,
      email: users.email,
      fullName: users.fullName,
      roleTypeId: users.roleTypeId,
      roleId: roleTypes.id,
      roleName: roleTypes.name,
      roleDisplayName: roleTypes.displayName,
      permissions: roleTypes.permissions,
      isActive: users.isActive,
      createdAt: users.createdAt,
    })
    .from(users)
    .leftJoin(roleTypes, eq(users.roleTypeId, roleTypes.id))
    .where(eq(users.id, id))
    .limit(1);

  return results[0] || null;
}

/**
 * Получить пользователя по email
 */
export async function getUserByEmail(email: string) {
  const results = await db
    .select({
      id: users.id,
      email: users.email,
      passwordHash: users.passwordHash,
      fullName: users.fullName,
      roleTypeId: users.roleTypeId,
      roleName: roleTypes.name,
      permissions: roleTypes.permissions,
      isActive: users.isActive,
    })
    .from(users)
    .leftJoin(roleTypes, eq(users.roleTypeId, roleTypes.id))
    .where(eq(users.email, email))
    .limit(1);

  return results[0] || null;
}

/**
 * Создать пользователя
 */
export async function createUser(data: {
  email: string;
  password: string;
  fullName: string;
  roleTypeId: number;
}) {
  // Проверяем существование пользователя с таким email
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, data.email))
    .limit(1);

  if (existing.length > 0) {
    throw new Error('Пользователь с таким email уже существует');
  }

  // Проверяем существование роли
  const role = await db
    .select({ id: roleTypes.id })
    .from(roleTypes)
    .where(eq(roleTypes.id, data.roleTypeId))
    .limit(1);

  if (role.length === 0) {
    throw new Error('Роль не найдена');
  }

  // Хешируем пароль
  const passwordHash = await bcrypt.hash(data.password, 10);

  const result = await db
    .insert(users)
    .values({
      email: data.email,
      passwordHash,
      fullName: data.fullName,
      roleTypeId: data.roleTypeId,
      isActive: true,
    })
    .returning();

  return result[0];
}

/**
 * Обновить пользователя
 */
export async function updateUser(
  id: number,
  data: {
    email?: string;
    password?: string;
    fullName?: string;
    roleTypeId?: number;
    isActive?: boolean;
  }
) {
  // Проверяем существование пользователя
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  if (existing.length === 0) {
    throw new Error('Пользователь не найден');
  }

  // Проверяем email на уникальность
  if (data.email) {
    const emailExists = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.email, data.email), sql`${users.id} != ${id}`))
      .limit(1);

    if (emailExists.length > 0) {
      throw new Error('Пользователь с таким email уже существует');
    }
  }

  // Хешируем пароль если указан
  const updateData: any = { ...data };
  if (data.password) {
    updateData.passwordHash = await bcrypt.hash(data.password, 10);
    delete updateData.password;
  }

  const result = await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, id))
    .returning();

  return result[0];
}

/**
 * Удалить пользователя
 */
export async function deleteUser(id: number): Promise<boolean> {
  // Нельзя удалить первого администратора
  if (id === 1) {
    throw new Error('Нельзя удалить первого администратора');
  }

  const result = await db
    .delete(users)
    .where(eq(users.id, id))
    .returning({ id: users.id });

  return result.length > 0;
}

/**
 * Проверить пароль пользователя
 */
export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

/**
 * Изменить пароль пользователя
 */
export async function changePassword(userId: number, newPassword: string) {
  const passwordHash = await bcrypt.hash(newPassword, 10);

  await db
    .update(users)
    .set({ passwordHash })
    .where(eq(users.id, userId));

  return { success: true };
}
