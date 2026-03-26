'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  Divider,
  Chip,
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { Part } from '@/lib/hooks/api/useParts';
import { useCartStore } from '@/lib/stores/cart.store';

interface AddToCartDialogProps {
  open: boolean;
  part: Part | null;
  onClose: () => void;
  onConfirm: (quantity: number) => void;
}

export default function AddToCartDialog({
  open,
  part,
  onClose,
  onConfirm,
}: AddToCartDialogProps) {
  const t = useTranslations('catalog');
  const tCommon = useTranslations('common');

  const [quantity, setQuantity] = useState(1);
  const items = useCartStore((state) => state.items);

  // Сброс количества при открытии
  useEffect(() => {
    if (open) {
      // Проверяем, есть ли уже запчасть в корзине
      const existingItem = part ? items.find((i) => i.partId === part.id) : null;
      setQuantity(existingItem ? existingItem.quantity + 1 : 1);
    }
  }, [open, part, items]);

  const handleIncrement = () => {
    if (part && quantity < part.stock) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value) && value >= 1 && part && value <= part.stock) {
      setQuantity(value);
    }
  };

  const handleConfirm = () => {
    if (part) {
      onConfirm(quantity);
      onClose();
    }
  };

  if (!part) return null;

  const totalPrice = (parseFloat(part.price) * quantity).toFixed(2);
  const isInCart = items.some((item) => item.partId === part.id);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
        },
      }}
    >
      {/* Заголовок */}
      <DialogTitle sx={{ pr: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" fontWeight={600}>
            {t('addToCart')}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ ml: 'auto' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* Информация о запчасти */}
        <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
          {/* Изображение */}
          <Box
            component="img"
            src={part.primaryImage || '/images/placeholder-part.png'}
            alt={part.name}
            sx={{
              width: 100,
              height: 100,
              objectFit: 'cover',
              borderRadius: 2,
              bgcolor: 'grey.100',
              flexShrink: 0,
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/placeholder-part.png';
            }}
          />

          {/* Детали */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              {part.name}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              fontFamily="monospace"
              gutterBottom
            >
              {t('partNumber')}: {part.partNumber}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <Chip
                label={part.stock > 0 ? `${part.stock} ${t('inStock') || 'в наличии'}` : t('outOfStock') || 'Нет в наличии'}
                size="small"
                color={part.stock > 0 ? 'success' : 'default'}
              />
              {isInCart && (
                <Chip
                  label={t('inCart') || 'В заказе'}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
            </Box>

            <Typography
              variant="h6"
              color="primary.main"
              fontWeight={700}
              sx={{ mt: 1 }}
            >
              {part.price} ₽
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Выбор количества */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body1" fontWeight={500} sx={{ minWidth: 120 }}>
            {t('quantity') || 'Количество'}:
          </Typography>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              border: 1,
              borderColor: 'divider',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <IconButton
              size="small"
              onClick={handleDecrement}
              disabled={quantity <= 1}
              sx={{ borderRadius: 0 }}
            >
              <RemoveIcon fontSize="small" />
            </IconButton>

            <TextField
              value={quantity}
              onChange={handleQuantityChange}
              type="number"
              inputProps={{
                min: 1,
                max: part.stock,
                style: {
                  textAlign: 'center',
                  width: 60,
                  padding: '8px',
                },
              }}
              sx={{
                '& .MuiInputBase-input': {
                  MozAppearance: 'textfield',
                  '&::-webkit-outer-spin-button': {
                    WebkitAppearance: 'none',
                    margin: 0,
                  },
                  '&::-webkit-inner-spin-button': {
                    WebkitAppearance: 'none',
                    margin: 0,
                  },
                },
              }}
            />

            <IconButton
              size="small"
              onClick={handleIncrement}
              disabled={quantity >= part.stock}
              sx={{ borderRadius: 0 }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Box>

          <Typography variant="body2" color="text.secondary">
            {t('max') || 'Макс.'}: {part.stock} {t('pcs') || 'шт.'}
          </Typography>
        </Box>

        {/* Итоговая сумма */}
        <Box
          sx={{
            mt: 3,
            p: 2,
            bgcolor: 'primary.50',
            borderRadius: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="body1" color="text.secondary">
            {t('total') || 'Итого'}:
          </Typography>
          <Typography variant="h5" color="primary.main" fontWeight={700}>
            {totalPrice} ₽
          </Typography>
        </Box>
      </DialogContent>

      {/* Действия */}
      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={onClose} variant="outlined" color="inherit">
          {tCommon('cancel')}
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="primary"
          disabled={part.stock === 0 || quantity < 1}
          startIcon={<AddIcon />}
        >
          {t('addToCart')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
