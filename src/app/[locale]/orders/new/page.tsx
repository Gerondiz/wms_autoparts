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
  Paper,
  TextField,
  InputAdornment,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Add as AddIcon,
  Save as SaveIcon,
  Send as SendIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { OrderItems } from '@/components/orders';
import { OrderItemWithPart, OrderPriority } from '@/lib/types/orders';
import { createOrder } from '@/lib/services/orders.api';
import { useSession } from 'next-auth/react';
import { useRouter } from '@/i18n/routing';
import { useLocale } from 'next-intl';
import { useCartStore } from '@/lib/stores/cart.store';
import { Part } from '@/lib/types/models';
import PrioritySelector from '@/components/orders/PrioritySelector';

interface PartOption {
  id: number;
  partNumber: string;
  name: string;
  stock: number;
  label: string;
}

export default function NewOrderPage() {
  const t = useTranslations('orders');
  const tCommon = useTranslations('common');
  const tCatalog = useTranslations('catalog');
  const { data: session } = useSession();
  const router = useRouter();
  const locale = useLocale();

  // Корзина
  const cartItems = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);

  // Состояние
  const [items, setItems] = useState<OrderItemWithPart[]>([]);
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<OrderPriority | null>(OrderPriority.MEDIUM);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Диалог подтверждения
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [submitAfterCreate, setSubmitAfterCreate] = useState(false);

  // Инициализация из корзины
  useEffect(() => {
    if (cartItems.length > 0) {
      setItems(
        cartItems.map((item) => ({
          id: Date.now() + item.partId,
          orderId: 0,
          partId: item.partId,
          quantity: item.quantity,
          quantityFulfilled: 0,
          status: 'pending',
          part: {
            id: item.partId,
            name: item.name,
            partNumber: item.partNumber,
            stock: 0,
          } as Part,
        }))
      );
    }
  }, [cartItems]);

  // Обработчики
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleSave = useCallback(async () => {
    if (!session?.user?.id) {
      setError(t('error'));
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await createOrder({
        mechanicId: parseInt(session.user.id, 10),
        priority: priority || undefined,
        notes: notes || undefined,
        items: items.map((item) => ({
          partId: item.partId!,
          quantity: item.quantity,
        })),
      });

      if (response.order) {
        clearCart();
        setSuccessMessage(t('orderCreated'));
        router.push(`/${locale}/orders/${response.order.id}`);
      }
    } catch (err: any) {
      setError(err.message || t('error'));
    } finally {
      setIsSaving(false);
    }
  }, [session, priority, notes, items, t, clearCart, router, locale]);

  const handleSubmit = useCallback(() => {
    setSubmitAfterCreate(true);
    setConfirmDialogOpen(true);
  }, []);

  const handleConfirmCreate = useCallback(async () => {
    if (!session?.user?.id) {
      setError(t('error'));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await createOrder({
        mechanicId: parseInt(session.user.id, 10),
        priority: priority || undefined,
        notes: notes || undefined,
        items: items.map((item) => ({
          partId: item.partId!,
          quantity: item.quantity,
        })),
      });

      if (response.order) {
        clearCart();

        if (submitAfterCreate) {
          // Отправляем на согласование
          const submitResponse = await fetch(`/api/orders/${response.order.id}/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
          });

          if (submitResponse.ok) {
            setSuccessMessage(t('orderSubmitted'));
          }
        } else {
          setSuccessMessage(t('orderCreated'));
        }

        router.push(`/${locale}/orders/${response.order.id}`);
      }
    } catch (err: any) {
      setError(err.message || t('error'));
    } finally {
      setIsSubmitting(false);
      setConfirmDialogOpen(false);
    }
  }, [session, priority, notes, items, submitAfterCreate, t, clearCart, router, locale]);

  const handleCloseConfirmDialog = useCallback(() => {
    setConfirmDialogOpen(false);
    setSubmitAfterCreate(false);
  }, []);

  const canSave = items.length > 0 && session?.user?.id;

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
              {t('newOrder')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {items.length} {tCatalog('items') || 'позиций'}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Контент */}
      <Box sx={{ p: 4, pt: 0 }}>
        {items.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: 'center',
              borderRadius: 3,
              border: 1,
              borderColor: 'divider',
              bgcolor: alpha('#1976d2', 0.02),
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {t('noItems') || 'Корзина пуста'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('noItemsHint') || 'Добавьте запчасти из каталога'}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleBack}
              sx={{ mt: 3 }}
            >
              {tCatalog('title') || 'Перейти в каталог'}
            </Button>
          </Paper>
        ) : (
          <>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: 1,
                borderColor: 'divider',
                mb: 3,
              }}
            >
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {t('orderDetails') || 'Детали заказа'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mt: 2 }}>
                {/* Приоритет */}
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {t('priority')}
                  </Typography>
                  <PrioritySelector
                    value={priority}
                    onChange={setPriority}
                    size="large"
                    showLabel
                  />
                </Box>

                {/* Примечания */}
                <Box sx={{ flex: 1, minWidth: 300 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {t('notes')}
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t('notesPlaceholder') || 'Примечания к заказу...'}
                  />
                </Box>
              </Box>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: 1,
                borderColor: 'divider',
                mb: 3,
              }}
            >
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {t('items')}
              </Typography>
              <OrderItems items={items} />
            </Paper>

            {/* Кнопки действий */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={handleBack}
                disabled={isSaving || isSubmitting}
              >
                {tCommon('cancel')}
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={!canSave || isSaving || isSubmitting}
                color="primary"
              >
                {t('saveToDraft') || 'Сохранить в черновики'}
              </Button>
              <Button
                variant="contained"
                startIcon={<SendIcon />}
                onClick={handleSubmit}
                disabled={!canSave || isSaving || isSubmitting}
                color="success"
              >
                {t('submit') || 'Отправить'}
              </Button>
            </Box>
          </>
        )}
      </Box>

      {/* Диалог подтверждения */}
      <Dialog open={confirmDialogOpen} onClose={handleCloseConfirmDialog}>
        <DialogTitle>{t('submitOrder')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {t('submitConfirm')}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <input
              type="checkbox"
              id="submitAfterCreate"
              checked={submitAfterCreate}
              onChange={(e) => setSubmitAfterCreate(e.target.checked)}
            />
            <label htmlFor="submitAfterCreate">
              {t('submitAfterCreate') || 'Отправить на согласование сразу после создания'}
            </label>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog} color="inherit">
            {tCommon('cancel')}
          </Button>
          <Button
            onClick={handleConfirmCreate}
            variant="contained"
            color="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? t('loading') : tCommon('confirm')}
          </Button>
        </DialogActions>
      </Dialog>

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
