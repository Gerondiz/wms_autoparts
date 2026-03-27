'use client';

import { useTranslations } from 'next-intl';
import { Box, Typography } from '@mui/material';
import Breadcrumbs from '@/components/catalog/Breadcrumbs';
import SearchBar from '@/components/catalog/SearchBar';
import PartsList from '@/components/catalog/PartsList';
import AddToCartDialog from '@/components/cart/AddToCartDialog';
import { useHierarchyPath, useHierarchyNode } from '@/lib/hooks/api/useHierarchy';
import { useParts } from '@/lib/hooks/api/useParts';
import { useState, useCallback } from 'react';
import { useHierarchy } from '@/contexts/HierarchyContext';

export default function CatalogPage() {
  const t = useTranslations('catalog');
  const { selectedNodeId } = useHierarchy();
  const [addToCartDialogOpen, setAddToCartDialogOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState<any>(null);

  const pathData = useHierarchyPath(selectedNodeId);
  const nodeData = useHierarchyNode(selectedNodeId);
  const { parts, pagination, isLoading: partsLoading, setPage } = useParts({
    nodeId: selectedNodeId || undefined,
  });

  const breadcrumbs = pathData?.path || [];

  const handleAddToCart = useCallback((part: any) => {
    setSelectedPart(part);
    setAddToCartDialogOpen(true);
  }, []);

  const currentNodeName = nodeData?.node?.name || t('allCategories') || 'Все категории';

  return (
    <Box>
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
