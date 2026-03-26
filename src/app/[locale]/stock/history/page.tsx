'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Box,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  Grid,
  IconButton,
  Tooltip,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Link from 'next/link';
import { useStockHistory } from '@/lib/hooks/useStock';
import { StockHistoryTable } from '@/components/stock';

export default function StockHistoryPage() {
  const t = useTranslations('stock.history');
  const stockT = useTranslations('stock');

  const [search, setSearch] = useState('');
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 20 });

  const { data, isLoading, isError, mutate } = useStockHistory({
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
  });

  return (
    <Box sx={{ p: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tooltip title={stockT('currentStock')}>
              <IconButton component={Link} href="/stock" color="primary">
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>
            <Typography variant="h4" component="h1">
              {t('title')}
            </Typography>
          </Box>
          <Tooltip title="Обновить">
            <IconButton onClick={() => mutate()} color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Поиск по запчасти, пользователю или причине..."
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
              <Typography variant="body2" color="text.secondary">
                {data?.total || 0} операций
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* History Table */}
      <StockHistoryTable
        rows={data?.items || []}
        loading={isLoading}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        rowCount={data?.total}
      />
    </Box>
  );
}
