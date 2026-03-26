'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Autocomplete,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { stockReceipt, stockWriteOff, StockItem } from '@/lib/api/stockClient';
import { usePartSearch } from '@/lib/hooks/useStock';

const adjustmentTypes = ['increase', 'decrease', 'set'] as const;

const adjustmentSchema = z.object({
  partId: z.number().positive('Запчасть обязательна'),
  adjustmentType: z.enum(adjustmentTypes),
  quantity: z.number().positive('Количество должно быть больше 0'),
  reason: z.string().min(1, 'Причина обязательна'),
  notes: z.string().optional(),
});

type AdjustmentFormData = z.infer<typeof adjustmentSchema>;

interface StockAdjustmentDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function StockAdjustmentDialog({
  open,
  onClose,
  onSuccess,
}: StockAdjustmentDialogProps) {
  const t = useTranslations('stock.adjustment');
  const stockT = useTranslations('stock');
  const commonT = useTranslations('common');
  const [selectedPart, setSelectedPart] = useState<StockItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: searchResults, isLoading: isSearching } = usePartSearch(searchQuery);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<AdjustmentFormData>({
    resolver: zodResolver(adjustmentSchema),
    defaultValues: {
      partId: 0,
      adjustmentType: 'increase',
      quantity: 1,
      reason: '',
      notes: '',
    },
  });

  const adjustmentType = watch('adjustmentType');
  const quantity = watch('quantity');

  const handleClose = () => {
    reset();
    setSelectedPart(null);
    setSearchQuery('');
    setError(null);
    onClose();
  };

  const onSubmit = async (data: AdjustmentFormData) => {
    if (!selectedPart) {
      setError('Выберите запчасть');
      return;
    }

    if (data.adjustmentType === 'decrease' && data.quantity > selectedPart.stock) {
      setError(stockT('writeOff.insufficientStock'));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (data.adjustmentType === 'increase') {
        await stockReceipt({
          partId: selectedPart.id,
          quantity: data.quantity,
          reason: data.reason,
          notes: data.notes,
        });
      } else if (data.adjustmentType === 'decrease') {
        await stockWriteOff({
          partId: selectedPart.id,
          quantity: data.quantity,
          reason: data.reason,
          notes: data.notes,
        });
      } else {
        // Для установки значения сначала вычисляем разницу
        const difference = data.quantity - selectedPart.stock;
        if (difference > 0) {
          await stockReceipt({
            partId: selectedPart.id,
            quantity: difference,
            reason: data.reason,
            notes: data.notes,
          });
        } else if (difference < 0) {
          await stockWriteOff({
            partId: selectedPart.id,
            quantity: Math.abs(difference),
            reason: data.reason,
            notes: data.notes,
          });
        }
      }

      onSuccess?.();
      handleClose();
    } catch (err: any) {
      setError(err.message || t('error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateNewStock = () => {
    if (!selectedPart) return null;
    if (adjustmentType === 'increase') {
      return selectedPart.stock + quantity;
    } else if (adjustmentType === 'decrease') {
      return selectedPart.stock - quantity;
    } else {
      return quantity;
    }
  };

  const newStock = calculateNewStock();

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('title')}</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Выбор запчасти */}
          <Controller
            name="partId"
            control={control}
            render={({ field }) => (
              <Autocomplete
                {...field}
                options={searchResults || []}
                loading={isSearching}
                getOptionLabel={(option) => `${option.partNumber} — ${option.name}`}
                isOptionEqualToValue={(option, value) => option.id === value?.id}
                value={selectedPart}
                onChange={(_, newValue) => {
                  setSelectedPart(newValue);
                  field.onChange(newValue?.id || 0);
                }}
                onInputChange={(_, newInputValue) => {
                  setSearchQuery(newInputValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t('selectPart')}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {isSearching && <CircularProgress color="inherit" size={20} />}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                    error={!!errors.partId}
                    helperText={errors.partId?.message}
                  />
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="body2" fontWeight="medium">
                        {option.partNumber} — {option.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {stockT('stockTable.stock')}: {option.stock}
                      </Typography>
                    </Box>
                  </Box>
                )}
                noOptionsText="Ничего не найдено"
              />
            )}
          />

          {/* Тип операции */}
          <Controller
            name="adjustmentType"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <InputLabel>{t('adjustmentType')}</InputLabel>
                <Select {...field} label={t('adjustmentType')}>
                  <MenuItem value="increase">{t('increase')}</MenuItem>
                  <MenuItem value="decrease">{t('decrease')}</MenuItem>
                  <MenuItem value="set">{t('setStock')}</MenuItem>
                </Select>
              </FormControl>
            )}
          />

          {/* Отображение текущего и нового остатка */}
          {selectedPart && (
            <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {stockT('stockTable.stock')}:
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {selectedPart.stock}
                </Typography>
              </Box>
              {newStock !== null && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('newStockValue')}:
                  </Typography>
                  <Typography
                    variant="body1"
                    fontWeight="medium"
                    color={
                      newStock < selectedPart.minStockLevel
                        ? 'warning.main'
                        : newStock < 0
                        ? 'error.main'
                        : 'success.main'
                    }
                  >
                    {newStock}
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {/* Количество / Новое значение */}
          <Controller
            name="quantity"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={adjustmentType === 'set' ? t('newStockValue') : t('quantity')}
                type="number"
                inputProps={{
                  min: adjustmentType === 'set' ? 0 : 1,
                  max: selectedPart?.stock && adjustmentType === 'decrease' ? selectedPart.stock : undefined,
                }}
                fullWidth
                error={Boolean(
                  !!errors.quantity ||
                  (adjustmentType === 'decrease' && selectedPart && field.value > selectedPart.stock)
                )}
                helperText={
                  errors.quantity?.message ||
                  (adjustmentType === 'decrease' && selectedPart && field.value > selectedPart.stock
                    ? stockT('writeOff.insufficientStock')
                    : '')
                }
              />
            )}
          />

          {/* Причина */}
          <Controller
            name="reason"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('reason')}
                fullWidth
                multiline
                rows={2}
                error={!!errors.reason}
                helperText={errors.reason?.message}
              />
            )}
          />

          {/* Комментарий */}
          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('notes')}
                fullWidth
                multiline
                rows={2}
              />
            )}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isSubmitting}>
          {commonT('cancel')}
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          disabled={isSubmitting || !selectedPart}
        >
          {isSubmitting ? <CircularProgress size={24} /> : t('submit')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
