'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  Box,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  Button,
  Grid,
  IconButton,
  Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import HistoryIcon from '@mui/icons-material/History';
import Link from 'next/link';
import { useStock } from '@/lib/hooks/useStock';
import { StockTable, StockAdjustmentDialog, PartInfoDialog } from '@/components/stock';
import { StockItem } from '@/lib/api/stockClient';

export default function StockPage() {
  const t = useTranslations('stock');
  const stockT = useTranslations('stock.stockTable');

  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 20 });
  const [adjustmentDialogOpen, setAdjustmentDialogOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState<StockItem | null>(null);
  const [partInfoOpen, setPartInfoOpen] = useState(false);

  const { data, isLoading, isError, mutate } = useStock({
    search: search || undefined,
    lowStock: lowStockOnly || undefined,
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
  });

  const handlePartClick = (part: StockItem) => {
    setSelectedPart(part);
    setPartInfoOpen(true);
  };

  const handleAdjustmentClick = () => {
    setAdjustmentDialogOpen(true);
  };

  return (
    <Box sx={{ p: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1">
            {t('stockTable.title')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title={t('adjustment.increase')}>
              <IconButton
                color="success"
                onClick={handleAdjustmentClick}
                sx={{ bgcolor: 'success.light', color: 'white', '&:hover': { bgcolor: 'success.main' } }}
              >
                <AddIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('adjustment.decrease')}>
              <IconButton
                color="error"
                onClick={handleAdjustmentClick}
                sx={{ bgcolor: 'error.light', color: 'white', '&:hover': { bgcolor: 'error.main' } }}
              >
                <RemoveIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('history.title')}>
              <IconButton
                component={Link}
                href="/stock/history"
                color="info"
                sx={{ bgcolor: 'info.light', color: 'white', '&:hover': { bgcolor: 'info.main' } }}
              >
                <HistoryIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Обновить">
              <IconButton onClick={() => mutate()} color="primary">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid xs={12} md={6}>
              <TextField
                fullWidth
                placeholder={stockT('searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid xs={12} md={4}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={lowStockOnly}
                    onChange={(e) => setLowStockOnly(e.target.checked)}
                    color="warning"
                  />
                }
                label={stockT('showLowStock')}
              />
            </Grid>
            <Grid xs={12} md={2}>
              <Typography variant="body2" color="text.secondary">
                {data?.total || 0} запчастей
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Stock Table */}
      <StockTable
        rows={data?.items || []}
        loading={isLoading}
        onPartClick={handlePartClick}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        rowCount={data?.total}
      />

      {/* Adjustment Dialog */}
      <StockAdjustmentDialog
        open={adjustmentDialogOpen}
        onClose={() => setAdjustmentDialogOpen(false)}
        onSuccess={() => {
          mutate();
          setAdjustmentDialogOpen(false);
        }}
      />

      {/* Part Info Dialog */}
      <PartInfoDialog
        part={selectedPart}
        open={partInfoOpen}
        onClose={() => {
          setPartInfoOpen(false);
          setSelectedPart(null);
        }}
      />
    </Box>
  );
}
