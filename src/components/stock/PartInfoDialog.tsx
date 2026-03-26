'use client';

import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Chip,
  Divider,
} from '@mui/material';
import { StockItem } from '@/lib/api/stockClient';

interface PartInfoDialogProps {
  part: StockItem | null;
  open: boolean;
  onClose: () => void;
}

export default function PartInfoDialog({
  part,
  open,
  onClose,
}: PartInfoDialogProps) {
  const t = useTranslations('stock.partInfo');
  const stockT = useTranslations('stock');

  if (!part) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('title')}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Артикул и название */}
          <Grid xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Chip label={part.partNumber} size="small" variant="outlined" />
              <Typography variant="h6">{part.name}</Typography>
            </Box>
          </Grid>

          <Grid xs={6} sm={4}>
            <Typography variant="caption" color="text.secondary" display="block">
              {t('stock')}
            </Typography>
            <Typography
              variant="body1"
              fontWeight="medium"
              color={part.isLowStock ? 'warning.main' : 'inherit'}
            >
              {part.stock}
            </Typography>
          </Grid>

          <Grid xs={6} sm={4}>
            <Typography variant="caption" color="text.secondary" display="block">
              {t('minStock')}
            </Typography>
            <Typography variant="body1">{part.minStockLevel}</Typography>
          </Grid>

          <Grid xs={6} sm={4}>
            <Typography variant="caption" color="text.secondary" display="block">
              {t('category')}
            </Typography>
            <Typography variant="body1">{part.hierarchyName || '—'}</Typography>
          </Grid>

          <Grid xs={6} sm={4}>
            <Typography variant="caption" color="text.secondary" display="block">
              {t('location')}
            </Typography>
            <Typography variant="body1">{part.location || '—'}</Typography>
          </Grid>

          <Grid xs={6} sm={4}>
            <Typography variant="caption" color="text.secondary" display="block">
              {t('price')}
            </Typography>
            <Typography variant="body1">{part.price ? `$${part.price}` : '—'}</Typography>
          </Grid>

          <Grid xs={12}>
            <Typography variant="caption" color="text.secondary" display="block">
              {t('status')}
            </Typography>
            <Box sx={{ mt: 0.5 }}>
              {part.isLowStock ? (
                <Chip
                  label={stockT('stockTable.lowStockWarning')}
                  size="small"
                  color="warning"
                  variant="outlined"
                />
              ) : part.stock > 0 ? (
                <Chip
                  label={stockT('stockTable.inStock')}
                  size="small"
                  color="success"
                  variant="outlined"
                />
              ) : (
                <Chip
                  label={stockT('stockTable.outOfStock')}
                  size="small"
                  color="error"
                  variant="outlined"
                />
              )}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          {t('close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
