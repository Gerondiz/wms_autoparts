import { db } from '@/lib/db';
import {
  orders,
  orderItems,
  orderStatuses,
  users,
  parts,
  stockHistory,
} from '@/lib/db/schema';
import { eq, and, sql, desc, asc, inArray, isNull, or } from 'drizzle-orm';

/**
 * Получить статусы заказов по названиям
 */
async function getStatusIdByName(name: string): Promise<number | null> {
  const result = await db
    .select({ id: orderStatuses.id })
    .from(orderStatuses)
    .where(eq(orderStatuses.name, name))
    .limit(1);

  return result[0]?.id || null;
}

/**
 * Получить список заказов с фильтрацией
 */
export async function getOrders({
  status,
  priority,
  mechanicId,
  userId,
  userRoleName,
  page = 1,
  limit = 20,
}: {
  status?: string;
  priority?: number;
  mechanicId?: number;
  userId: number;
  userRoleName: string | null;
  page?: number;
  limit?: number;
}) {
  const offset = (page - 1) * limit;

  // Формируем условия фильтрации
  const conditions = [];

  // Фильтр по статусу
  if (status) {
    const statusId = await getStatusIdByName(status);
    if (statusId) {
      conditions.push(eq(orders.statusId, statusId));
    }
  }

  // Фильтр по приоритету
  if (priority) {
    conditions.push(eq(orders.priority, priority));
  }

  // Фильтр по механику (для менеджера)
  if (mechanicId) {
    conditions.push(eq(orders.mechanicId, mechanicId));
  }

  // Ограничение по роли (механик видит только свои)
  if (userRoleName === 'mechanic') {
    conditions.push(eq(orders.mechanicId, userId));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Получаем общее количество
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(orders)
    .where(whereClause);

  const total = Number(countResult[0]?.count || 0);

  // Получаем заказы
  const items = await db
    .select({
      id: orders.id,
      mechanicId: orders.mechanicId,
      mechanicName: users.fullName,
      repairManagerId: orders.repairManagerId,
      repairManagerName: sql<string>`rm.${users.fullName}`.as('repair_manager_name'),
      statusId: orders.statusId,
      statusName: orderStatuses.name,
      statusDisplayName: orderStatuses.displayName,
      statusColor: orderStatuses.color,
      priority: orders.priority,
      notes: orders.notes,
      itemsCount: sql<number>`(SELECT COUNT(*) FROM ${orderItems} WHERE ${orderItems.orderId} = ${orders.id})`.as('items_count'),
      createdAt: orders.createdAt,
      approvedAt: orders.approvedAt,
      completedAt: orders.completedAt,
    })
    .from(orders)
    .leftJoin(users, eq(orders.mechanicId, users.id))
    .leftJoin(orderStatuses, eq(orders.statusId, orderStatuses.id))
    .leftJoin(users, eq(orders.repairManagerId, users.id))
    .where(whereClause)
    .orderBy(desc(orders.createdAt))
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
 * Получить заказ по ID с позициями
 */
export async function getOrderById(id: number, userId: number, userRoleName: string | null) {
  // Получаем заказ
  const orderResults = await db
    .select({
      id: orders.id,
      mechanicId: orders.mechanicId,
      mechanicName: users.fullName,
      mechanicEmail: users.email,
      repairManagerId: orders.repairManagerId,
      repairManagerName: sql<string>`rm.${users.fullName}`.as('repair_manager_name'),
      statusId: orders.statusId,
      statusName: orderStatuses.name,
      statusDisplayName: orderStatuses.displayName,
      statusColor: orderStatuses.color,
      statusIsEditable: orderStatuses.isEditable,
      priority: orders.priority,
      notes: orders.notes,
      createdAt: orders.createdAt,
      approvedAt: orders.approvedAt,
      completedAt: orders.completedAt,
    })
    .from(orders)
    .leftJoin(users, eq(orders.mechanicId, users.id))
    .leftJoin(orderStatuses, eq(orders.statusId, orderStatuses.id))
    .leftJoin(users, eq(orders.repairManagerId, users.id))
    .where(eq(orders.id, id))
    .limit(1);

  const order = orderResults[0];
  if (!order) return null;

  // Проверка прав доступа
  if (userRoleName === 'mechanic' && order.mechanicId !== userId) {
    throw new Error('Доступ только к своим заказам');
  }

  // Получаем позиции заказа
  const items = await db
    .select({
      id: orderItems.id,
      partId: orderItems.partId,
      partName: parts.name,
      partNumber: parts.partNumber,
      partLocation: parts.location,
      quantity: orderItems.quantity,
      quantityFulfilled: orderItems.quantityFulfilled,
      status: orderItems.status,
    })
    .from(orderItems)
    .leftJoin(parts, eq(orderItems.partId, parts.id))
    .where(eq(orderItems.orderId, id))
    .orderBy(asc(orderItems.id));

  return {
    ...order,
    items,
  };
}

/**
 * Создать заказ из корзины
 */
export async function createOrder({
  mechanicId,
  items,
  notes,
  priority,
}: {
  mechanicId: number;
  items: { partId: number; quantity: number }[];
  notes?: string;
  priority?: number;
}) {
  // Получаем ID статуса "draft"
  const draftStatusId = await getStatusIdByName('draft');
  if (!draftStatusId) {
    throw new Error('Статус draft не найден');
  }

  return await db.transaction(async (tx) => {
    // Создаём заказ
    const orderResult = await tx
      .insert(orders)
      .values({
        mechanicId,
        statusId: draftStatusId,
        priority,
        notes,
      })
      .returning();

    const order = orderResult[0];

    // Добавляем позиции
    if (items.length > 0) {
      await tx.insert(orderItems).values(
        items.map((item) => ({
          orderId: order.id,
          partId: item.partId,
          quantity: item.quantity,
          quantityFulfilled: 0,
          status: 'pending',
        }))
      );
    }

    return order;
  });
}

/**
 * Обновить заказ (только draft)
 */
export async function updateOrder(
  id: number,
  data: {
    items?: { id?: number; partId: number; quantity: number }[];
    notes?: string;
    priority?: number;
  }
) {
  return await db.transaction(async (tx) => {
    // Проверяем статус
    const orderCheck = await tx
      .select({
        statusId: orders.statusId,
        statusName: orderStatuses.name,
      })
      .from(orders)
      .leftJoin(orderStatuses, eq(orders.statusId, orderStatuses.id))
      .where(eq(orders.id, id))
      .limit(1);

    if (orderCheck[0]?.statusName !== 'draft') {
      throw new Error('Можно редактировать только заказы в статусе draft');
    }

    // Обновляем основные поля
    await tx
      .update(orders)
      .set({
        notes: data.notes,
        priority: data.priority,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, id));

    // Обновляем позиции
    if (data.items) {
      // Удаляем старые позиции
      await tx.delete(orderItems).where(eq(orderItems.orderId, id));

      // Добавляем новые
      await tx.insert(orderItems).values(
        data.items.map((item) => ({
          orderId: id,
          partId: item.partId,
          quantity: item.quantity,
          quantityFulfilled: 0,
          status: 'pending',
        }))
      );
    }

    return { id, updated: true };
  });
}

/**
 * Удалить заказ (только draft)
 */
export async function deleteOrder(id: number): Promise<boolean> {
  return await db.transaction(async (tx) => {
    // Проверяем статус
    const orderCheck = await tx
      .select({ statusName: orderStatuses.name })
      .from(orders)
      .leftJoin(orderStatuses, eq(orders.statusId, orderStatuses.id))
      .where(eq(orders.id, id))
      .limit(1);

    if (orderCheck[0]?.statusName !== 'draft') {
      throw new Error('Можно удалять только заказы в статусе draft');
    }

    await tx.delete(orders).where(eq(orders.id, id));
    return true;
  });
}

/**
 * Отправить заказ на согласование
 */
export async function submitOrder(id: number, notes?: string) {
  return await db.transaction(async (tx) => {
    // Проверяем текущий статус
    const orderCheck = await tx
      .select({
        statusName: orderStatuses.name,
        mechanicId: orders.mechanicId,
      })
      .from(orders)
      .leftJoin(orderStatuses, eq(orders.statusId, orderStatuses.id))
      .where(eq(orders.id, id))
      .limit(1);

    if (orderCheck[0]?.statusName !== 'draft') {
      throw new Error('Можно отправить только заказ в статусе draft');
    }

    const submittedStatusId = await getStatusIdByName('submitted');
    if (!submittedStatusId) {
      throw new Error('Статус submitted не найден');
    }

    await tx
      .update(orders)
      .set({
        statusId: submittedStatusId,
        notes: notes || undefined,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, id));

    return { id, status: 'submitted', submittedAt: new Date() };
  });
}

/**
 * Согласовать заказ
 */
export async function approveOrder(
  id: number,
  repairManagerId: number,
  priority: number,
  notes?: string
) {
  return await db.transaction(async (tx) => {
    const approvedStatusId = await getStatusIdByName('approved');
    if (!approvedStatusId) {
      throw new Error('Статус approved не найден');
    }

    await tx
      .update(orders)
      .set({
        repairManagerId,
        statusId: approvedStatusId,
        priority,
        notes: notes || undefined,
        approvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(orders.id, id));

    return { id, status: 'approved', approvedAt: new Date(), repairManagerId, priority };
  });
}

/**
 * Отклонить заказ
 */
export async function rejectOrder(id: number, rejectionReason: string) {
  return await db.transaction(async (tx) => {
    const rejectedStatusId = await getStatusIdByName('rejected');
    if (!rejectedStatusId) {
      throw new Error('Статус rejected не найден');
    }

    await tx
      .update(orders)
      .set({
        statusId: rejectedStatusId,
        notes: `Отклонено: ${rejectionReason}`,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, id));

    return { id, status: 'rejected', rejectedAt: new Date() };
  });
}

/**
 * Отметить выдачу заказа (частичную или полную)
 */
export async function fulfillOrder(
  id: number,
  items: { orderItemId: number; quantityFulfilled: number }[],
  userId: number,
  notes?: string
) {
  return await db.transaction(async (tx) => {
    for (const item of items) {
      // Получаем позицию заказа
      const orderItemResult = await tx
        .select({
          partId: orderItems.partId,
          quantity: orderItems.quantity,
          quantityFulfilled: orderItems.quantityFulfilled,
        })
        .from(orderItems)
        .where(eq(orderItems.id, item.orderItemId))
        .limit(1);

      const orderItem = orderItemResult[0];
      if (!orderItem) continue;

      // Обновляем количество выданного
      const currentFulfilled = orderItem.quantityFulfilled || 0;
      const newFulfilled = Math.min(
        currentFulfilled + item.quantityFulfilled,
        orderItem.quantity
      );

      await tx
        .update(orderItems)
        .set({
          quantityFulfilled: newFulfilled,
          status: newFulfilled >= orderItem.quantity ? 'fulfilled' : 'partially_fulfilled',
        })
        .where(eq(orderItems.id, item.orderItemId));

      // Списываем со склада
      await tx
        .update(parts)
        .set({
          stock: sql`${parts.stock} - ${item.quantityFulfilled}`,
        })
        .where(eq(parts.id, orderItem.partId!));

      // Записываем в историю
      await tx.insert(stockHistory).values({
        partId: orderItem.partId,
        userId,
        quantityChange: -item.quantityFulfilled,
        reason: 'order_fulfillment',
        orderId: id,
        notes: notes || `Выдача по заказу #${id}`,
      });
    }

    // Проверяем статус заказа
    const allFulfilled = await tx
      .select({
        total: sql<number>`COUNT(*)`,
        fulfilled: sql<number>`COUNT(*) FILTER (WHERE ${orderItems.quantityFulfilled} >= ${orderItems.quantity})`,
      })
      .from(orderItems)
      .where(eq(orderItems.orderId, id));

    const statusName =
      allFulfilled[0]?.fulfilled === allFulfilled[0]?.total ? 'fulfilled' : 'partially_fulfilled';
    const statusId = await getStatusIdByName(statusName);

    const completedAt = statusName === 'fulfilled' ? new Date() : null;

    await tx
      .update(orders)
      .set({
        statusId: statusId || undefined,
        completedAt,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, id));

    return {
      id,
      status: statusName,
      completedAt,
    };
  });
}

/**
 * Добавить позицию в заказ
 */
export async function addOrderItem(
  orderId: number,
  partId: number,
  quantity: number
) {
  return await db.transaction(async (tx) => {
    // Проверяем статус заказа
    const orderCheck = await tx
      .select({ statusName: orderStatuses.name })
      .from(orders)
      .leftJoin(orderStatuses, eq(orders.statusId, orderStatuses.id))
      .where(eq(orders.id, orderId))
      .limit(1);

    if (orderCheck[0]?.statusName !== 'draft') {
      throw new Error('Можно добавлять позиции только в заказы в статусе draft');
    }

    // Проверяем, есть ли уже такая запчасть в заказе
    const existingItem = await tx
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId) && eq(orderItems.partId, partId))
      .limit(1);

    if (existingItem.length > 0) {
      // Обновляем количество
      await tx
        .update(orderItems)
        .set({
          quantity: sql`${orderItems.quantity} + ${quantity}`,
        })
        .where(eq(orderItems.id, existingItem[0].id));

      return { id: existingItem[0].id, updated: true };
    } else {
      // Добавляем новую позицию
      const newItem = await tx
        .insert(orderItems)
        .values({
          orderId,
          partId,
          quantity,
          quantityFulfilled: 0,
          status: 'pending',
        })
        .returning();

      return { id: newItem[0].id, created: true };
    }
  });
}

/**
 * Обновить позицию заказа
 */
export async function updateOrderItem(
  orderId: number,
  orderItemId: number,
  quantity: number
) {
  return await db.transaction(async (tx) => {
    // Проверяем статус заказа
    const orderCheck = await tx
      .select({ statusName: orderStatuses.name })
      .from(orders)
      .leftJoin(orderStatuses, eq(orders.statusId, orderStatuses.id))
      .where(eq(orders.id, orderId))
      .limit(1);

    if (orderCheck[0]?.statusName !== 'draft') {
      throw new Error('Можно изменять позиции только в заказах в статусе draft');
    }

    await tx
      .update(orderItems)
      .set({
        quantity,
      })
      .where(eq(orderItems.id, orderItemId));

    return { id: orderItemId, updated: true };
  });
}

/**
 * Удалить позицию из заказа
 */
export async function removeOrderItem(
  orderId: number,
  orderItemId: number
): Promise<boolean> {
  return await db.transaction(async (tx) => {
    // Проверяем статус заказа
    const orderCheck = await tx
      .select({ statusName: orderStatuses.name })
      .from(orders)
      .leftJoin(orderStatuses, eq(orders.statusId, orderStatuses.id))
      .where(eq(orders.id, orderId))
      .limit(1);

    if (orderCheck[0]?.statusName !== 'draft') {
      throw new Error('Можно удалять позиции только из заказов в статусе draft');
    }

    await tx.delete(orderItems).where(eq(orderItems.id, orderItemId));
    return true;
  });
}

/**
 * Получить историю изменений заказа
 */
export async function getOrderHistory(orderId: number) {
  const history = await db
    .select({
      id: stockHistory.id,
      orderId: stockHistory.orderId,
      userId: stockHistory.userId,
      userName: users.fullName,
      action: stockHistory.reason,
      quantityChange: stockHistory.quantityChange,
      notes: stockHistory.notes,
      createdAt: stockHistory.createdAt,
    })
    .from(stockHistory)
    .leftJoin(users, eq(stockHistory.userId, users.id))
    .where(eq(stockHistory.orderId, orderId))
    .orderBy(stockHistory.createdAt);

  return history;
}
