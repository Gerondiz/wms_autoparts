/**
 * Stock API Client
 * Клиент для работы с API склада
 */

const API_BASE = '/api/stock';

export interface StockItem {
  id: number;
  name: string;
  partNumber: string;
  stock: number;
  minStockLevel: number;
  location: string | null;
  price: string | null;
  hierarchyId: number | null;
  hierarchyName: string | null;
  isLowStock: boolean;
}

export interface StockHistoryItem {
  id: number;
  partId: number;
  partName: string;
  partNumber: string;
  userId: number | null;
  userName: string | null;
  quantityChange: number;
  reason: string;
  orderId: number | null;
  notes: string | null;
  createdAt: string;
}

export interface StockResponse {
  items: StockItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StockHistoryResponse {
  items: StockHistoryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StockReceiptRequest {
  partId: number;
  quantity: number;
  reason: string;
  notes?: string;
}

export interface StockWriteOffRequest {
  partId: number;
  quantity: number;
  reason: string;
  notes?: string;
}

export interface StockAdjustmentRequest {
  partId: number;
  quantity: number;
  reason: string;
  notes?: string;
  adjustmentType: 'increase' | 'decrease' | 'set';
}

export async function getStock(params?: {
  search?: string;
  lowStock?: boolean;
  nodeId?: number;
  page?: number;
  limit?: number;
}): Promise<StockResponse> {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.set('search', params.search);
  if (params?.lowStock) searchParams.set('lowStock', 'true');
  if (params?.nodeId) searchParams.set('nodeId', params.nodeId.toString());
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());

  const response = await fetch(`${API_BASE}?${searchParams.toString()}`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Ошибка при загрузке остатков' }));
    throw new Error(error.message || 'Ошибка при загрузке остатков');
  }
  const data = await response.json();
  return data.data;
}

export async function getStockHistory(params?: {
  partId?: number;
  userId?: number;
  orderId?: number;
  reason?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}): Promise<StockHistoryResponse> {
  const searchParams = new URLSearchParams();
  if (params?.partId) searchParams.set('partId', params.partId.toString());
  if (params?.userId) searchParams.set('userId', params.userId.toString());
  if (params?.orderId) searchParams.set('orderId', params.orderId.toString());
  if (params?.reason) searchParams.set('reason', params.reason);
  if (params?.fromDate) searchParams.set('fromDate', params.fromDate);
  if (params?.toDate) searchParams.set('toDate', params.toDate);
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());

  const response = await fetch(`${API_BASE}/history?${searchParams.toString()}`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Ошибка при загрузке истории' }));
    throw new Error(error.message || 'Ошибка при загрузке истории');
  }
  const data = await response.json();
  return data.data;
}

export async function stockReceipt(data: StockReceiptRequest): Promise<{
  partId: number;
  oldStock: number;
  newStock: number;
  historyId: number;
}> {
  const response = await fetch(`${API_BASE}/receipt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Ошибка при оприходовании' }));
    throw new Error(error.message || 'Ошибка при оприходовании');
  }
  const result = await response.json();
  return result.data;
}

export async function stockWriteOff(data: StockWriteOffRequest): Promise<{
  partId: number;
  oldStock: number;
  newStock: number;
  historyId: number;
}> {
  const response = await fetch(`${API_BASE}/write-off`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Ошибка при списании' }));
    throw new Error(error.message || 'Ошибка при списании');
  }
  const result = await response.json();
  return result.data;
}

export async function searchParts(query: string): Promise<StockItem[]> {
  const searchParams = new URLSearchParams();
  searchParams.set('q', query);
  searchParams.set('limit', '50');

  const response = await fetch(`/api/parts/search?${searchParams.toString()}`);
  if (!response.ok) {
    return [];
  }
  const data = await response.json();
  return data.data.parts || [];
}
