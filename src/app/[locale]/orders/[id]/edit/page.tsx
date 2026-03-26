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
  TextField,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  InputAdornment,
  alpha,
  Divider,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Add as AddIcon,
  Save as SaveIcon,
  Send as SendIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { OrderItems } from '@/components/orders';
import { OrderWithDetails, OrderItemWithPart, OrderPriority } from '@/lib/types/orders';
import { getOrderById, updateOrder, addOrderItem, updateOrderItem, removeOrderItem, submitOrder } from '@/lib/services/orders.api';
import { useSession } from 'next-auth/react';
import { useRouter } from '@/i18n/routing';
import { useLocale } from 'next-intl';
import { useParams } from 'next/navigation';
import { Part } from '@/lib/types/models';
import PrioritySelector from '@/components/orders/PrioritySelector';

// Интерфейс для части с поиском
interface PartOption {
  id: number;
  partNumber: string;
  name: string;
  stock: number;
  label: string;
}

export default function EditOrderPage() {
  const t = useTranslations('orders');
  const tCommon = useTranslations('common');
  const tCatalog = useTranslations('catalog');
  const { data: session } = useSession();
  const router = useRouter();
  const locale = useLocale();
  const params = useParams();
  const orderId = parseInt(params.id as string, 10);

  // Состояние
  const [order, setOrder] = useState<OrderWithDetails | null>(null);
  const [items, setItems] = useState<OrderItemWithPart[]>([]);
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<OrderPriority | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Диалог добавления запчасти
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState<PartOption | null>(null);
  const [addQuantity, setAddQuantity] = useState(1);
  const [partsSearch, setPartsSearch] = useState('');
  const [partsOptions, setPartsOptions] = useState<PartOption[]>([]);
  const [isSearchingParts, setIsSearchingParts] = useState(false);

  // Загрузка заказа
  const loadOrder = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getOrderById(orderId);
      setOrder(response.order);
      setItems(response.order.items || []);
      setNotes(response.order.notes || '');
      setPriority(response.order.priority || OrderPriority.MEDIUM);
    } catch (err: any) {
      setError(err.message || t('error'));
    } finally {
      setIsLoading(false);
    }
  }, [orderId, t]);

  useEffect(() => {
    if (!isNaN(orderId)) {
      loadOrder();
    }
  }, [orderId, loadOrder]);

  // Поиск запчастей
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (partsSearch.length >= 2) {
        setIsSearchingParts(true);
        try {
          const response = await fetch(`/api/parts/search?q=${encodeURIComponent(partsSearch)}&limit=10`);
          if (response.ok) {
            const data = await response.json();
            setPartsOptions(
              data.data.map((part: Part) => ({
                id: part.id,
                partNumber: part.partNumber,
                name: part.name,
                stock: part.stock,
                label: `${part.partNumber} — ${part.name} (${part.stock} ${tCatalog('pcs')})`,
              }))
            );
          }
        } catch (err) {
          console.error('Error searching parts:', err);
        } finally {
          setIsSearchingParts(false);
        }
      } else {
        setPartsOptions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [partsSearch, tCatalog]);

  // Обработчики
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setError(null);

    try {
      await updateOrder(orderId, {
        notes: notes || undefined,
        priority: priority || undefined,
        items: items.map(item => ({
          partId: item.partId!,
          quantity: item.quantity,
        })),
      });
      setSuccessMessage(t('changesSaved'));
      loadOrder();
    } catch (err: any) {
      setError(err.message || t('error'));
    } finally {
      setIsSaving(false);
    }
  }, [orderId, notes, priority, items, t, loadOrder]);

  const handleSubmit = useCallback(async () => {
    if (!confirm(t('submitConfirm'))) return;

    // Сначала сохраняем, потом отправляем
    try {
      await updateOrder(orderId, {
        notes: notes || undefined,
        priority: priority || undefined,
        items: items.map(item => ({
          partId: item.partId!,
          quantity: item.quantity,
        })),
      });

      await submitOrder({ orderId });
      setSuccessMessage(t('orderSubmitted'));
      router.push(`/${locale}/orders/${orderId}`);
    } catch (err: any) {
      setError(err.message || t('error'));
    }
  }, [orderId, notes, priority, items, t, router, locale]);

  const handleAddPart = useCallback(() => {
    setAddDialogOpen(true);
    setSelectedPart(null);
    setAddQuantity(1);
    setPartsSearch('');
    setPartsOptions([]);
  }, []);

  const handleCloseAddDialog = useCallback(() => {
    setAddDialogOpen(false);
  }, []);

  const handleConfirmAddPart = useCallback(() => {
    if (!selectedPart) return;

    // Проверяем, есть ли уже такая запчасть в заказе
    const existingItem = items.find(item => item.partId === selectedPart.id);
    if (existingItem) {
      // Обновляем количество
      setItems(prev =>
        prev.map(item =>
          item.partId === selectedPart.id
            ? { ...item, quantity: item.quantity + addQuantity }
            : item
        )
      );
    } else {
      // Добавляем новую позицию
      setItems(prev => [
        ...prev,
        {
          id: Date.now(), // Временный ID для нового элемента
          orderId,
          partId: selectedPart.id,
          quantity: addQuantity,
          quantityFulfilled: 0,
          status: 'pending',
          part: {
            id: selectedPart.id,
            name: selectedPart.name,
            partNumber: selectedPart.partNumber,
            stock: selectedPart.stock,
          } as Part,
        },
      ]);
    }

    setSuccessMessage(t('partAdded'));
    handleCloseAddDialog();
  }, [selectedPart, addQuantity, items, orderId, t, handleCloseAddDialog]);

  const handleEditItem = useCallback((itemId: number, currentQuantity: number) => {
    const newQuantity = prompt(t('quantity') || 'Количество', currentQuantity.toString());
    if (newQuantity !== null) {
      const qty = parseInt(newQuantity, 10);
      if (qty > 0 && qty !== currentQuantity) {
        setItems(prev =>
          prev.map(item =>
            item.id === itemId ? { ...item, quantity: qty } : item
          )
        );
        setSuccessMessage(t('quantityUpdated'));
      }
    }
  }, [t]);

  const handleRemoveItem = useCallback((itemId: number) => {
    if (confirm(t('confirmRemove') || 'Удалить позицию?')) {
      setItems(prev => prev.filter(item => item.id !== itemId));
      setSuccessMessage(t('partRemoved'));
    }
  }, [t]);

  const isDraft = order?.status?.name === 'draft';
  const canEdit = isDraft && String(order?.mechanicId) === session?.user?.id;

  // Рендеринг загрузки
  if (isLoading) {
    return (
      <Box sx={{ p: 4 }}>
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3, mb: 3 }} />
        <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 3 }} />
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
              {t('editOrder')} #{order?.id}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('onlyDraftEdit')}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Контент */}
      <Box sx={{ p: 4, pt: 0 }}>
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
          <Divider sx={{ mb: 3 }} />

          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {/* Приоритет */}
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {t('priority')}
              </Typography>
              <PrioritySelector
                value={priority}
                onChange={setPriority}
                disabled={!canEdit}
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
                disabled={!canEdit}
                placeholder={t('notesPlaceholder') || 'Примечания к заказу...'}
              />
            </Box>
          </Box>
        </Paper>

        {/* Позиции заказа */}
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
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Typography variant="h6" fontWeight={600}>
              {t('items')}
            </Typography>
            {canEdit && (
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddPart}
              >
                {t('addPart')}
              </Button>
            )}
          </Box>

          <OrderItems
            items={items}
            editable={canEdit}
            onEdit={handleEditItem}
            onRemove={handleRemoveItem}
          />
        </Paper>

        {/* Кнопки действий */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={handleBack}
            disabled={isSaving}
          >
            {tCommon('cancel')}
          </Button>
          {canEdit && (
            <>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={isSaving || items.length === 0}
                color="primary"
              >
                {t('saveChanges')}
              </Button>
              <Button
                variant="contained"
                startIcon={<SendIcon />}
                onClick={handleSubmit}
                disabled={isSaving || items.length === 0}
                color="success"
              >
                {t('saveAndSubmit')}
              </Button>
            </>
          )}
        </Box>
      </Box>

      {/* Диалог добавления запчасти */}
      <Dialog open={addDialogOpen} onClose={handleCloseAddDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{t('addPart')}</DialogTitle>
        <DialogContent>
          <Autocomplete
            options={partsOptions}
            loading={isSearchingParts}
            value={selectedPart}
            onChange={(_, value) => setSelectedPart(value)}
            getOptionLabel={(option) => option.label}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t('selectPart')}
                placeholder={tCatalog('search')}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                onChange={(e) => setPartsSearch(e.target.value)}
              />
            )}
            renderOption={(props, option) => (
              <Box component="li" {...props}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight={600}>
                    {option.partNumber}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {option.name}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {option.stock} {tCatalog('pcs')}
                </Typography>
              </Box>
            )}
            sx={{ mt: 2, mb: 2 }}
          />

          <TextField
            fullWidth
            type="number"
            label={t('quantity')}
            value={addQuantity}
            onChange={(e) => setAddQuantity(parseInt(e.target.value) || 1)}
            InputProps={{
              inputProps: { min: 1 },
              endAdornment: (
                <InputAdornment position="end">
                  <Typography variant="body2" color="text.secondary">
                    {tCatalog('pcs')}
                  </Typography>
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog} color="inherit">
            {tCommon('cancel')}
          </Button>
          <Button
            onClick={handleConfirmAddPart}
            variant="contained"
            disabled={!selectedPart}
          >
            {tCommon('confirm')}
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
