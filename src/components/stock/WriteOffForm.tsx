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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { stockWriteOff } from '@/lib/api/stockClient';
import { usePartSearch } from '@/lib/hooks/useStock';
import { StockItem } from '@/lib/api/stockClient';

const writeOffReasons = ['defect', 'loss', 'damage', 'expiry', 'other'] as const;

const writeOffSchema = z.object({
  partId: z.number().positive('Запчасть обязательна'),
  quantity: z.number().positive('Количество должно быть больше 0'),
  reason: z.enum(writeOffReasons),
  notes: z.string().optional(),
});

type WriteOffFormData = z.infer<typeof writeOffSchema>;

interface WriteOffFormProps {
  onSuccess?: () => void;
}

export default function WriteOffForm({ onSuccess }: WriteOffFormProps) {
  const t = useTranslations('stock.writeOff');
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
  } = useForm<WriteOffFormData>({
    resolver: zodResolver(writeOffSchema),
    defaultValues: {
      partId: 0,
      quantity: 1,
      reason: 'defect',
      notes: '',
    },
  });

  const quantity = watch('quantity');

  const onSubmit = async (data: WriteOffFormData) => {
    if (!selectedPart) {
      setError('Выберите запчасть');
      return;
    }

    if (data.quantity > selectedPart.stock) {
      setError(t('insufficientStock'));
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const reasonLabel = t(`reasons.${data.reason}`);
      await stockWriteOff({
        partId: selectedPart.id,
        quantity: data.quantity,
        reason: reasonLabel,
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
              <Typography
                variant="body1"
                fontWeight="medium"
                color={selectedPart.stock - (quantity || 0) < 0 ? 'error.main' : 'warning.main'}
              >
                {selectedPart.stock - (quantity || 0)}
              </Typography>
            </Box>
            {quantity > selectedPart.stock && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {t('insufficientStock')}
              </Alert>
            )}
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
              inputProps={{ min: 1, max: selectedPart?.stock || 999999 }}
              placeholder={t('quantityPlaceholder')}
              fullWidth
              error={Boolean(!!errors.quantity || (selectedPart && field.value > selectedPart.stock))}
              helperText={
                errors.quantity?.message ||
                (selectedPart && field.value > selectedPart.stock ? t('insufficientStock') : '')
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Typography variant="body2" color="error">- </Typography>
                  </InputAdornment>
                ),
              }}
            />
          )}
        />

        {/* Причина списания */}
        <Controller
          name="reason"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth error={!!errors.reason}>
              <InputLabel>{t('reason')}</InputLabel>
              <Select {...field} label={t('reason')} labelId="reason-label">
                {writeOffReasons.map((reason) => (
                  <MenuItem key={reason} value={reason}>
                    {t(`reasons.${reason}`)}
                  </MenuItem>
                ))}
              </Select>
              {errors.reason && (
                <Typography variant="caption" color="error">
                  {errors.reason.message}
                </Typography>
              )}
            </FormControl>
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
          color="error"
          size="large"
          disabled={
            isSubmitting ||
            !selectedPart ||
            (selectedPart && quantity > selectedPart.stock)
          }
          fullWidth
        >
          {isSubmitting ? <CircularProgress size={24} /> : t('submit')}
        </Button>
      </Box>
    </Paper>
  );
}
