'use client';

import { useTranslations } from 'next-intl';
import { useState, useCallback } from 'react';
import {
  Box,
  Badge,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Typography,
  Button,
  Divider,
  alpha,
  Tooltip,
  Fade,
  ClickAwayListener,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  ShoppingCart as CartIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingBag as CheckoutIcon,
  ClearAll as ClearAllIcon,
} from '@mui/icons-material';
import { useCartStore, CartItem } from '@/lib/stores/cart.store';
import { useRouter } from '@/i18n/routing';
import { useLocale } from 'next-intl';

export default function MiniCart() {
  const t = useTranslations('cart');
  const tCommon = useTranslations('common');
  const tCatalog = useTranslations('catalog');
  
  const router = useRouter();
  const locale = useLocale();

  const [isOpen, setIsOpen] = useState(false);

  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  const getTotalItems = useCartStore((state) => state.getTotalItems);

  const totalItems = getTotalItems();
  const totalPrice = items.reduce(
    (sum, item) => sum + parseFloat('0') + Number(item.quantity),
    0
  );

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleIncrement = useCallback(
    (partId: number, currentQuantity: number) => {
      updateQuantity(partId, currentQuantity + 1);
    },
    [updateQuantity]
  );

  const handleDecrement = useCallback(
    (partId: number, currentQuantity: number) => {
      if (currentQuantity > 1) {
        updateQuantity(partId, currentQuantity - 1);
      } else {
        removeItem(partId);
      }
    },
    [updateQuantity, removeItem]
  );

  const handleRemove = useCallback(
    (partId: number) => {
      removeItem(partId);
    },
    [removeItem]
  );

  const handleClearCart = useCallback(() => {
    if (confirm(t('clearConfirm') || 'Вы уверены, что хотите очистить корзину?')) {
      clearCart();
    }
  }, [clearCart, t]);

  const handleCheckout = useCallback(() => {
    // Переход к оформлению заказа
    router.push(`/${locale}/orders/new`);
  }, [router, locale]);

  const isEmpty = items.length === 0;

  return (
    <ClickAwayListener onClickAway={handleClose}>
      <Box sx={{ position: 'relative' }}>
        {/* Кнопка корзины */}
        <Tooltip title={t('title')}>
          <IconButton
            onClick={handleToggle}
            size="large"
            sx={{
              position: 'relative',
              '&:hover': {
                bgcolor: alpha('#1976d2', 0.1),
              },
            }}
          >
            <Badge
              badgeContent={totalItems}
              color="error"
              overlap="circular"
              showZero={false}
            >
              <CartIcon />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* Выпадающая панель */}
        <Fade in={isOpen}>
          <Paper
            elevation={8}
            sx={{
              position: 'absolute',
              top: '100%',
              right: 0,
              mt: 1,
              width: 360,
              maxHeight: '70vh',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 1300,
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            {/* Заголовок */}
            <Box
              sx={{
                p: 2,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CartIcon />
                <Typography variant="h6" fontWeight={600}>
                  {t('title')}
                </Typography>
              </Box>
              {!isEmpty && (
                <Tooltip title={t('clearCart') || 'Очистить'}>
                  <IconButton
                    size="small"
                    onClick={handleClearCart}
                    sx={{ color: 'inherit' }}
                  >
                    <ClearAllIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>

            {/* Список товаров */}
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              {isEmpty ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    py: 6,
                    px: 2,
                  }}
                >
                  <CartIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    {t('empty') || 'Корзина пуста'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    {t('emptyHint') || 'Добавьте запчасти из каталога'}
                  </Typography>
                </Box>
              ) : (
                <List sx={{ p: 0 }}>
                  {items.map((item, index) => (
                    <Box key={item.partId}>
                      <ListItem
                        sx={{
                          py: 2,
                          px: 2,
                          alignItems: 'flex-start',
                        }}
                      >
                        <ListItemText
                          primary={
                            <Typography variant="body2" fontWeight={600} noWrap>
                              {item.name}
                            </Typography>
                          }
                          secondary={
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              fontFamily="monospace"
                            >
                              {item.partNumber}
                            </Typography>
                          }
                        />
                        <ListItemSecondaryAction
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-end',
                            gap: 1,
                            right: 8,
                            top: '50%',
                            transform: 'translateY(-50%)',
                          }}
                        >
                          {/* Контролы количества */}
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
                              onClick={() =>
                                handleDecrement(item.partId, item.quantity)
                              }
                              sx={{ borderRadius: 0, p: 0.5 }}
                            >
                              <RemoveIcon fontSize="small" />
                            </IconButton>
                            <Typography
                              variant="body2"
                              sx={{
                                px: 1,
                                minWidth: 24,
                                textAlign: 'center',
                              }}
                            >
                              {item.quantity}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleIncrement(item.partId, item.quantity)
                              }
                              sx={{ borderRadius: 0, p: 0.5 }}
                            >
                              <AddIcon fontSize="small" />
                            </IconButton>
                          </Box>

                          {/* Кнопка удаления */}
                          <IconButton
                            size="small"
                            onClick={() => handleRemove(item.partId)}
                            color="error"
                            sx={{ p: 0.5 }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < items.length - 1 && (
                        <Divider variant="inset" component="li" />
                      )}
                    </Box>
                  ))}
                </List>
              )}
            </Box>

            {/* Подвал с итогом */}
            {!isEmpty && (
              <Box
                sx={{
                  p: 2,
                  bgcolor: alpha('#1976d2', 0.04),
                  borderTop: 1,
                  borderColor: 'divider',
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
                  <Typography variant="body1" color="text.secondary">
                    {t('totalItems')}:
                  </Typography>
                  <Typography variant="h6" fontWeight={700}>
                    {totalItems} {tCatalog('pcs') || 'шт.'}
                  </Typography>
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<CheckoutIcon />}
                  onClick={handleCheckout}
                  sx={{
                    py: 1.5,
                    fontWeight: 600,
                    borderRadius: 2,
                  }}
                >
                  {t('checkout') || 'Оформить заказ'}
                </Button>
              </Box>
            )}
          </Paper>
        </Fade>
      </Box>
    </ClickAwayListener>
  );
}
