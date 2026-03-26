'use client';

import { useTranslations } from 'next-intl';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  alpha,
  TextField,
  InputAdornment,
  LinearProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { OrderItemWithPart } from '@/lib/types/orders';
import { ORDER_ITEM_STATUS_CONFIG } from '@/lib/constants/orders';

interface OrderItemsProps {
  items: OrderItemWithPart[];
  editable?: boolean;
  onEdit?: (itemId: number, quantity: number) => void;
  onRemove?: (itemId: number) => void;
  showFulfillment?: boolean;
}

export default function OrderItems({
  items,
  editable = false,
  onEdit,
  onRemove,
  showFulfillment = false,
}: OrderItemsProps) {
  const t = useTranslations('orders');
  const tCatalog = useTranslations('catalog');

  if (!items || items.length === 0) {
    return (
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
          {t('noItems') || 'Позиции не добавлены'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('noItemsHint') || 'Добавьте запчасти в заказ'}
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        border: 1,
        borderColor: 'divider',
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
              {t('quantity') || 'Кол-во'}
            </TableCell>
            {showFulfillment && (
              <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }} align="center">
                {t('quantityFulfilled') || 'Выдано'}
              </TableCell>
            )}
            <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }} align="center">
              {t('status') || 'Статус'}
            </TableCell>
            {showFulfillment && (
              <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }} align="center">
                {t('progress') || 'Прогресс'}
              </TableCell>
            )}
            {editable && (
              <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }} align="right">
                {tCommon('actions') || 'Действия'}
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item, index) => {
            const isFulfilled = item.quantityFulfilled >= item.quantity;
            const isPartial = item.quantityFulfilled > 0 && item.quantityFulfilled < item.quantity;
            const statusConfig = ORDER_ITEM_STATUS_CONFIG[
              isFulfilled ? 'fulfilled' : isPartial ? 'partial' : 'pending'
            ];
            const fulfillmentPercent = item.quantity > 0
              ? Math.round((item.quantityFulfilled / item.quantity) * 100)
              : 0;

            return (
              <TableRow
                key={item.id}
                sx={{
                  '&:hover': { bgcolor: alpha('#1976d2', 0.04) },
                  borderBottom: index < items.length - 1 ? 1 : 'none',
                  borderColor: 'divider',
                }}
              >
                <TableCell>
                  <Typography
                    variant="body2"
                    fontFamily="monospace"
                    fontWeight={600}
                  >
                    {item.part?.partNumber || '—'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>
                    {item.part?.name || '—'}
                  </Typography>
                  {item.part?.location && (
                    <Typography variant="caption" color="text.secondary">
                      {tCatalog('location')}: {item.part.location}
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2" fontWeight={600}>
                    {item.quantity} {tCatalog('pcs') || 'шт.'}
                  </Typography>
                </TableCell>
                {showFulfillment && (
                  <TableCell align="center">
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color={isFulfilled ? 'success.main' : isPartial ? 'warning.main' : 'text.secondary'}
                    >
                      {item.quantityFulfilled} {tCatalog('pcs') || 'шт.'}
                    </Typography>
                  </TableCell>
                )}
                <TableCell align="center">
                  <Chip
                    label={statusConfig.label}
                    color={statusConfig.color as any}
                    size="small"
                    sx={{ fontWeight: 600, minWidth: 100 }}
                  />
                </TableCell>
                {showFulfillment && (
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 120 }}>
                      <LinearProgress
                        variant="determinate"
                        value={fulfillmentPercent}
                        color={isFulfilled ? 'success' : isPartial ? 'warning' : 'info'}
                        sx={{
                          flex: 1,
                          height: 8,
                          borderRadius: 2,
                        }}
                      />
                      <Typography variant="caption" fontWeight={600} sx={{ minWidth: 35 }}>
                        {fulfillmentPercent}%
                      </Typography>
                    </Box>
                  </TableCell>
                )}
                {editable && (
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                      <Tooltip title={t('edit') || 'Редактировать'}>
                        <IconButton
                          size="small"
                          onClick={() => onEdit?.(item.id, item.quantity)}
                          color="primary"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('delete') || 'Удалить'}>
                        <IconButton
                          size="small"
                          onClick={() => onRemove?.(item.id)}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

// Helper для импорта
function tCommon(key: string) {
  return key;
}
