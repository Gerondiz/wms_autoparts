/**
 * API endpoint для генерации PDF заказа
 * GET /api/orders/[id]/pdf
 */

import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { ensureAuth, hasPermission, getExtendedSession } from '@/lib/api';
import { ordersService } from '@/lib/services';
import { generateOrderPDF } from '@/lib/pdf/pdfService';

/**
 * GET /api/orders/[id]/pdf
 * Генерация PDF документа для заказа
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Проверка аутентификации
    const sessionResult = await ensureAuth();
    if (sessionResult instanceof NextResponse) {
      return sessionResult;
    }
    const session = sessionResult;

    // Парсинг ID заказа
    const id = parseInt((await params).id, 10);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: { message: 'Неверный формат ID заказа' } },
        { status: 400 }
      );
    }

    // Проверка прав доступа
    // Доступ разрешен: механик (свой заказ), repair_manager, storekeeper, admin
    const canViewAll = hasPermission(session, 'order_view_all');
    const canViewOwn = hasPermission(session, 'order_view_own');

    if (!canViewAll && !canViewOwn) {
      return NextResponse.json(
        { error: { message: 'Недостаточно прав для просмотра заказов' } },
        { status: 403 }
      );
    }

    // Получение данных заказа
    const order = await ordersService.getOrderById(id, session.user.id, session.user.roleName);

    if (!order) {
      return NextResponse.json(
        { error: { message: 'Заказ не найден' } },
        { status: 404 }
      );
    }

    // Проверка что пользователь имеет доступ к этому заказу
    const isOwnOrder = String(order.mechanicId) === String(session.user.id);
    const isAdmin = session.user.roleName === 'admin';
    const isRepairManager = session.user.roleName === 'repair_manager';
    const isStorekeeper = session.user.roleName === 'storekeeper';

    if (!canViewAll && !isOwnOrder) {
      return NextResponse.json(
        { error: { message: 'Доступ только к своим заказам' } },
        { status: 403 }
      );
    }

    // Проверка статуса заказа для генерации PDF
    // PDF доступен для статусов: approved, partially_fulfilled, fulfilled
    const allowedStatuses = ['approved', 'partially_fulfilled', 'fulfilled'];
    const orderStatus = order.statusName;
    
    // Для механика и repair_manager - только согласованные и выполненные
    // Для storekeeper и admin - все статусы
    if (!isAdmin && !isStorekeeper && orderStatus && !allowedStatuses.includes(orderStatus)) {
      return NextResponse.json(
        { 
          error: { 
            message: `PDF доступен только для заказов со статусом: ${allowedStatuses.join(', ')}` 
          } 
        },
        { status: 403 }
      );
    }

    // Генерация PDF
    const pdfResult = await generateOrderPDF(order);

    // Создание ответа с PDF (конвертируем Buffer в Uint8Array)
    return new NextResponse(new Uint8Array(pdfResult.buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${pdfResult.fileName}"`,
        'Content-Length': pdfResult.buffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error: any) {
    console.error('Error generating order PDF:', error);

    // Обработка ошибок
    if (error.message.includes('не найден')) {
      return NextResponse.json(
        { error: { message: 'Заказ не найден' } },
        { status: 404 }
      );
    }

    if (error.message.includes('Доступ только к своим')) {
      return NextResponse.json(
        { error: { message: error.message } },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: { message: 'Ошибка генерации PDF документа' } },
      { status: 500 }
    );
  }
}
