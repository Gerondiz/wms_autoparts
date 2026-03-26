import { NextRequest } from 'next/server';
import { successResponse, errorResponse, ApiErrorCode, HttpStatus } from '@/lib/api';
import { ensureAuth, hasPermission, ordersListSchema, orderCreateSchema } from '@/lib/api';
import { ordersService } from '@/lib/services';
import { orderStatuses, orders, users, orderItems } from '@/lib/db/schema';
import { eq, and, desc, or, sql } from 'drizzle-orm';
import { db } from '@/lib/db';

/**
 * GET /api/orders
 * Получить список заказов с фильтрацией
 */
export async function GET(request: NextRequest) {
  try {
    const session = await ensureAuth();
    if (session instanceof Response) {
      return session;
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const roleFilter = searchParams.get('roleFilter');
    const statusIds = searchParams.getAll('statusId').map(id => parseInt(id, 10));
    const priorities = searchParams.getAll('priority').map(p => parseInt(p, 10));
    const search = searchParams.get('search');

    const offset = (page - 1) * limit;
    const userRoleName = session.user.roleName;
    const userId = session.user.id;

    // Формируем условия фильтрации
    const conditions = [];

    // Фильтр по роли
    if (roleFilter === 'own' || userRoleName === 'mechanic') {
      conditions.push(eq(orders.mechanicId, userId));
    } else if (roleFilter === 'for_approval' && userRoleName === 'repair_manager') {
      // Менеджер видит заказы на согласование
      const submittedStatusId = await getStatusCode('submitted');
      if (submittedStatusId) {
        conditions.push(eq(orders.statusId, submittedStatusId));
      }
    } else if (roleFilter === 'for_fulfillment' && userRoleName === 'storekeeper') {
      // Кладовщик видит согласованные заказы
      const approvedStatusId = await getStatusCode('approved');
      const partiallyFulfilledStatusId = await getStatusCode('partially_fulfilled');
      if (approvedStatusId && partiallyFulfilledStatusId) {
        conditions.push(or(
          eq(orders.statusId, approvedStatusId),
          eq(orders.statusId, partiallyFulfilledStatusId)
        ));
      }
    }

    // Фильтр по статусам
    if (statusIds.length > 0) {
      conditions.push(eq(orders.statusId, statusIds[0]));
    }

    // Фильтр по приоритетам
    if (priorities.length > 0) {
      conditions.push(eq(orders.priority, priorities[0]));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Получаем общее количество
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders);
    
    // Применяем фильтр если есть
    if (whereClause) {
      countResult.length = 0; // Очищаем для правильного запроса
    }
    
    const countQuery = db.select({ count: sql<number>`count(*)` }).from(orders);
    const countWithFilter = whereClause ? await countQuery.where(whereClause) : await countQuery;
    const total = Number(countWithFilter[0]?.count || 0);

    // Получаем заказы
    const query = db
      .select({
        id: orders.id,
        mechanicId: orders.mechanicId,
        mechanicName: sql<string>`m.${users.fullName}`.as('mechanic_name'),
        repairManagerId: orders.repairManagerId,
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
      .leftJoin(users, eq(orders.repairManagerId, users.id));
    
    // Применяем фильтр и сортировку
    const items = whereClause
      ? await query.where(whereClause).orderBy(desc(orders.createdAt)).limit(limit).offset(offset)
      : await query.orderBy(desc(orders.createdAt)).limit(limit).offset(offset);

    return successResponse({
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error('Error in orders:', error);
    return errorResponse(
      ApiErrorCode.INTERNAL_ERROR,
      'Внутренняя ошибка сервера',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

// Вспомогательная функция для получения ID статуса
async function getStatusCode(name: string): Promise<number | null> {
  const result = await db
    .select({ id: orderStatuses.id })
    .from(orderStatuses)
    .where(eq(orderStatuses.name, name))
    .limit(1);
  return result[0]?.id || null;
}

/**
 * POST /api/orders
 * Создать заказ из корзины
 */
export async function POST(request: NextRequest) {
  try {
    // Проверка аутентификации и прав
    const session = await ensureAuth();
    if (session instanceof Response) {
      return session;
    }

    if (!hasPermission(session, 'order_create')) {
      return errorResponse(
        ApiErrorCode.FORBIDDEN,
        'Недостаточно прав для создания заказа',
        HttpStatus.FORBIDDEN
      );
    }

    const body = await request.json();
    const validation = orderCreateSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(
        ApiErrorCode.VALIDATION_ERROR,
        'Ошибка валидации данных',
        HttpStatus.BAD_REQUEST,
        validation.error.errors
      );
    }

    const newOrder = await ordersService.createOrder({
      mechanicId: session.user.id,
      items: validation.data.items,
      notes: validation.data.notes,
      priority: validation.data.priority,
    });

    return successResponse(newOrder, HttpStatus.CREATED);
  } catch (error: any) {
    console.error('Error creating order:', error);
    return errorResponse(
      ApiErrorCode.INTERNAL_ERROR,
      'Внутренняя ошибка сервера',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
