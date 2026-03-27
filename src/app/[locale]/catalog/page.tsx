'use client';

import { useTranslations } from 'next-intl';
import { useState, useCallback, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { useHierarchyChildren, useHierarchyPath, useHierarchyNode } from '@/lib/hooks/api/useHierarchy';
import { useParts } from '@/lib/hooks/api/useParts';
import HierarchyTree from '@/components/catalog/HierarchyTree';
import Breadcrumbs from '@/components/catalog/Breadcrumbs';
import SearchBar from '@/components/catalog/SearchBar';
import PartsList from '@/components/catalog/PartsList';
import AddToCartDialog from '@/components/cart/AddToCartDialog';

export default function CatalogPage() {
  const t = useTranslations('catalog');
  
  // Локальное состояние для выбранного узла
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);
  const [addToCartDialogOpen, setAddToCartDialogOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState<any>(null);

  // Загрузка данных
  const { nodes: rootNodes } = useHierarchyChildren(null);
  const pathData = useHierarchyPath(selectedNodeId);
  const nodeData = useHierarchyNode(selectedNodeId);
  const { parts, pagination, isLoading: partsLoading, setPage } = useParts({
    nodeId: selectedNodeId || undefined,
  });

  const breadcrumbs = pathData?.path || [];
  const currentNodeName = nodeData?.node?.name || t('allCategories');

  // Обработчики
  const handleNodeSelect = useCallback((nodeId: number | null) => {
    setSelectedNodeId(nodeId);
  }, []);

  const handleAddToCart = useCallback((part: any) => {
    setSelectedPart(part);
    setAddToCartDialogOpen(true);
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 64px)' }}>
      {/* Верхняя панель: хлебные крошки и поиск */}
      <Box sx={{ mb: 3, px: 2 }}>
        {breadcrumbs.length > 0 && (
          <Breadcrumbs path={breadcrumbs} currentLocale="ru" />
        )}
        <Typography variant="h5" fontWeight="600" gutterBottom>
          {currentNodeName}
        </Typography>
        <SearchBar />
      </Box>

      {/* Основная область: дерево слева, запчасти справа */}
      <Box sx={{ display: 'flex', flex: 1, gap: 2, px: 2 }}>
        {/* Левая панель - дерево категорий */}
        <Box sx={{ width: 280, flexShrink: 0, borderRight: 1, borderColor: 'divider', pr: 2 }}>
          <Typography variant="subtitle2" fontWeight="600" gutterBottom>
            {t('categories')}
          </Typography>
          <HierarchyTree
            rootNodes={rootNodes || []}
            selectedNodeId={selectedNodeId}
            onNodeSelect={handleNodeSelect}
          />
        </Box>

        {/* Центральная область - список запчастей */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <PartsList
            parts={parts || []}
            total={pagination?.total || 0}
            page={pagination?.page || 0}
            limit={pagination?.limit || 20}
            isLoading={partsLoading}
            onPageChange={setPage}
          />
        </Box>
      </Box>

      {/* Диалог добавления в корзину */}
      <AddToCartDialog
        open={addToCartDialogOpen}
        onClose={() => setAddToCartDialogOpen(false)}
        part={selectedPart}
        onConfirm={() => setAddToCartDialogOpen(false)}
      />
    </Box>
  );
}
