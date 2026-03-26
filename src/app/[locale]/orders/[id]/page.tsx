'use client';

import { useState, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Skeleton,
  Divider,
  alpha,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { OrderDetail as OrderDetailComponent, OrderActions, FulfillmentDialog, OrderPdfButton } from '@/components/orders';
import { OrderWithDetails, OrderPriority, FulfillOrderItemDto } from '@/lib/types/orders';
import { getOrderById, submitOrder, approveOrder, rejectOrder, fulfillOrder } from '@/lib/services/orders.api';
import { useSession } from 'next-auth/react';
import { useRouter } from '@/i18n/routing';
import { useLocale } from 'next-intl';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';

export default function OrderDetailPage() {
  const t = useTranslations('orders');
  const tCommon = useTranslations('common');
  const { data: session } = useSession();
  const router = useRouter();
  const locale = useLocale();
  const params = useParams();
  const orderId = parseInt(params.id as string, 10);

  // Состояние
  const [order, setOrder] = useState<OrderWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fulfillmentDialogOpen, setFulfillmentDialogOpen] = useState(false);

  // Определение прав доступа
  const permissions = useMemo(() => {
    const roleName = session?.user?.roleName;
    const isMechanic = roleName === 'mechanic';
    const isRepairManager = roleName === 'repair_manager';
    const isStorekeeper = roleName === 'storekeeper';
    const isAdmin = roleName === 'admin';

    const isOwnOrder = String(order?.mechanicId) === session?.user?.id;
    const isDraft = order?.status?.name === 'draft';
    const isSubmitted = order?.status?.name === 'submitted';
    const isApproved = order?.status?.name === 'approved';
    const isPartiallyFulfilled = order?.status?.name === 'partially_fulfilled';

    return {
      canView: isAdmin || isRepairManager || isStorekeeper || isOwnOrder,
      canCreate: isMechanic || isAdmin || isRepairManager,
      canEditDraft: isMechanic && isOwnOrder && isDraft,
      canSubmit: isMechanic && isOwnOrder && isDraft,
      canApprove: isRepairManager && isSubmitted,
      canReject: isRepairManager && isSubmitted,
      canFulfill: isStorekeeper && (isApproved || isPartiallyFulfilled),
      canCancel: isMechanic && isOwnOrder && isDraft,
    };
  }, [order, session]);

  // Загрузка заказа
  const loadOrder = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getOrderById(orderId);
      setOrder(response.order);
    } catch (err: any) {
      setError(err.message || t('error') || 'Ошибка загрузки заказа');
    } finally {
      setIsLoading(false);
    }
  }, [orderId, t]);

  useEffect(() => {
    if (!isNaN(orderId)) {
      loadOrder();
    }
  }, [orderId, loadOrder]);

  // Обработчики действий
  const handleSubmit = useCallback(async () => {
    if (!confirm(t('submitConfirm'))) return;

    try {
      await submitOrder({ orderId });
      setSuccessMessage(t('orderSubmitted'));
      loadOrder();
    } catch (err: any) {
      setError(err.message || t('error'));
    }
  }, [orderId, t, loadOrder]);

  const handleApprove = useCallback(async (priority: OrderPriority, notes?: string) => {
    try {
      await approveOrder({ orderId, priority, notes });
      setSuccessMessage(t('orderApproved'));
      loadOrder();
    } catch (err: any) {
      setError(err.message || t('error'));
    }
  }, [orderId, t, loadOrder]);

  const handleReject = useCallback(async (comment: string) => {
    try {
      await rejectOrder({ orderId, rejectionReason: comment });
      setSuccessMessage(t('orderRejected'));
      loadOrder();
    } catch (err: any) {
      setError(err.message || t('error'));
    }
  }, [orderId, t, loadOrder]);

  const handleFulfillClick = useCallback(() => {
    setFulfillmentDialogOpen(true);
  }, []);

  const handleFulfillSubmit = useCallback(async (items: { orderItemId: number; quantity: number }[]) => {
    try {
      await fulfillOrder({
        orderId,
        items: items.map(item => ({
          orderItemId: item.orderItemId,
          quantity: item.quantity,
        })),
      });
      setSuccessMessage(t('orderFulfilled'));
      loadOrder();
    } catch (err: any) {
      setError(err.message || t('error'));
    }
  }, [orderId, t, loadOrder]);

  const handleEdit = useCallback(() => {
    router.push(`/${locale}/orders/${orderId}/edit`);
  }, [router, locale, orderId]);

  const handleDelete = useCallback(async () => {
    if (!confirm(t('confirmDelete'))) return;

    try {
      const response = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
      if (response.ok) {
        setSuccessMessage(t('orderDeleted'));
        router.push(`/${locale}/orders`);
      } else {
        const error = await response.json();
        setError(error.error?.message || t('error'));
      }
    } catch (err: any) {
      setError(err.message || t('error'));
    }
  }, [orderId, t, router, locale]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const userRole = session?.user?.roleName;

  // Рендеринг загрузки
  if (isLoading) {
    return (
      <Box sx={{ p: 4 }}>
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3, mb: 3 }} />
        <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 3 }} />
      </Box>
    );
  }

  // Рендеринг ошибки
  if (!order) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{error || t('error')}</Alert>
      </Box>
    );
  }

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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Tooltip title={tCommon('back') || 'Назад'}>
            <IconButton onClick={handleBack} color="inherit">
              <BackIcon />
            </IconButton>
          </Tooltip>
          <Box>
            <Typography variant="h4" fontWeight={700}>
              {t('order')} #{order.id}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('createdAt')}: {order.createdAt
                ? new Date(order.createdAt).toLocaleDateString(locale, {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })
                : '—'}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <OrderPdfButton order={order} variant="button" />
          <Tooltip title={tCommon('refresh') || 'Обновить'}>
            <IconButton onClick={loadOrder} disabled={isLoading} color="inherit">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Контент */}
      <Box sx={{ p: 4, pt: 0 }}>
        {/* Детали заказа */}
        <OrderDetailComponent
          order={order}
          showFulfillment={userRole === 'storekeeper' || userRole === 'admin'}
        />

        {/* Действия */}
        <Box sx={{ mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            {t('actions')}
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <OrderActions
            order={order}
            userRole={userRole}
            permissions={permissions}
            onSubmit={handleSubmit}
            onApprove={handleApprove}
            onReject={handleReject}
            onFulfill={handleFulfillClick}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </Box>
      </Box>

      {/* Диалог выдачи */}
      <FulfillmentDialog
        open={fulfillmentDialogOpen}
        onClose={() => setFulfillmentDialogOpen(false)}
        onSubmit={handleFulfillSubmit}
        items={order.items || []}
        orderId={order.id}
      />

      {/* Сообщения */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={4000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSuccessMessage(null)}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>

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
