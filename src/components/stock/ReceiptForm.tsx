'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Box,
  Button,
  TextField,
  Typography,
  Autocomplete,
  Paper,
  Alert,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { stockReceipt } from '@/lib/api/stockClient';
import { usePartSearch } from '@/lib/hooks/useStock';
import { StockItem } from '@/lib/api/stockClient';

const receiptSchema = z.object({
  partId: z.number().positive('Запчасть обязательна'),
  quantity: z.number().positive('Количество должно быть больше 0'),
  reason: z.string().min(1, 'Причина обязательна'),
  notes: z.string().optional(),
});

type ReceiptFormData = z.infer<typeof receiptSchema>;

interface ReceiptFormProps {
  onSuccess?: () => void;
}

export default function ReceiptForm({ onSuccess }: ReceiptFormProps) {
  const t = useTranslations('stock.receipt');
  const [selectedPart, setSelectedPart] = useState<StockItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { data: searchResults, isLoading: isSearching } = usePartSearch(searchQuery);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ReceiptFormData>({
    resolver: zodResolver(receiptSchema),
    defaultValues: {
      partId: 0,
      quantity: 1,
      reason: '',
      notes: '',
    },
  });

  const quantity = watch('quantity');

  const onSubmit = async (data: ReceiptFormData) => {
    if (!selectedPart) {
      setError('Выберите запчасть');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await stockReceipt({
        partId: selectedPart.id,
        quantity: data.quantity,
        reason: data.reason,
        notes: data.notes,
      });

      setSuccess(t('success'));
      reset();
      setSelectedPart(null);
      setSearchQuery('');
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || t('error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {t('title')}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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
                  placeholder={t('partPlaceholder')}
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
                      {t('currentStock')}: {option.stock} | {t('location')}: {option.location || '—'}
                    </Typography>
                  </Box>
                </Box>
              )}
              noOptionsText="Ничего не найдено"
            />
          )}
        />

        {/* Отображение текущего остатка */}
        {selectedPart && (
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'action.hover' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                {t('currentStock')}:
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {selectedPart.stock}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                {t('newStock')}:
              </Typography>
              <Typography variant="body1" fontWeight="medium" color="success.main">
                {selectedPart.stock + (quantity || 0)}
              </Typography>
            </Box>
          </Paper>
        )}

        {/* Количество */}
        <Controller
          name="quantity"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label={t('quantity')}
              type="number"
              inputProps={{ min: 1 }}
              placeholder={t('quantityPlaceholder')}
              fullWidth
              error={!!errors.quantity}
              helperText={errors.quantity?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Typography variant="body2" color="text.secondary">+ </Typography>
                  </InputAdornment>
                ),
              }}
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
              placeholder={t('reasonPlaceholder')}
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
              placeholder={t('notesPlaceholder')}
              fullWidth
              multiline
              rows={2}
              error={!!errors.notes}
              helperText={errors.notes?.message}
            />
          )}
        />

        {/* Кнопка отправки */}
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={isSubmitting || !selectedPart}
          fullWidth
        >
          {isSubmitting ? <CircularProgress size={24} /> : t('submit')}
        </Button>
      </Box>
    </Paper>
  );
}
