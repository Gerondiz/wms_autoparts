'use client';

import { useState, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  InputAdornment,
  alpha,
  Chip,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { OrderItemWithPart } from '@/lib/types/orders';

interface FulfillmentDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (items: { orderItemId: number; quantity: number }[]) => void;
  items: OrderItemWithPart[];
  orderId?: number;
}

interface FulfillmentItemState {
  orderItemId: number;
  partId: number;
  partName: string;
  partNumber: string;
  quantity: number;
  quantityFulfilled: number;
  quantityToIssue: number;
}

export default function FulfillmentDialog({
  open,
  onClose,
  onSubmit,
  items,
  orderId,
}: FulfillmentDialogProps) {
  const t = useTranslations('orders');
  const tCommon = useTranslations('common');
  const tCatalog = useTranslations('catalog');

  const [fulfillmentItems, setFulfillmentItems] = useState<FulfillmentItemState[]>([]);
  const [notes, setNotes] = useState('');

  // Инициализация состояния при открытии диалога
  useState(() => {
    if (open && items.length > 0) {
      setFulfillmentItems(
        items.map((item) => ({
          orderItemId: item.id,
          partId: item.partId,
          partName: item.part?.name || '',
          partNumber: item.part?.partNumber || '',
          quantity: item.quantity,
          quantityFulfilled: item.quantityFulfilled || 0,
          quantityToIssue: 0,
        }))
      );
    }
  });

  // Сброс состояния при закрытии
  const handleClose = useCallback(() => {
    setNotes('');
    onClose();
  }, [onClose]);

  // Обновление количества для выдачи
  const handleQuantityChange = useCallback((orderItemId: number, quantity: number) => {
    setFulfillmentItems((prev) =>
      prev.map((item) => {
        if (item.orderItemId === orderItemId) {
          const remaining = item.quantity - item.quantityFulfilled;
          const validQuantity = Math.max(0, Math.min(quantity, remaining));
          return { ...item, quantityToIssue: validQuantity };
        }
        return item;
      })
    );
  }, []);

  const handleIncrement = useCallback((orderItemId: number) => {
    setFulfillmentItems((prev) =>
      prev.map((item) => {
        if (item.orderItemId === orderItemId) {
          const remaining = item.quantity - item.quantityFulfilled;
          const newQuantity = Math.min(item.quantityToIssue + 1, remaining);
          return { ...item, quantityToIssue: newQuantity };
        }
        return item;
      })
    );
  }, []);

  const handleDecrement = useCallback((orderItemId: number) => {
    setFulfillmentItems((prev) =>
      prev.map((item) => {
        if (item.orderItemId === orderItemId) {
          const newQuantity = Math.max(0, item.quantityToIssue - 1);
          return { ...item, quantityToIssue: newQuantity };
        }
        return item;
      })
    );
  }, []);

  // Вычисление итогов
  const totalToIssue = useMemo(
    () => fulfillmentItems.reduce((sum, item) => sum + item.quantityToIssue, 0),
    [fulfillmentItems]
  );

  const hasItemsToIssue = fulfillmentItems.some((item) => item.quantityToIssue > 0);

  // Обработчик отправки
  const handleSubmit = useCallback(() => {
    const itemsToSubmit = fulfillmentItems
      .filter((item) => item.quantityToIssue > 0)
      .map((item) => ({
        orderItemId: item.orderItemId,
        quantity: item.quantityToIssue,
      }));

    if (itemsToSubmit.length > 0) {
      onSubmit(itemsToSubmit);
      handleClose();
    }
  }, [fulfillmentItems, onSubmit, handleClose]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircleIcon color="success" />
          <Typography variant="h6" component="span">
            {t('fulfillOrder') || 'Выдача заказа'} {orderId && `#${orderId}`}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        {items.length === 0 ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            {t('noItemsToIssue') || 'Нет позиций для выдачи'}
          </Alert>
        ) : (
          <>
            <Alert severity="info" sx={{ mb: 3 }}>
              {t('fulfillmentInfo') || 'Укажите количество для выдачи по каждой позиции'}
            </Alert>

            <TableContainer
              component={Paper}
              elevation={0}
              sx={{
                borderRadius: 2,
                border: 1,
                borderColor: 'divider',
                mb: 2,
              }}
            >
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha('#1976d2', 0.04) }}>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                      {tCatalog('partNumber') || 'Артикул'}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                      {tCatalog('name') || 'Наименование'}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }} align="center">
                      {t('requested') || 'Запрошено'}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }} align="center">
                      {t('issued') || 'Выдано'}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }} align="center">
                      {t('remaining') || 'Остаток'}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }} align="center">
                      {t('toIssue') || 'К выдаче'}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {fulfillmentItems.map((item, index) => {
                    const remaining = item.quantity - item.quantityFulfilled;
                    const isFullyIssued = item.quantityToIssue >= remaining;

                    return (
                      <TableRow
                        key={item.orderItemId}
                        sx={{
                          '&:hover': { bgcolor: alpha('#1976d2', 0.04) },
                          borderBottom: index < fulfillmentItems.length - 1 ? 1 : 'none',
                          borderColor: 'divider',
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace" fontWeight={600}>
                            {item.partNumber}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {item.partName}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2">{item.quantity}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" color="text.secondary">
                            {item.quantityFulfilled}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={remaining}
                            size="small"
                            color={remaining === 0 ? 'success' : 'default'}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                            <IconButton
                              size="small"
                              onClick={() => handleDecrement(item.orderItemId)}
                              disabled={item.quantityToIssue <= 0}
                            >
                              <RemoveIcon fontSize="small" />
                            </IconButton>
                            <TextField
                              size="small"
                              type="number"
                              value={item.quantityToIssue}
                              onChange={(e) =>
                                handleQuantityChange(item.orderItemId, parseInt(e.target.value) || 0)
                              }
                              InputProps={{
                                inputProps: { min: 0, max: remaining },
                                sx: {
                                  width: 60,
                                  textAlign: 'center',
                                  fontWeight: 600,
                                },
                              }}
                            />
                            <IconButton
                              size="small"
                              onClick={() => handleIncrement(item.orderItemId)}
                              disabled={item.quantityToIssue >= remaining}
                            >
                              <AddIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Итого */}
            <Box
              sx={{
                p: 2,
                bgcolor: alpha('#1976d2', 0.04),
                borderRadius: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography variant="body1" fontWeight={600}>
                {t('totalToIssue') || 'Итого к выдаче'}:
              </Typography>
              <Typography variant="h6" fontWeight={700} color="primary">
                {totalToIssue} {tCatalog('pcs') || 'шт.'}
              </Typography>
            </Box>

            {/* Примечание */}
            <TextField
              fullWidth
              multiline
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('fulfillmentNotes') || 'Примечание к выдаче (необязательно)...'}
              label={t('notes') || 'Примечание'}
              sx={{ mt: 2 }}
            />
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} color="inherit">
          {tCommon('cancel') || 'Отмена'}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={!hasItemsToIssue}
        >
          {t('confirmFulfillment') || 'Подтвердить выдачу'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
