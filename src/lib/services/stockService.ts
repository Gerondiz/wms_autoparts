import { db } from '@/lib/db';
import { parts, stockHistory, itemHierarchy, users } from '@/lib/db/schema';
import { eq, and, sql, desc, asc, like, or, lt } from 'drizzle-orm';

/**
 * Получить текущие остатки с фильтрацией
 */
export async function getStock({
  search,
  lowStock,
  nodeId,
  page = 1,
  limit = 20,
}: {
  search?: string;
  lowStock?: boolean;
  nodeId?: number;
  page?: number;
  limit?: number;
}) {
  const offset = (page - 1) * limit;

  // Формируем условия
  const conditions = [];

  if (search) {
    const searchTerm = `%${search}%`;
    conditions.push(
      or(
        like(parts.name, searchTerm),
        like(parts.partNumber, searchTerm)
      )
    );
  }

  if (lowStock) {
    conditions.push(sql`${parts.stock} < ${parts.minStockLevel}`);
  }

  if (nodeId) {
    conditions.push(eq(parts.hierarchyId, nodeId));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Получаем общее количество
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(parts)
    .where(whereClause);

  const total = Number(countResult[0]?.count || 0);

  // Получаем остатки
  const items = await db
    .select({
      id: parts.id,
      name: parts.name,
      partNumber: parts.partNumber,
      stock: parts.stock,
      minStockLevel: parts.minStockLevel,
      location: parts.location,
      price: parts.price,
      hierarchyId: parts.hierarchyId,
      hierarchyName: itemHierarchy.name,
      isLowStock: sql<boolean>`${parts.stock} < ${parts.minStockLevel}`.as('is_low_stock'),
    })
    .from(parts)
    .leftJoin(itemHierarchy, eq(parts.hierarchyId, itemHierarchy.id))
    .where(whereClause)
    .orderBy(asc(parts.name))
    .limit(limit)
    .offset(offset);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Приход запчастей на склад
 */
export async function stockReceipt({
  partId,
  quantity,
  reason,
  notes,
  userId,
  orderId,
}: {
  partId: number;
  quantity: number;
  reason: string;
  notes?: string;
  userId?: number;
  orderId?: number;
}) {
  return await db.transaction(async (tx) => {
    // Получаем текущий остаток
    const partResult = await tx
      .select({ stock: parts.stock })
      .from(parts)
      .where(eq(parts.id, partId))
      .limit(1);

    if (partResult.length === 0) {
      throw new Error('Запчасть не найдена');
    }

    const oldStock = partResult[0].stock;
    const newStock = oldStock + quantity;

    // Обновляем остаток
    await tx
      .update(parts)
      .set({ stock: newStock })
      .where(eq(parts.id, partId));

    // Записываем в историю
    const historyResult = await tx
      .insert(stockHistory)
      .values({
        partId,
        userId: userId || null,
        quantityChange: quantity,
        reason,
        orderId: orderId || null,
        notes: notes || `Приход: +${quantity}`,
      })
      .returning();

    return {
      partId,
      oldStock,
      newStock,
      historyId: historyResult[0].id,
    };
  });
}

/**
 * Списание запчастей
 */
export async function stockWriteOff({
  partId,
  quantity,
  reason,
  notes,
  userId,
  orderId,
}: {
  partId: number;
  quantity: number;
  reason: string;
  notes?: string;
  userId?: number;
  orderId?: number;
}) {
  return await db.transaction(async (tx) => {
    // Получаем текущий остаток
    const partResult = await tx
      .select({ stock: parts.stock })
      .from(parts)
      .where(eq(parts.id, partId))
      .limit(1);

    if (partResult.length === 0) {
      throw new Error('Запчасть не найдена');
    }

    const oldStock = partResult[0].stock;
    if (oldStock < quantity) {
      throw new Error(`Недостаточно запчастей на складе. Доступно: ${oldStock}`);
    }

    const newStock = oldStock - quantity;

    // Обновляем остаток
    await tx
      .update(parts)
      .set({ stock: newStock })
      .where(eq(parts.id, partId));

    // Записываем в историю
    const historyResult = await tx
      .insert(stockHistory)
      .values({
        partId,
        userId: userId || null,
        quantityChange: -quantity,
        reason,
        orderId: orderId || null,
        notes: notes || `Списание: -${quantity}`,
      })
      .returning();

    return {
      partId,
      oldStock,
      newStock,
      historyId: historyResult[0].id,
    };
  });
}

/**
 * Получить историю изменений остатков
 */
export async function getStockHistory({
  partId,
  userId,
  orderId,
  reason,
  fromDate,
  toDate,
  page = 1,
  limit = 20,
}: {
  partId?: number;
  userId?: number;
  orderId?: number;
  reason?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}) {
  const offset = (page - 1) * limit;

  // Формируем условия
  const conditions = [];

  if (partId) {
    conditions.push(eq(stockHistory.partId, partId));
  }

  if (userId) {
    conditions.push(eq(stockHistory.userId, userId));
  }

  if (orderId) {
    conditions.push(eq(stockHistory.orderId, orderId));
  }

  if (reason) {
    conditions.push(eq(stockHistory.reason, reason));
  }

  if (fromDate) {
    conditions.push(sql`${stockHistory.createdAt} >= ${new Date(fromDate)}`);
  }

  if (toDate) {
    conditions.push(sql`${stockHistory.createdAt} <= ${new Date(toDate)}`);
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Получаем общее количество
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(stockHistory)
    .where(whereClause);

  const total = Number(countResult[0]?.count || 0);

  // Получаем историю
  const items = await db
    .select({
      id: stockHistory.id,
      partId: stockHistory.partId,
      partName: parts.name,
      partNumber: parts.partNumber,
      userId: stockHistory.userId,
      userName: users.fullName,
      quantityChange: stockHistory.quantityChange,
      reason: stockHistory.reason,
      orderId: stockHistory.orderId,
      notes: stockHistory.notes,
      createdAt: stockHistory.createdAt,
    })
    .from(stockHistory)
    .leftJoin(parts, eq(stockHistory.partId, parts.id))
    .leftJoin(users, eq(stockHistory.userId, users.id))
    .where(whereClause)
    .orderBy(desc(stockHistory.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Массовое обновление остатков (для импорта)
 */
export async function bulkStockUpdate(
  updates: { partId: number; stock: number; reason: string; notes?: string }[],
  userId?: number
) {
  return await db.transaction(async (tx) => {
    const results = [];

    for (const update of updates) {
      const partResult = await tx
        .select({ stock: parts.stock })
        .from(parts)
        .where(eq(parts.id, update.partId))
        .limit(1);

      if (partResult.length === 0) continue;

      const oldStock = partResult[0].stock;
      const quantityChange = update.stock - oldStock;

      await tx
        .update(parts)
        .set({ stock: update.stock })
        .where(eq(parts.id, update.partId));

      if (quantityChange !== 0) {
        const historyResult = await tx
          .insert(stockHistory)
          .values({
            partId: update.partId,
            userId: userId || null,
            quantityChange,
            reason: update.reason,
            notes: update.notes || `Обновление остатка: ${oldStock} -> ${update.stock}`,
          })
          .returning();

        results.push({
          partId: update.partId,
          oldStock,
          newStock: update.stock,
          historyId: historyResult[0].id,
        });
      }
    }

    return results;
  });
}
