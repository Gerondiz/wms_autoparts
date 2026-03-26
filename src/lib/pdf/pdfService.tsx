/**
 * Сервис генерации PDF для заказов
 * Использует @react-pdf/renderer для рендеринга PDF документов
 */

import { renderToBuffer } from '@react-pdf/renderer';
import { OrderTemplate } from './OrderTemplate';

// Тип для данных заказа в PDF
export interface OrderPdfData {
  id: number;
  mechanicId: number | null;
  mechanicName: string | null;
  mechanicEmail: string | null;
  repairManagerId: number | null;
  repairManagerName: string | null;
  statusId: number | null;
  statusName: string | null;
  statusDisplayName: string | null;
  statusColor: string | null;
  priority: number | null;
  notes: string | null;
  createdAt: Date | string | null;
  approvedAt: Date | string | null;
  completedAt: Date | string | null;
  items: {
    id: number;
    partId: number | null;
    partName: string | null;
    partNumber: string | null;
    partLocation: string | null;
    quantity: number;
    quantityFulfilled: number | null;
    status: string | null;
  }[];
}

/**
 * Результат генерации PDF
 */
export interface PdfGenerationResult {
  buffer: Buffer;
  fileName: string;
  contentType: string;
}

/**
 * Сгенерировать PDF для заказа
 * @param order - Данные заказа
 * @returns Buffer с PDF документом
 */
export async function generateOrderPDF(order: OrderPdfData): Promise<PdfGenerationResult> {
  try {
    // Рендеринг шаблона в буфер
    const buffer = await renderToBuffer(<OrderTemplate order={order} />);
    
    // Формирование имени файла
    const fileName = `order-${order.id}-${formatDateForFileName(new Date())}.pdf`;
    
    return {
      buffer,
      fileName,
      contentType: 'application/pdf',
    };
  } catch (error) {
    console.error('Error generating order PDF:', error);
    throw new Error('Ошибка генерации PDF документа');
  }
}

/**
 * Форматирование даты для имени файла
 */
function formatDateForFileName(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}${month}${day}-${hours}${minutes}`;
}

/**
 * Получить данные заказа и сгенерировать PDF
 * Эта функция может быть использована в API endpoint
 * @param orderId - ID заказа
 * @param fetchOrderFn - Функция для получения данных заказа
 * @returns Результат генерации PDF
 */
export async function generateOrderPDFById(
  orderId: number,
  fetchOrderFn: (id: number) => Promise<OrderPdfData>
): Promise<PdfGenerationResult> {
  // Получение данных заказа
  const order = await fetchOrderFn(orderId);

  if (!order) {
    throw new Error(`Заказ с ID ${orderId} не найден`);
  }

  // Генерация PDF
  return generateOrderPDF(order);
}
