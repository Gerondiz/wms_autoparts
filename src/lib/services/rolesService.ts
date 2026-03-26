import { db } from '@/lib/db';
import { roleTypes, users } from '@/lib/db/schema';
import { eq, sql, count, asc } from 'drizzle-orm';

/**
 * Получить список ролей
 */
export async function getRoles() {
  const roles = await db
    .select({
      id: roleTypes.id,
      name: roleTypes.name,
      displayName: roleTypes.displayName,
      permissions: roleTypes.permissions,
      sortOrder: roleTypes.sortOrder,
      isSystem: roleTypes.isSystem,
      usersCount: sql<number>`(SELECT COUNT(*) FROM ${users} WHERE ${users.roleTypeId} = ${roleTypes.id})`.as('users_count'),
    })
    .from(roleTypes)
    .orderBy(asc(roleTypes.sortOrder), asc(roleTypes.name));

  return roles;
}

/**
 * Получить роль по ID
 */
export async function getRoleById(id: number) {
  const results = await db
    .select({
      id: roleTypes.id,
      name: roleTypes.name,
      displayName: roleTypes.displayName,
      permissions: roleTypes.permissions,
      sortOrder: roleTypes.sortOrder,
      isSystem: roleTypes.isSystem,
    })
    .from(roleTypes)
    .where(eq(roleTypes.id, id))
    .limit(1);

  return results[0] || null;
}

/**
 * Создать роль
 */
export async function createRole(data: {
  name: string;
  displayName: string;
  permissions: string[];
  sortOrder?: number;
}) {
  // Проверяем существование роли с таким именем
  const existing = await db
    .select({ id: roleTypes.id })
    .from(roleTypes)
    .where(eq(roleTypes.name, data.name))
    .limit(1);

  if (existing.length > 0) {
    throw new Error('Роль с таким именем уже существует');
  }

  const result = await db
    .insert(roleTypes)
    .values({
      name: data.name,
      displayName: data.displayName,
      permissions: data.permissions,
      sortOrder: data.sortOrder ?? 0,
      isSystem: false,
    })
    .returning();

  return result[0];
}

/**
 * Обновить роль
 */
export async function updateRole(
  id: number,
  data: {
    displayName?: string;
    permissions?: string[];
    sortOrder?: number;
  }
) {
  // Проверяем существование роли
  const existing = await db
    .select({ id: roleTypes.id, isSystem: roleTypes.isSystem })
    .from(roleTypes)
    .where(eq(roleTypes.id, id))
    .limit(1);

  if (existing.length === 0) {
    throw new Error('Роль не найдена');
  }

  // Нельзя изменять системные роли
  if (existing[0].isSystem) {
    throw new Error('Нельзя изменять системную роль');
  }

  const result = await db
    .update(roleTypes)
    .set(data)
    .where(eq(roleTypes.id, id))
    .returning();

  return result[0];
}

/**
 * Удалить роль
 */
export async function deleteRole(id: number): Promise<boolean> {
  // Проверяем существование роли
  const existing = await db
    .select({ id: roleTypes.id, isSystem: roleTypes.isSystem })
    .from(roleTypes)
    .where(eq(roleTypes.id, id))
    .limit(1);

  if (existing.length === 0) {
    throw new Error('Роль не найдена');
  }

  // Нельзя удалить системную роль
  if (existing[0].isSystem) {
    throw new Error('Нельзя удалить системную роль');
  }

  // Проверяем есть ли пользователи с этой ролью
  const usersCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(eq(users.roleTypeId, id));

  if (usersCount[0]?.count && usersCount[0].count > 0) {
    throw new Error('Нельзя удалить роль, у которой есть пользователи');
  }

  const result = await db
    .delete(roleTypes)
    .where(eq(roleTypes.id, id))
    .returning({ id: roleTypes.id });

  return result.length > 0;
}

/**
 * Получить доступные разрешения
 */
export function getAvailablePermissions(): string[] {
  return [
    // Иерархия
    'catalog_view',
    'hierarchy_manage',
    // Запчасти
    'parts_manage',
    // Заказы
    'order_create',
    'order_view_own',
    'order_view_all',
    'order_edit_own_draft',
    'order_approve',
    'order_fulfill',
    // Склад
    'stock_view',
    'stock_view_history',
    'stock_manage',
    // Пользователи
    'user_manage',
    // Роли
    'role_manage',
    // Отчёты
    'reports_view',
  ];
}
