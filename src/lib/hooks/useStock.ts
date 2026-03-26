'use client';

import useSWR from 'swr';
import { getStock, getStockHistory, searchParts, StockItem, StockHistoryItem, StockResponse, StockHistoryResponse } from '@/lib/api/stockClient';

/**
 * Хук для получения текущих остатков
 */
export function useStock(filters?: {
  search?: string;
  lowStock?: boolean;
  nodeId?: number;
  page?: number;
  limit?: number;
}) {
  const searchParams = new URLSearchParams();
  if (filters?.search) searchParams.set('search', filters.search);
  if (filters?.lowStock) searchParams.set('lowStock', 'true');
  if (filters?.nodeId) searchParams.set('nodeId', filters.nodeId.toString());
  if (filters?.page) searchParams.set('page', filters.page.toString());
  if (filters?.limit) searchParams.set('limit', filters.limit.toString());

  const key = `/api/stock?${searchParams.toString()}`;

  const { data, error, isLoading, mutate } = useSWR<StockResponse>(key, () => getStock(filters));

  return {
    data,
    isLoading,
    isError: error,
    mutate,
  };
}

/**
 * Хук для получения истории операций
 */
export function useStockHistory(filters?: {
  partId?: number;
  userId?: number;
  orderId?: number;
  reason?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}) {
  const searchParams = new URLSearchParams();
  if (filters?.partId) searchParams.set('partId', filters.partId.toString());
  if (filters?.userId) searchParams.set('userId', filters.userId.toString());
  if (filters?.orderId) searchParams.set('orderId', filters.orderId.toString());
  if (filters?.reason) searchParams.set('reason', filters.reason);
  if (filters?.fromDate) searchParams.set('fromDate', filters.fromDate);
  if (filters?.toDate) searchParams.set('toDate', filters.toDate);
  if (filters?.page) searchParams.set('page', filters.page.toString());
  if (filters?.limit) searchParams.set('limit', filters.limit.toString());

  const key = `/api/stock/history?${searchParams.toString()}`;

  const { data, error, isLoading, mutate } = useSWR<StockHistoryResponse>(key, () => getStockHistory(filters));

  return {
    data,
    isLoading,
    isError: error,
    mutate,
  };
}

/**
 * Хук для поиска запчастей
 */
export function usePartSearch(query: string) {
  const { data, error, isLoading } = useSWR<StockItem[]>(
    query.length >= 2 ? `/api/parts/search?q=${query}` : null,
    () => searchParts(query)
  );

  return {
    data,
    isLoading,
    isError: error,
  };
}
