/**
 * Константы для системы управления заказами
 */

import { OrderStatusCode, OrderPriority, OrderItemStatus } from '@/lib/types/orders';

// ==================== Конфигурация статусов заказов ====================

export const ORDER_STATUS_CONFIG: Record<OrderStatusCode, {
  label: string;
  color: string;
  variant: 'filled' | 'outlined';
  icon: string;
  isFinal: boolean;
  isEditable: boolean;
  allowedTransitions: OrderStatusCode[];
}> = {
  [OrderStatusCode.DRAFT]: {
    label: 'Черновик',
    color: 'default',
    variant: 'outlined',
    icon: 'draft',
    isFinal: false,
    isEditable: true,
    allowedTransitions: [OrderStatusCode.SUBMITTED],
  },
  [OrderStatusCode.SUBMITTED]: {
    label: 'Отправлен',
    color: 'info',
    variant: 'filled',
    icon: 'send',
    isFinal: false,
    isEditable: false,
    allowedTransitions: [OrderStatusCode.APPROVED, OrderStatusCode.REJECTED],
  },
  [OrderStatusCode.APPROVED]: {
    label: 'Согласован',
    color: 'success',
    variant: 'filled',
    icon: 'check_circle',
    isFinal: false,
    isEditable: false,
    allowedTransitions: [OrderStatusCode.PARTIALLY_FULFILLED, OrderStatusCode.FULFILLED],
  },
  [OrderStatusCode.REJECTED]: {
    label: 'Отклонён',
    color: 'error',
    variant: 'filled',
    icon: 'cancel',
    isFinal: true,
    isEditable: false,
    allowedTransitions: [],
  },
  [OrderStatusCode.PARTIALLY_FULFILLED]: {
    label: 'Выдан частично',
    color: 'warning',
    variant: 'filled',
    icon: 'inventory_2',
    isFinal: false,
    isEditable: false,
    allowedTransitions: [OrderStatusCode.FULFILLED],
  },
  [OrderStatusCode.FULFILLED]: {
    label: 'Выдан полностью',
    color: 'success',
    variant: 'filled',
    icon: 'done_all',
    isFinal: true,
    isEditable: false,
    allowedTransitions: [],
  },
};

// ==================== Конфигурация приоритетов ====================

export const PRIORITY_CONFIG: Record<OrderPriority, {
  label: string;
  color: string;
  icon: string;
  sortOrder: number;
}> = {
  [OrderPriority.HIGH]: {
    label: 'Высокий',
    color: 'error',
    icon: 'arrow_upward',
    sortOrder: 1,
  },
  [OrderPriority.MEDIUM]: {
    label: 'Средний',
    color: 'warning',
    icon: 'remove',
    sortOrder: 2,
  },
  [OrderPriority.LOW]: {
    label: 'Низкий',
    color: 'info',
    icon: 'arrow_downward',
    sortOrder: 3,
  },
};

// ==================== Конфигурация статусов позиций заказа ====================

export const ORDER_ITEM_STATUS_CONFIG: Record<OrderItemStatus, {
  label: string;
  color: string;
}> = {
  [OrderItemStatus.PENDING]: {
    label: 'Ожидается',
    color: 'default',
  },
  [OrderItemStatus.PARTIAL]: {
    label: 'Частично',
    color: 'warning',
  },
  [OrderItemStatus.FULFILLED]: {
    label: 'Выдано',
    color: 'success',
  },
  [OrderItemStatus.CANCELLED]: {
    label: 'Отменено',
    color: 'error',
  },
};

// ==================== Разрешения по ролям ====================

export const ROLE_ORDER_PERMISSIONS: Record<string, {
  canViewOwn: boolean;
  canViewAll: boolean;
  canCreate: boolean;
  canEditDraft: boolean;
  canSubmit: boolean;
  canApprove: boolean;
  canReject: boolean;
  canFulfill: boolean;
}> = {
  MECHANIC: {
    canViewOwn: true,
    canViewAll: false,
    canCreate: true,
    canEditDraft: true,
    canSubmit: true,
    canApprove: false,
    canReject: false,
    canFulfill: false,
  },
  REPAIR_MANAGER: {
    canViewOwn: true,
    canViewAll: true,
    canCreate: true,
    canEditDraft: true,
    canSubmit: true,
    canApprove: true,
    canReject: true,
    canFulfill: false,
  },
  STOREKEEPER: {
    canViewOwn: false,
    canViewAll: true,
    canCreate: false,
    canEditDraft: false,
    canSubmit: false,
    canApprove: false,
    canReject: false,
    canFulfill: true,
  },
  ADMIN: {
    canViewOwn: false,
    canViewAll: true,
    canCreate: true,
    canEditDraft: true,
    canSubmit: true,
    canApprove: true,
    canReject: true,
    canFulfill: true,
  },
};

// ==================== ID статусов по умолчанию ====================
// Эти ID соответствуют данным в seed-файле

export const DEFAULT_ORDER_STATUS_IDS: Record<OrderStatusCode, number> = {
  [OrderStatusCode.DRAFT]: 1,
  [OrderStatusCode.SUBMITTED]: 2,
  [OrderStatusCode.APPROVED]: 3,
  [OrderStatusCode.REJECTED]: 4,
  [OrderStatusCode.PARTIALLY_FULFILLED]: 5,
  [OrderStatusCode.FULFILLED]: 6,
};

// ==================== Причины операций склада ====================

export const STOCK_REASON_CODES = {
  ORDER_FULFILLMENT: 'order_fulfillment',
  ORDER_RETURN: 'order_return',
  MANUAL_ADJUSTMENT: 'manual_adjustment',
  DAMAGE: 'damage',
  EXPIRED: 'expired',
  TRANSFER: 'transfer',
} as const;

export const STOCK_REASON_LABELS: Record<string, string> = {
  [STOCK_REASON_CODES.ORDER_FULFILLMENT]: 'Выдача по заказу',
  [STOCK_REASON_CODES.ORDER_RETURN]: 'Возврат по заказу',
  [STOCK_REASON_CODES.MANUAL_ADJUSTMENT]: 'Ручная корректировка',
  [STOCK_REASON_CODES.DAMAGE]: 'Повреждение',
  [STOCK_REASON_CODES.EXPIRED]: 'Истёк срок годности',
  [STOCK_REASON_CODES.TRANSFER]: 'Перемещение',
};
