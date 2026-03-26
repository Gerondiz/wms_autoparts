'use client';

import { useMemo, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import {
  Box,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  alpha,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
  GridSortModel,
  GridRenderCellParams,
} from '@mui/x-data-grid';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { OrderWithDetails, OrderPriority, OrderStatusCode } from '@/lib/types/orders';
import { ORDER_STATUS_CONFIG, PRIORITY_CONFIG } from '@/lib/constants/orders';
import OrderStatusChip from './OrderStatusChip';
import { useRouter } from '@/i18n/routing';
import { useLocale } from 'next-intl';

interface OrdersListProps {
  orders: OrderWithDetails[];
  total: number;
  page: number;
  limit: number;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  onFilterChange: (filters: OrderFiltersState) => void;
  userRole?: string | null;
}

interface OrderFiltersState {
  statusIds?: number[];
  priorities?: OrderPriority[];
  search?: string;
}

export default function OrdersList({
  orders,
  total,
  page,
  limit,
  isLoading = false,
  onPageChange,
  onLimitChange,
  onSortChange,
  onFilterChange,
  userRole,
}: OrdersListProps) {
  const t = useTranslations('orders');
  const tCommon = useTranslations('common');
  const tPriority = useTranslations('priority');
  const router = useRouter();
  const locale = useLocale();

  const [filters, setFilters] = useState<OrderFiltersState>({});

  // Колонки таблицы
  const columns = useMemo<GridColDef[]>(() => [
    {
      field: 'id',
      headerName: 'ID',
      width: 80,
      sortable: true,
      headerAlign: 'left',
      align: 'left',
    },
    {
      field: 'mechanicName',
      headerName: t('mechanic') || 'Механик',
      width: 200,
      sortable: true,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ fontWeight: 500 }}>{params.value || '—'}</Box>
      ),
    },
    {
      field: 'statusName',
      headerName: t('status') || 'Статус',
      width: 180,
      sortable: true,
      renderCell: (params: GridRenderCellParams) => {
        const statusCode = params.row.statusName as keyof typeof ORDER_STATUS_CONFIG;
        return (
          <OrderStatusChip
            statusCode={statusCode}
            size="small"
            sx={{ minWidth: 120 }}
          />
        );
      },
    },
    {
      field: 'priority',
      headerName: t('priority') || 'Приоритет',
      width: 130,
      sortable: true,
      renderCell: (params: GridRenderCellParams) => {
        const priority = params.value as OrderPriority | null;
        if (!priority) return '—';
        const config = PRIORITY_CONFIG[priority];
        return (
          <Chip
            label={config.label}
            color={config.color as any}
            size="small"
            sx={{ fontWeight: 600 }}
          />
        );
      },
    },
    {
      field: 'itemsCount',
      headerName: t('items') || 'Позиции',
      width: 100,
      sortable: true,
      headerAlign: 'left',
      align: 'left',
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
          {params.value || 0} {t('pcs') || 'шт.'}
        </Box>
      ),
    },
    {
      field: 'createdAt',
      headerName: t('createdAt') || 'Дата создания',
      width: 180,
      sortable: true,
      renderCell: (params: GridRenderCellParams) => {
        const date = params.value as Date | null;
        if (!date) return '—';
        return (
          <Box sx={{ fontSize: '0.875rem' }}>
            {new Date(date).toLocaleDateString(locale, {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })}
          </Box>
        );
      },
    },
    {
      field: 'actions',
      headerName: tCommon('actions') || 'Действия',
      width: 120,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <IconButton
          size="small"
          onClick={() => router.push(`/${locale}/orders/${params.row.id}`)}
          color="primary"
        >
          {t('view') || 'Просмотр'}
        </IconButton>
      ),
    },
  ], [t, tCommon, locale, router]);

  // Обработчики
  const handlePaginationModelChange = useCallback((model: GridPaginationModel) => {
    onPageChange(model.page + 1);
    onLimitChange(model.pageSize);
  }, [onPageChange, onLimitChange]);

  const handleSortModelChange = useCallback((model: GridSortModel) => {
    if (model.length > 0) {
      const sort = model[0];
      onSortChange(sort.field, sort.sort as 'asc' | 'desc');
    }
  }, [onSortChange]);

  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const search = event.target.value;
    setFilters(prev => ({ ...prev, search }));
    onFilterChange({ ...filters, search });
  }, [filters, onFilterChange]);

  const handleClearFilters = useCallback(() => {
    setFilters({});
    onFilterChange({});
  }, [onFilterChange]);

  const hasFilters = filters.statusIds?.length || filters.priorities?.length || filters.search;

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        border: 1,
        borderColor: 'divider',
      }}
    >
      {/* Фильтры */}
      <Box
        sx={{
          p: 3,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: alpha('#1976d2', 0.02),
        }}
      >
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Поиск */}
          <TextField
            placeholder={t('search') || 'Поиск...'}
            value={filters.search || ''}
            onChange={handleSearchChange}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
              endAdornment: filters.search && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => {
                      setFilters(prev => ({ ...prev, search: '' }));
                      onFilterChange({ ...filters, search: '' });
                    }}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 240 }}
          />

          {/* Фильтр по статусам */}
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>{t('status')}</InputLabel>
            <Select
              multiple
              value={filters.statusIds?.map(String) || []}
              onChange={(event) => {
                const values = event.target.value as string[];
                const statusIds = values.map(v => parseInt(v, 10));
                setFilters(prev => ({ ...prev, statusIds }));
                onFilterChange({ ...filters, statusIds });
              }}
              input={<OutlinedInput label={t('status')} />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {selected.map((statusStr) => {
                    const statusId = parseInt(statusStr, 10);
                    return (
                      <Chip
                        key={statusId}
                        label={t(`status.${statusId}`)}
                        size="small"
                        sx={{ minWidth: 'fit-content' }}
                      />
                    );
                  })}
                </Box>
              )}
            >
              {Object.entries(ORDER_STATUS_CONFIG).map(([code, config]) => (
                <MenuItem key={code} value={code}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <OrderStatusChip statusCode={code as OrderStatusCode} size="small" />
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Фильтр по приоритетам */}
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>{t('priority')}</InputLabel>
            <Select
              multiple
              value={filters.priorities?.map(String) || []}
              onChange={(event) => {
                const values = event.target.value as string[];
                const priorities = values.map(v => parseInt(v, 10) as OrderPriority);
                setFilters(prev => ({ ...prev, priorities }));
                onFilterChange({ ...filters, priorities });
              }}
              input={<OutlinedInput label={t('priority')} />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {selected.map((priorityStr) => {
                    const priority = parseInt(priorityStr, 10) as OrderPriority;
                    const config = PRIORITY_CONFIG[priority];
                    return (
                      <Chip
                        key={priority}
                        label={config.label}
                        size="small"
                        color={config.color as any}
                      />
                    );
                  })}
                </Box>
              )}
            >
              {Object.values(OrderPriority).filter(v => typeof v === 'number').map((priority) => {
                const config = PRIORITY_CONFIG[priority as OrderPriority];
                return (
                  <MenuItem key={priority} value={String(priority)}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={config.label}
                        size="small"
                        color={config.color as any}
                      />
                    </Box>
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>

          {/* Кнопка очистки фильтров */}
          {hasFilters && (
            <IconButton onClick={handleClearFilters} size="small" color="inherit">
              <FilterIcon />
              <Box sx={{ ml: 0.5, fontSize: '0.75rem' }}>{tCommon('clear') || 'Сбросить'}</Box>
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Таблица */}
      <DataGrid
        rows={orders.map((order) => ({
          ...order,
          id: order.id,
        }))}
        columns={columns}
        rowCount={total}
        paginationMode="server"
        paginationModel={{ page: page - 1, pageSize: limit }}
        sortingMode="server"
        sortModel={[]}
        loading={isLoading}
        onPaginationModelChange={handlePaginationModelChange}
        onSortModelChange={handleSortModelChange}
        disableRowSelectionOnClick
        disableColumnFilter
        disableDensitySelector
        rowHeight={64}
        columnHeaderHeight={56}
        sx={{
          border: 'none',
          '& .MuiDataGrid-columnHeaders': {
            bgcolor: alpha('#1976d2', 0.04),
            borderBottom: 1,
            borderColor: 'divider',
          },
          '& .MuiDataGrid-columnHeader': {
            fontWeight: 600,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          },
          '& .MuiDataGrid-row': {
            borderBottom: 1,
            borderColor: 'divider',
            '&:hover': {
              bgcolor: alpha('#1976d2', 0.04),
            },
          },
          '& .MuiDataGrid-virtualScroller': {
            maxHeight: 'calc(100vh - 400px)',
          },
        }}
        localeText={{
          noRowsLabel: t('noOrders') || 'Заказы не найдены',
        }}
      />
    </Paper>
  );
}
