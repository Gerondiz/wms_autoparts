'use client';

import { useTranslations } from 'next-intl';
import { Box, Typography, Grid, Paper, IconButton, Tooltip } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Link from 'next/link';
import { ReceiptForm } from '@/components/stock';

export default function StockReceiptPage() {
  const t = useTranslations('stock.receipt');
  const stockT = useTranslations('stock');

  return (
    <Box sx={{ p: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Tooltip title={stockT('currentStock')}>
            <IconButton component={Link} href="/stock" color="primary">
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="h4" component="h1">
            {t('title')}
          </Typography>
        </Box>
      </Box>

      {/* Form */}
      <Grid container spacing={3}>
        <Grid xs={12} md={8}>
          <ReceiptForm />
        </Grid>
        <Grid xs={12} md={4}>
          <Paper sx={{ p: 3, height: 'fit-content' }}>
            <Typography variant="h6" gutterBottom>
              Информация
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Приход запчастей используется для увеличения остатков на складе.
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Операция будет записана в историю склада с указанием причины и комментария.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Для массового обновления остатков используйте импорт или корректировку.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
