/**
 * API сервис для управления заказами
 */

import {
  OrderWithDetails,
  OrderQueryParams,
  CreateOrderDto,
  UpdateOrderDto,
  SubmitOrderDto,
  ApproveOrderDto,
  RejectOrderDto,
  FulfillOrderDto,
  OrdersListResponse,
  OrderDetailResponse,
  OrderCreateResponse,
  OrderActionResponse,
} from '@/lib/types/orders';
import { PaginatedResponse } from '@/lib/api/types';

const API_BASE = '/api/orders';

/**
 * Получить список заказов с фильтрацией и пагинацией
 */
export async function getOrders(params: OrderQueryParams): Promise<OrdersListResponse> {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set('page', params.page.toString());
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);
  if (params.statusId) {
    if (Array.isArray(params.statusId)) {
      params.statusId.forEach(id => searchParams.append('statusId', id.toString()));
    } else {
      searchParams.set('statusId', params.statusId.toString());
    }
  }
  if (params.priority) {
    if (Array.isArray(params.priority)) {
      params.priority.forEach(p => searchParams.append('priority', p.toString()));
    } else {
      searchParams.set('priority', params.priority.toString());
    }
  }
  if (params.mechanicId) searchParams.set('mechanicId', params.mechanicId.toString());
  if (params.repairManagerId) searchParams.set('repairManagerId', params.repairManagerId.toString());
  if (params.dateFrom) searchParams.set('dateFrom', params.dateFrom.toISOString());
  if (params.dateTo) searchParams.set('dateTo', params.dateTo.toISOString());
  if (params.search) searchParams.set('search', params.search);
  if (params.roleFilter) searchParams.set('roleFilter', params.roleFilter);

  const response = await fetch(`${API_BASE}?${searchParams.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Ошибка загрузки заказов' }));
    throw new Error(error.error?.message || 'Ошибка загрузки заказов');
  }

  return response.json();
}

/**
 * Получить детальную информацию о заказе
 */
export async function getOrderById(id: number): Promise<OrderDetailResponse> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Ошибка загрузки заказа' }));
    throw new Error(error.error?.message || 'Ошибка загрузки заказа');
  }

  return response.json();
}

/**
 * Создать новый заказ
 */
export async function createOrder(data: CreateOrderDto): Promise<OrderCreateResponse> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Ошибка создания заказа' }));
    throw new Error(error.error?.message || 'Ошибка создания заказа');
  }

  return response.json();
}

/**
 * Обновить заказ
 */
export async function updateOrder(id: number, data: UpdateOrderDto): Promise<OrderActionResponse> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Ошибка обновления заказа' }));
    throw new Error(error.error?.message || 'Ошибка обновления заказа');
  }

  return response.json();
}

/**
 * Удалить заказ (только черновик)
 */
export async function deleteOrder(id: number): Promise<OrderActionResponse> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Ошибка удаления заказа' }));
    throw new Error(error.error?.message || 'Ошибка удаления заказа');
  }

  return response.json();
}

/**
 * Отправить заказ на согласование
 */
export async function submitOrder(data: SubmitOrderDto): Promise<OrderActionResponse> {
  const response = await fetch(`${API_BASE}/${data.orderId}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Ошибка отправки заказа' }));
    throw new Error(error.error?.message || 'Ошибка отправки заказа');
  }

  return response.json();
}

/**
 * Согласовать заказ
 */
export async function approveOrder(data: ApproveOrderDto): Promise<OrderActionResponse> {
  const response = await fetch(`${API_BASE}/${data.orderId}/approve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Ошибка согласования заказа' }));
    throw new Error(error.error?.message || 'Ошибка согласования заказа');
  }

  return response.json();
}

/**
 * Отклонить заказ
 */
export async function rejectOrder(data: RejectOrderDto): Promise<OrderActionResponse> {
  const response = await fetch(`${API_BASE}/${data.orderId}/reject`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Ошибка отклонения заказа' }));
    throw new Error(error.error?.message || 'Ошибка отклонения заказа');
  }

  return response.json();
}

/**
 * Выдать заказ (полностью или частично)
 */
export async function fulfillOrder(data: FulfillOrderDto): Promise<OrderActionResponse> {
  const response = await fetch(`${API_BASE}/${data.orderId}/fulfill`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Ошибка выдачи заказа' }));
    throw new Error(error.error?.message || 'Ошибка выдачи заказа');
  }

  return response.json();
}

/**
 * Добавить позицию в заказ
 */
export async function addOrderItem(orderId: number, partId: number, quantity: number): Promise<OrderActionResponse> {
  const response = await fetch(`${API_BASE}/${orderId}/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ partId, quantity }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Ошибка добавления позиции' }));
    throw new Error(error.error?.message || 'Ошибка добавления позиции');
  }

  return response.json();
}

/**
 * Обновить позицию заказа
 */
export async function updateOrderItem(
  orderId: number,
  orderItemId: number,
  quantity: number
): Promise<OrderActionResponse> {
  const response = await fetch(`${API_BASE}/${orderId}/items/${orderItemId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ quantity }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Ошибка обновления позиции' }));
    throw new Error(error.error?.message || 'Ошибка обновления позиции');
  }

  return response.json();
}

/**
 * Удалить позицию из заказа
 */
export async function removeOrderItem(orderId: number, orderItemId: number): Promise<OrderActionResponse> {
  const response = await fetch(`${API_BASE}/${orderId}/items/${orderItemId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Ошибка удаления позиции' }));
    throw new Error(error.error?.message || 'Ошибка удаления позиции');
  }

  return response.json();
}

/**
 * Получить историю изменений заказа
 */
export async function getOrderHistory(orderId: number) {
  const response = await fetch(`${API_BASE}/${orderId}/history`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Ошибка загрузки истории' }));
    throw new Error(error.error?.message || 'Ошибка загрузки истории');
  }

  return response.json();
}
