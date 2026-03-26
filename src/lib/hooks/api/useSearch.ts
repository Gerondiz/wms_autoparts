'use client';

import useSWR from 'swr';
import { useCallback, useState, useEffect } from 'react';
import { HierarchyNode } from './useHierarchy';
import { Part } from './useParts';

export interface SearchResult {
  parts: Part[];
  nodes: HierarchyNode[];
}

const fetcher = async (url: string): Promise<any> => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: { message: 'Ошибка поиска' } }));
    throw new Error(error.error?.message || 'Ошибка сети');
  }
  const data = await res.json();
  return data.success ? data.data : null;
};

interface UseSearchOptions {
  debounceMs?: number;
  minQueryLength?: number;
}

/**
 * Хук для поиска запчастей и узлов иерархии
 */
export function useSearch(options: UseSearchOptions = {}) {
  const { debounceMs = 300, minQueryLength = 2 } = options;
  
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce логику
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= minQueryLength) {
        setDebouncedQuery(query);
      } else {
        setDebouncedQuery('');
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs, minQueryLength]);

  const { data, error, isLoading, mutate } = useSWR<SearchResult>(
    debouncedQuery ? `/api/parts?q=${encodeURIComponent(debouncedQuery)}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  const handleQueryChange = useCallback((newQuery: string) => {
    setQuery(newQuery);
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
  }, []);

  return {
    query,
    results: data ?? { parts: [], nodes: [] },
    isLoading,
    isError: error,
    hasResults: !!(data && (data.parts.length > 0 || data.nodes.length > 0)),
    onQueryChange: handleQueryChange,
    clearSearch,
  };
}
