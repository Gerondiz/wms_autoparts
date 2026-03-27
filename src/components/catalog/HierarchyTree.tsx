'use client';

import { useTranslations } from 'next-intl';
import { useState, useCallback } from 'react';
import { Box, Typography, CircularProgress, alpha } from '@mui/material';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { ChevronRight, Category as CategoryIcon, LocalOffer as PartsIcon } from '@mui/icons-material';
import { HierarchyNode } from '@/lib/hooks/api/useHierarchy';

interface HierarchyTreeProps {
  rootNodes: HierarchyNode[];
  selectedNodeId: number | null;
  onNodeSelect: (nodeId: number | null) => void;
}

export default function HierarchyTree({ rootNodes, selectedNodeId, onNodeSelect }: HierarchyTreeProps) {
  const t = useTranslations('catalog');
  const [expandedNodeIds, setExpandedNodeIds] = useState<string[]>([]);

  const handleExpansionChange = useCallback((
    event: React.SyntheticEvent | null,
    nodeIds: string[]
  ) => {
    if (event) {
      setExpandedNodeIds(nodeIds);
    }
  }, []);

  const handleSelectionChange = useCallback((
    event: React.SyntheticEvent | null,
    nodeId: string | null
  ) => {
    if (!event) return;
    if (nodeId === null) {
      onNodeSelect(null);
      return;
    }
    const id = parseInt(nodeId, 10);
    onNodeSelect(id);
  }, [onNodeSelect]);

  // Рекурсивный рендеринг узлов дерева
  const renderTreeItems = (nodes: HierarchyNode[]) => {
    return nodes.map((node) => (
      <TreeItem
        key={node.id}
        itemId={node.id.toString()}
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pr: 1 }}>
            <CategoryIcon fontSize="small" sx={{ color: 'text.secondary' }} />
            <Typography variant="body2" sx={{ flex: 1 }}>
              {node.name}
            </Typography>
            {node.partsCount > 0 && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                  color: 'primary.main',
                  borderRadius: 10,
                  px: 1,
                  py: 0.2,
                  fontSize: '0.7rem',
                  fontWeight: 600,
                }}
              >
                <PartsIcon fontSize="inherit" sx={{ fontSize: '0.8rem' }} />
                {node.partsCount}
              </Box>
            )}
          </Box>
        }
      />
    ));
  };

  if (!rootNodes || rootNodes.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <Box sx={{ height: 'calc(100vh - 300px)', overflow: 'auto' }}>
      <SimpleTreeView
        data-testid="category-tree"
        expandedItems={expandedNodeIds}
        selectedItems={selectedNodeId?.toString() ?? null}
        onExpandedItemsChange={handleExpansionChange}
        onSelectedItemsChange={handleSelectionChange}
        slots={{
          collapseIcon: ChevronRight,
          expandIcon: ChevronRight,
        }}
        sx={{
          '& .MuiTreeItem-content': {
            mb: 0.5,
            borderRadius: 6,
            py: 0.75,
          },
          '& .MuiTreeItem-content:hover': {
            bgcolor: 'action.hover',
          },
          '& .Mui-selected': {
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.2),
            '&:hover': {
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.3),
            },
            '& .MuiTypography-root': {
              fontWeight: 600,
              color: 'primary.main',
            },
          },
        }}
      >
        {renderTreeItems(rootNodes)}
      </SimpleTreeView>
    </Box>
  );
}
