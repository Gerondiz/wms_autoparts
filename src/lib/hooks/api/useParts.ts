'use client';

import useSWR from 'swr';
import { useCallback } from 'react';

export interface Part {
  id: number;
  name: string;
  partNumber: string;
  description?: string | null;
  stock: number;
  price: string;
  hierarchyId: number;
  hierarchyName?: string;
  hierarchyPath?: string;
  primaryImage?: string | null;
  images?: PartImage[];
}

export interface PartImage {
  id: number;
  imageUrl: string;
  isPrimary: boolean;
}

export interface PartsListResponse {
  items: Part[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PartsFilters {
  nodeId?: number | null;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const fetcher = async (url: string): Promise<any> => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: { message: 'Ошибка загрузки' } }));
    throw new Error(error.error?.message || 'Ошибка сети');
  }
  const data = await res.json();
  return data.success ? data.data : null;
};

/**
 * Хук для загрузки списка запчастей
 */
export function useParts(filters: PartsFilters = {}) {
  const { nodeId = null, page = 1, limit = 20, sortBy, sortOrder } = filters;

  const params = new URLSearchParams();
  if (nodeId) params.set('nodeId', nodeId.toString());
  params.set('page', page.toString());
  params.set('limit', limit.toString());
  if (sortBy) params.set('sortBy', sortBy);
  if (sortOrder) params.set('sortOrder', sortOrder);

  const { data, error, isLoading, mutate } = useSWR<PartsListResponse>(
    `/api/parts?${params.toString()}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000,
    }
  );

  const setPage = useCallback(
    (newPage: number) => {
      // Перезагружаем данные с новым page
      mutate(undefined, { revalidate: true });
    },
    [mutate]
  );

  return {
    parts: data?.items ?? [],
    pagination: {
      total: data?.total ?? 0,
      page: data?.page ?? 1,
      limit: data?.limit ?? 20,
      totalPages: data?.totalPages ?? 0,
    },
    isLoading,
    isError: error,
    setPage,
    mutate,
  };
}

/**
 * Хук для загрузки детали запчасти
 */
export function usePart(partId: number | null) {
  const { data, error, isLoading, mutate } = useSWR<Part>(
    partId ? `/api/parts/${partId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    part: data ?? null,
    isLoading,
    isError: error,
    mutate,
  };
}
