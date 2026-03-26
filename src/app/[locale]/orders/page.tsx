'use client';

import { useState, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  Box,
  Typography,
  Button,
  Paper,
  alpha,
  Fab,
  Tooltip,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { OrdersList as OrdersListComponent } from '@/components/orders';
import { OrderWithDetails, OrderPriority } from '@/lib/types/orders';
import { getOrders } from '@/lib/services/orders.api';
import { useSession } from 'next-auth/react';
import { useRouter } from '@/i18n/routing';
import { useLocale } from 'next-intl';

interface OrderFiltersState {
  statusIds?: number[];
  priorities?: OrderPriority[];
  search?: string;
}

export default function OrdersPage() {
  const t = useTranslations('orders');
  const tCommon = useTranslations('common');
  const { data: session } = useSession();
  const router = useRouter();
  const locale = useLocale();

  // Состояние
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState<OrderFiltersState>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка заказов
  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Определяем фильтр по роли
      let roleFilter: 'own' | 'all' | 'for_approval' | 'for_fulfillment' | undefined;
      const roleName = session?.user?.roleName;

      if (roleName === 'mechanic') {
        roleFilter = 'own';
      } else if (roleName === 'repair_manager') {
        roleFilter = 'all';
      } else if (roleName === 'storekeeper') {
        roleFilter = 'for_fulfillment';
      }

      const response = await getOrders({
        page,
        limit,
        sortBy,
        sortOrder,
        roleFilter,
        ...filters,
      });

      setOrders(response.items);
      setTotal(response.total);
    } catch (err: any) {
      setError(err.message || t('error') || 'Ошибка загрузки');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, sortBy, sortOrder, filters, session, t]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Обработчики
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleLimitChange = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  }, []);

  const handleSortChange = useCallback((newSortBy: string, newSortOrder: 'asc' | 'desc') => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  }, []);

  const handleFilterChange = useCallback((newFilters: OrderFiltersState) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  const handleRefresh = useCallback(() => {
    loadOrders();
  }, [loadOrders]);

  const handleCreateOrder = useCallback(() => {
    router.push(`/${locale}/orders/new`);
  }, [router, locale]);

  const userRole = session?.user?.roleName;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Заголовок */}
      <Box
        sx={{
          p: 4,
          pb: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            {t('title')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('total')}: {total} {t('orders') || 'заказов'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Tooltip title={tCommon('refresh') || 'Обновить'}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={isLoading}
            >
              {tCommon('refresh') || 'Обновить'}
            </Button>
          </Tooltip>

          {(session?.user?.permissions?.includes('order_create') ||
            userRole === 'mechanic' ||
            userRole === 'admin') && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateOrder}
              color="primary"
            >
              {t('newOrder')}
            </Button>
          )}
        </Box>
      </Box>

      {/* Контент */}
      <Box sx={{ p: 4, pt: 0 }}>
        <OrdersListComponent
          orders={orders}
          total={total}
          page={page}
          limit={limit}
          isLoading={isLoading}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          onSortChange={handleSortChange}
          onFilterChange={handleFilterChange}
          userRole={userRole}
        />
      </Box>

      {/* Сообщение об ошибке */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setError(null)}
          severity="error"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}
