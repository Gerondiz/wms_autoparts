/**
 * Типы для системы управления заказами WMS Autoparts
 */

import { Order, OrderItem, OrderStatus, User, Part } from './models';
import { PaginatedResponse, PaginationParams, SortParams } from '@/lib/api/types';

// ==================== Статусы заказов ====================

export enum OrderStatusCode {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PARTIALLY_FULFILLED = 'partially_fulfilled',
  FULFILLED = 'fulfilled',
}

export interface OrderStatusWithCode extends OrderStatus {
  code: OrderStatusCode;
}

// ==================== Приоритеты заказов ====================

export enum OrderPriority {
  HIGH = 1,
  MEDIUM = 2,
  LOW = 3,
}

export const OrderPriorityLabels: Record<OrderPriority, string> = {
  [OrderPriority.HIGH]: 'Высокий',
  [OrderPriority.MEDIUM]: 'Средний',
  [OrderPriority.LOW]: 'Низкий',
};

export const OrderPriorityColors: Record<OrderPriority, string> = {
  [OrderPriority.HIGH]: 'error',
  [OrderPriority.MEDIUM]: 'warning',
  [OrderPriority.LOW]: 'info',
};

// ==================== Расширенная модель заказа ====================

export interface OrderWithDetails extends Order {
  mechanic?: User & { email?: string };
  repairManager?: User & { email?: string };
  status?: OrderStatusWithCode;
  items?: OrderItemWithPart[];
  history?: OrderHistory[];
}

export interface OrderItemWithPart extends OrderItem {
  part?: Part;
}

// ==================== История изменений заказа ====================

export interface OrderHistory {
  id: number;
  orderId: number;
  userId: number | null;
  action: string;
  fromStatusId: number | null;
  toStatusId: number | null;
  comment: string | null;
  createdAt: Date | null;
  user?: User;
  fromStatus?: OrderStatus;
  toStatus?: OrderStatus;
}

// ==================== Фильтры и параметры запросов ====================

export interface OrderFilters {
  statusId?: number | number[];
  priority?: OrderPriority | OrderPriority[];
  mechanicId?: number;
  repairManagerId?: number;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

export interface OrderQueryParams extends PaginationParams, SortParams, OrderFilters {
  roleFilter?: 'own' | 'all' | 'for_approval' | 'for_fulfillment';
}

// ==================== DTO для создания и обновления заказов ====================

export interface CreateOrderDto {
  mechanicId: number;
  repairManagerId?: number;
  priority?: OrderPriority;
  notes?: string;
  items: CreateOrderItemDto[];
}

export interface CreateOrderItemDto {
  partId: number;
  quantity: number;
}

export interface UpdateOrderDto {
  statusId?: number;
  priority?: OrderPriority;
  notes?: string;
  repairManagerId?: number;
  approvedAt?: Date | null;
  completedAt?: Date | null;
  items?: { id?: number; partId: number; quantity: number }[];
}

export interface UpdateOrderItemDto {
  quantity?: number;
  quantityFulfilled?: number;
  status?: string;
}

export interface AddOrderItemDto {
  orderId: number;
  partId: number;
  quantity: number;
}

export interface RemoveOrderItemDto {
  orderId: number;
  orderItemId: number;
}

// ==================== Действия с заказами ====================

export enum OrderAction {
  SUBMIT = 'submit',
  APPROVE = 'approve',
  REJECT = 'reject',
  FULFILL = 'fulfill',
  EDIT = 'edit',
  CANCEL = 'cancel',
}

export interface SubmitOrderDto {
  orderId: number;
  notes?: string;
}

export interface ApproveOrderDto {
  orderId: number;
  priority: OrderPriority;
  notes?: string;
}

export interface RejectOrderDto {
  orderId: number;
  rejectionReason: string;
}

export interface FulfillOrderDto {
  orderId: number;
  items: FulfillOrderItemDto[];
  notes?: string;
}

export interface FulfillOrderItemDto {
  orderItemId: number;
  quantity: number;
}

// ==================== Статусы позиций заказа ====================

export enum OrderItemStatus {
  PENDING = 'pending',
  PARTIAL = 'partial',
  FULFILLED = 'fulfilled',
  CANCELLED = 'cancelled',
}

// ==================== Права доступа ====================

export interface OrderPermissions {
  canView: boolean;
  canCreate: boolean;
  canEditDraft: boolean;
  canSubmit: boolean;
  canApprove: boolean;
  canReject: boolean;
  canFulfill: boolean;
  canCancel: boolean;
}

// ==================== Сводка по заказу ====================

export interface OrderSummary {
  totalItems: number;
  totalQuantity: number;
  fulfilledQuantity: number;
  pendingQuantity: number;
  fulfillmentPercentage: number;
}

// ==================== API Ответы ====================

export interface OrdersListResponse extends PaginatedResponse<OrderWithDetails> {}

export interface OrderDetailResponse {
  order: OrderWithDetails;
  summary: OrderSummary;
  permissions: OrderPermissions;
}

export interface OrderCreateResponse {
  order: OrderWithDetails;
  success: boolean;
  message?: string;
}

export interface OrderActionResponse {
  success: boolean;
  order?: OrderWithDetails;
  message?: string;
  error?: string;
}
