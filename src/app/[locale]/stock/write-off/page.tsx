'use client';

import { useTranslations } from 'next-intl';
import { Box, Typography, Grid, Paper, IconButton, Tooltip } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Link from 'next/link';
import { WriteOffForm } from '@/components/stock';

export default function StockWriteOffPage() {
  const t = useTranslations('stock.writeOff');
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
          <WriteOffForm />
        </Grid>
        <Grid xs={12} md={4}>
          <Paper sx={{ p: 3, height: 'fit-content' }}>
            <Typography variant="h6" gutterBottom>
              Информация
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Списание запчастей используется для уменьшения остатков на складе.
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Доступные причины списания:
            </Typography>
            <Typography variant="body2" component="ul" color="text.secondary">
              <li>Брак — дефектные запчасти</li>
              <li>Потеря — утерянные запчасти</li>
              <li>Повреждение — повреждённые при хранении</li>
              <li>Истечение срока — просроченные запчасти</li>
              <li>Иное — другие причины</li>
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Операция будет записана в историю склада.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
