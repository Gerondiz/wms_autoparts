import { db } from '@/lib/db';
import {
  orders,
  orderItems,
  orderStatuses,
  parts,
  stockHistory,
  users,
  roleTypes,
} from '@/lib/db/schema';
import { eq, sql, desc, and, gte, lte, asc } from 'drizzle-orm';

/**
 * Получить данные для dashboard аналитики
 */
export async function getDashboardData() {
  // Заказы по статусам
  const ordersByStatus = await db
    .select({
      status: orderStatuses.name,
      statusDisplayName: orderStatuses.displayName,
      count: sql<number>`count(*)`,
    })
    .from(orders)
    .leftJoin(orderStatuses, eq(orders.statusId, orderStatuses.id))
    .groupBy(orderStatuses.name, orderStatuses.displayName)
    .orderBy(desc(sql`count(*)`));

  // Популярные запчасти (по количеству заказов)
  const popularParts = await db
    .select({
      partId: parts.id,
      partName: parts.name,
      partNumber: parts.partNumber,
      ordersCount: sql<number>`count(distinct ${orderItems.orderId})`,
      totalQuantity: sql<number>`sum(${orderItems.quantity})`,
    })
    .from(orderItems)
    .leftJoin(parts, eq(orderItems.partId, parts.id))
    .groupBy(parts.id, parts.name, parts.partNumber)
    .orderBy(desc(sql`count(distinct ${orderItems.orderId})`))
    .limit(10);

  // Запчасти с низким остатком
  const lowStockParts = await db
    .select({
      partId: parts.id,
      partName: parts.name,
      partNumber: parts.partNumber,
      stock: parts.stock,
      minStockLevel: parts.minStockLevel,
      location: parts.location,
    })
    .from(parts)
    .where(sql`${parts.stock} < ${parts.minStockLevel}`)
    .orderBy(asc(parts.stock))
    .limit(10);

  // Недавние заказы
  const recentOrders = await db
    .select({
      id: orders.id,
      mechanicName: users.fullName,
      statusName: orderStatuses.name,
      statusDisplayName: orderStatuses.displayName,
      statusColor: orderStatuses.color,
      priority: orders.priority,
      itemsCount: sql<number>`(SELECT COUNT(*) FROM ${orderItems} WHERE ${orderItems.orderId} = ${orders.id})`,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .leftJoin(users, eq(orders.mechanicId, users.id))
    .leftJoin(orderStatuses, eq(orders.statusId, orderStatuses.id))
    .orderBy(desc(orders.createdAt))
    .limit(10);

  // Общая статистика
  const statsResult = await db
    .select({
      totalUsers: sql<number>`(SELECT COUNT(*) FROM ${users})`,
      totalParts: sql<number>`(SELECT COUNT(*) FROM ${parts})`,
      totalOrders: sql<number>`(SELECT COUNT(*) FROM ${orders})`,
      totalRoles: sql<number>`(SELECT COUNT(*) FROM ${roleTypes})`,
    })
    .from(orders)
    .limit(1);

  const stats = statsResult[0] || {
    totalUsers: 0,
    totalParts: 0,
    totalOrders: 0,
    totalRoles: 0,
  };

  // Активность за последние 7 дней
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentActivity = await db
    .select({
      date: sql<string>`DATE(${stockHistory.createdAt})`,
      receiptsCount: sql<number>`COUNT(*) FILTER (WHERE ${stockHistory.quantityChange} > 0)`,
      writeOffsCount: sql<number>`COUNT(*) FILTER (WHERE ${stockHistory.quantityChange} < 0)`,
      totalQuantityChange: sql<number>`SUM(${stockHistory.quantityChange})`,
    })
    .from(stockHistory)
    .where(gte(stockHistory.createdAt, sevenDaysAgo))
    .groupBy(sql`DATE(${stockHistory.createdAt})`)
    .orderBy(desc(sql`DATE(${stockHistory.createdAt})`));

  return {
    ordersByStatus: ordersByStatus.map((s) => ({
      status: s.status,
      displayName: s.statusDisplayName,
      count: Number(s.count),
    })),
    popularParts: popularParts.map((p) => ({
      partId: p.partId,
      name: p.partName,
      partNumber: p.partNumber,
      ordersCount: Number(p.ordersCount),
      totalQuantity: Number(p.totalQuantity || 0),
    })),
    lowStockParts: lowStockParts.map((p) => ({
      partId: p.partId,
      name: p.partName,
      partNumber: p.partNumber,
      stock: p.stock,
      minStockLevel: p.minStockLevel,
      location: p.location,
    })),
    recentOrders: recentOrders.map((o) => ({
      id: o.id,
      mechanicName: o.mechanicName,
      status: o.statusName,
      statusDisplayName: o.statusDisplayName,
      statusColor: o.statusColor,
      priority: o.priority,
      itemsCount: Number(o.itemsCount),
      createdAt: o.createdAt,
    })),
    stats,
    recentActivity: recentActivity.map((a) => ({
      date: a.date,
      receiptsCount: Number(a.receiptsCount),
      writeOffsCount: Number(a.writeOffsCount),
      totalQuantityChange: Number(a.totalQuantityChange || 0),
    })),
  };
}

/**
 * Получить отчёт по заказам за период
 */
export async function getOrdersReport(fromDate: Date, toDate: Date) {
  const ordersReport = await db
    .select({
      id: orders.id,
      mechanicName: users.fullName,
      statusName: orderStatuses.name,
      priority: orders.priority,
      itemsCount: sql<number>`count(${orderItems.id})`,
      totalQuantity: sql<number>`sum(${orderItems.quantity})`,
      createdAt: orders.createdAt,
      approvedAt: orders.approvedAt,
      completedAt: orders.completedAt,
    })
    .from(orders)
    .leftJoin(users, eq(orders.mechanicId, users.id))
    .leftJoin(orderStatuses, eq(orders.statusId, orderStatuses.id))
    .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
    .where(and(gte(orders.createdAt, fromDate), lte(orders.createdAt, toDate)))
    .groupBy(
      orders.id,
      users.fullName,
      orderStatuses.name,
      orders.priority,
      orders.createdAt,
      orders.approvedAt,
      orders.completedAt
    )
    .orderBy(desc(orders.createdAt));

  return ordersReport;
}

/**
 * Получить отчёт по движению запчастей
 */
export async function getPartsMovementReport(partId: number, fromDate: Date, toDate: Date) {
  const movement = await db
    .select({
      id: stockHistory.id,
      quantityChange: stockHistory.quantityChange,
      reason: stockHistory.reason,
      userName: users.fullName,
      orderNumber: orders.id,
      notes: stockHistory.notes,
      createdAt: stockHistory.createdAt,
    })
    .from(stockHistory)
    .leftJoin(users, eq(stockHistory.userId, users.id))
    .leftJoin(orders, eq(stockHistory.orderId, orders.id))
    .where(
      and(
        eq(stockHistory.partId, partId),
        gte(stockHistory.createdAt, fromDate),
        lte(stockHistory.createdAt, toDate)
      )
    )
    .orderBy(desc(stockHistory.createdAt));

  return movement;
}
