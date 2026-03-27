'use client';

import { useTranslations } from 'next-intl';
import { useState, useCallback } from 'react';
import { Box, Typography, Drawer } from '@mui/material';
import HierarchyTree from '@/components/catalog/HierarchyTree';
import Breadcrumbs from '@/components/catalog/Breadcrumbs';
import SearchBar from '@/components/catalog/SearchBar';
import PartsList from '@/components/catalog/PartsList';
import AddToCartDialog from '@/components/cart/AddToCartDialog';
import { useHierarchyPath, useHierarchyNode } from '@/lib/hooks/api/useHierarchy';
import { useParts } from '@/lib/hooks/api/useParts';

const DRAWER_WIDTH = 320;

export default function CatalogPage() {
  const t = useTranslations('catalog');
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);
  const [addToCartDialogOpen, setAddToCartDialogOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState<any>(null);

  const pathData = useHierarchyPath(selectedNodeId);
  const nodeData = useHierarchyNode(selectedNodeId);
  const { parts, pagination, isLoading: partsLoading, setPage } = useParts({
    nodeId: selectedNodeId || undefined,
  });

  const breadcrumbs = pathData?.path || [];

  const handleNodeSelect = useCallback((nodeId: number | null) => {
    setSelectedNodeId(nodeId);
  }, []);

  const currentNodeName = nodeData?.node?.name || t('allCategories');

  return (
    <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
      {/* Левая панель - Дерево категорий (только десктоп) */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            borderRight: 1,
            borderColor: 'divider',
            bgcolor: 'background.default',
          },
        }}
      >
        <HierarchyTree
          selectedNodeId={selectedNodeId}
          onNodeSelect={handleNodeSelect}
        />
      </Drawer>

      {/* Центральная область */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          p: 3,
        }}
      >
        {/* Breadcrumbs and Search */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" fontWeight="600" gutterBottom>
            {currentNodeName}
          </Typography>
          {breadcrumbs.length > 0 && (
            <Breadcrumbs path={breadcrumbs} currentLocale="ru" />
          )}
          <SearchBar />
        </Box>

        {/* Parts List */}
        <PartsList
          parts={parts || []}
          total={pagination?.total || 0}
          page={pagination?.page || 0}
          limit={pagination?.limit || 20}
          isLoading={partsLoading}
          onPageChange={setPage}
        />
      </Box>

      {/* Add to Cart Dialog */}
      <AddToCartDialog
        open={addToCartDialogOpen}
        onClose={() => setAddToCartDialogOpen(false)}
        part={selectedPart}
        onConfirm={() => setAddToCartDialogOpen(false)}
      />
    </Box>
  );
}
