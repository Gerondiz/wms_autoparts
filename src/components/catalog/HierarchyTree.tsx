'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  ButtonGroup,
  alpha,
} from '@mui/material';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import {
  ChevronRight,
  UnfoldMore as ExpandAllIcon,
  UnfoldLess as CollapseAllIcon,
  Category as CategoryIcon,
  LocalOffer as PartsIcon,
} from '@mui/icons-material';
import {
  useHierarchyChildren,
  HierarchyNode,
} from '@/lib/hooks/api/useHierarchy';
import { useHierarchy } from '@/contexts/HierarchyContext';

interface TreeItemLabelProps {
  label: string;
  partsCount?: number;
  isLoading?: boolean;
}

function TreeItemLabel({ label, partsCount, isLoading }: TreeItemLabelProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        pr: 1,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
        <CategoryIcon fontSize="small" sx={{ color: 'text.secondary' }} />
        <Typography
          variant="body2"
          sx={{
            fontWeight: 400,
            color: 'text.primary',
          }}
        >
          {label}
        </Typography>
        {isLoading && <CircularProgress size={14} sx={{ ml: 1 }} />}
      </Box>
      {partsCount !== undefined && partsCount > 0 && (
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
          {partsCount}
        </Box>
      )}
    </Box>
  );
}

interface SimpleTreeItemProps {
  itemId: string;
  label: string;
  partsCount?: number;
  isLoading?: boolean;
  children?: React.ReactNode;
}

function SimpleTreeItem({ itemId, label, partsCount, isLoading, children }: SimpleTreeItemProps) {
  return (
    <TreeItem
      itemId={itemId}
      label={<TreeItemLabel label={label} partsCount={partsCount} isLoading={isLoading} />}
    >
      {children}
    </TreeItem>
  );
}

interface HierarchyTreeProps {
  selectedNodeId: number | null;
  onNodeSelect: (nodeId: number | null) => void;
}

export default function HierarchyTree({
  selectedNodeId,
  onNodeSelect,
}: HierarchyTreeProps) {
  const t = useTranslations('catalog');

  const { nodes: rootNodes, isLoading: isLoadingRoot } =
    useHierarchyChildren(null);

  const { expandedNodeIds, setExpandedNodeIds } = useHierarchy();
  const [allNodeIds, setAllNodeIds] = useState<string[]>([]);

  useEffect(() => {
    const ids = rootNodes.map((n) => n.id.toString());
    setAllNodeIds(ids);
  }, [rootNodes]);

  const handleExpansionChange = useCallback((
    event: React.SyntheticEvent | null,
    nodeIds: string[]
  ) => {
    if (event) {
      setExpandedNodeIds(nodeIds);
    }
  }, [setExpandedNodeIds]);

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

  const handleExpandAll = () => {
    setExpandedNodeIds(allNodeIds);
  };

  const handleCollapseAll = () => {
    setExpandedNodeIds([]);
  };

  // Оптимизированная версия с ленивой загрузкой
  const LazyTreeItem = ({ node }: { node: HierarchyNode }) => {
    const { nodes: childNodes, isLoading } = useHierarchyChildren(
      expandedNodeIds.includes(node.id.toString()) ? node.id : null
    );

    const hasChildren = node.childrenCount > 0;

    return (
      <SimpleTreeItem
        itemId={node.id.toString()}
        label={node.name}
        partsCount={node.partsCount}
        isLoading={isLoading}
      >
        {hasChildren &&
          expandedNodeIds.includes(node.id.toString()) &&
          childNodes.map((childNode) => (
            <LazyTreeItem key={childNode.id} node={childNode} />
          ))}
      </SimpleTreeItem>
    );
  };

  if (isLoadingRoot) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 200,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (rootNodes.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {t('hierarchyEmpty') || 'Иерархия пуста'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Кнопки управления */}
      <Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider' }}>
        <ButtonGroup size="small" fullWidth variant="outlined">
          <Button
            startIcon={<ExpandAllIcon />}
            onClick={handleExpandAll}
            sx={{ fontSize: '0.75rem' }}
          >
            {t('expandAll') || 'Развернуть всё'}
          </Button>
          <Button
            startIcon={<CollapseAllIcon />}
            onClick={handleCollapseAll}
            sx={{ fontSize: '0.75rem' }}
          >
            {t('collapseAll') || 'Свернуть всё'}
          </Button>
        </ButtonGroup>
      </Box>

      {/* Дерево */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
        <SimpleTreeView
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
          {rootNodes.map((node) => (
            <LazyTreeItem key={node.id} node={node} />
          ))}
        </SimpleTreeView>
      </Box>
    </Box>
  );
}
