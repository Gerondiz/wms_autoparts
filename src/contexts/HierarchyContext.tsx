'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useMemo } from 'react';

interface HierarchyContextType {
  selectedNodeId: number | null;
  setSelectedNodeId: (nodeId: number | null) => void;
  expandedNodeIds: string[];
  setExpandedNodeIds: (nodeIds: string[]) => void;
}

const HierarchyContext = createContext<HierarchyContextType | undefined>(undefined);

interface HierarchyProviderProps {
  children: ReactNode;
}

export function HierarchyProvider({ children }: HierarchyProviderProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);
  const [expandedNodeIds, setExpandedNodeIds] = useState<string[]>([]);

  const handleSetSelectedNodeId = useCallback((nodeId: number | null) => {
    setSelectedNodeId(nodeId);
  }, []);

  const handleSetExpandedNodeIds = useCallback((nodeIds: string[]) => {
    setExpandedNodeIds(nodeIds);
  }, []);

  const value = useMemo(
    () => ({
      selectedNodeId,
      setSelectedNodeId: handleSetSelectedNodeId,
      expandedNodeIds,
      setExpandedNodeIds: handleSetExpandedNodeIds,
    }),
    [selectedNodeId, expandedNodeIds, handleSetSelectedNodeId, handleSetExpandedNodeIds]
  );

  return (
    <HierarchyContext.Provider value={value}>
      {children}
    </HierarchyContext.Provider>
  );
}

export function useHierarchy() {
  const context = useContext(HierarchyContext);
  if (context === undefined) {
    throw new Error('useHierarchy must be used within a HierarchyProvider');
  }
  return context;
}
