'use client';

import useSWR from 'swr';
import { useCallback, useState } from 'react';

export interface HierarchyNode {
  id: number;
  name: string;
  path: string;
  nodeTypeId: number;
  nodeTypeName: string;
  parentId: number | null;
  sortOrder: number;
  childrenCount: number;
  partsCount: number;
  attributes?: Record<string, any>;
}

export interface HierarchyPathItem {
  id: number;
  name: string;
  path: string;
}

interface FetchChildrenResponse {
  items: HierarchyNode[];
  hasMore: boolean;
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
 * Хук для загрузки дочерних узлов иерархии
 */
export function useHierarchyChildren(parentId: number | null = null) {
  const { data, error, isLoading, mutate } = useSWR<FetchChildrenResponse>(
    parentId !== undefined
      ? `/api/hierarchy/children?parentId=${parentId ?? ''}`
      : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  );

  return {
    nodes: data?.items ?? [],
    hasMore: data?.hasMore ?? false,
    isLoading,
    isError: error,
    mutate,
  };
}

/**
 * Хук для получения пути к узлу (хлебные крошки)
 */
export function useHierarchyPath(nodeId: number | null) {
  const { data, error, isLoading, mutate } = useSWR<HierarchyPathItem[]>(
    nodeId ? `/api/hierarchy/path/${nodeId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    path: data ?? [],
    isLoading,
    isError: error,
    mutate,
  };
}

/**
 * Хук для получения деталей узла
 */
export function useHierarchyNode(nodeId: number | null) {
  const { data, error, isLoading, mutate } = useSWR<HierarchyNode>(
    nodeId ? `/api/hierarchy/${nodeId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    node: data ?? null,
    isLoading,
    isError: error,
    mutate,
  };
}

/**
 * Хук для управления состоянием раскрытых узлов дерева
 */
export function useTreeState() {
  const [expandedNodeIds, setExpandedNodeIds] = useState<string[]>([]);
  const [loadedNodeIds, setLoadedNodeIds] = useState<Set<number>>(new Set());

  const handleToggle = useCallback((event: React.SyntheticEvent, nodeIds: string[]) => {
    setExpandedNodeIds(nodeIds);
  }, []);

  const handleNodeLoad = useCallback((nodeId: number) => {
    setLoadedNodeIds((prev) => new Set(prev).add(nodeId));
  }, []);

  const isNodeLoaded = useCallback(
    (nodeId: number) => loadedNodeIds.has(nodeId),
    [loadedNodeIds]
  );

  const expandAll = useCallback((nodeIds: string[]) => {
    setExpandedNodeIds(nodeIds);
  }, []);

  const collapseAll = useCallback(() => {
    setExpandedNodeIds([]);
  }, []);

  return {
    expandedNodeIds,
    loadedNodeIds: Array.from(loadedNodeIds),
    handleToggle,
    handleNodeLoad,
    isNodeLoaded,
    expandAll,
    collapseAll,
  };
}
