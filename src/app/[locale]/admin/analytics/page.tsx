'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  ShoppingCart as CartIcon,
} from '@mui/icons-material';
import AdminLayout from '@/components/admin/AdminLayout';

interface DashboardData {
  stats: {
    totalUsers: number;
    totalParts: number;
    totalOrders: number;
    totalRoles: number;
  };
  ordersByStatus: Array<{
    status: string;
    displayName: string;
    count: number;
  }>;
  popularParts: Array<{
    partId: number;
    name: string;
    partNumber: string;
    ordersCount: number;
    totalQuantity: number;
  }>;
  lowStockParts: Array<{
    partId: number;
    name: string;
    partNumber: string;
    stock: number;
    minStockLevel: number;
    location: string;
    price?: string;
  }>;
  recentOrders: Array<{
    id: number;
    mechanicName: string;
    status: string;
    statusDisplayName: string;
    statusColor: string;
    priority: number;
    itemsCount: number;
    createdAt: string;
  }>;
  recentActivity: Array<{
    date: string;
    receiptsCount: number;
    writeOffsCount: number;
    totalQuantityChange: number;
  }>;
}

export default function AdminAnalyticsPage() {
  const t = useTranslations('admin');
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
        const response = await fetch('/api/admin/analytics');
        const result = await response.json();

        if (result.success) {
          setData(result.data);
        } else {
          setError(result.error?.message || 'Ошибка загрузки данных');
        }
      } catch (err) {
        setError('Ошибка подключения к серверу');
      } finally {
        setLoading(false);
      }
    };

    loadAnalyticsData();
  }, []);

  if (loading) {
    return (
      <AdminLayout title={t('analytics.title')}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title={t('analytics.title')}>
        <Alert severity="error">{error}</Alert>
      </AdminLayout>
    );
  }

  const maxOrdersCount = Math.max(...(data?.popularParts.map(p => p.ordersCount) || [1]));

  return (
    <AdminLayout title={t('analytics.title')}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
          {t('analytics.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Аналитика и отчёты системы
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Orders by Status */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: 1,
              borderColor: 'divider',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CartIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {t('analytics.ordersByStatus')}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {data?.ordersByStatus.map((item) => {
                const total = data.ordersByStatus.reduce((sum, s) => sum + s.count, 0);
                const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
                
                return (
                  <Box key={item.status}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">{item.displayName || item.status}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.count} ({percentage}%)
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={percentage}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: 'action.hover',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                        },
                      }}
                    />
                  </Box>
                );
              })}
              {(!data?.ordersByStatus || data.ordersByStatus.length === 0) && (
                <Typography color="text.secondary" textAlign="center" py={4}>
                  {t('common.noData')}
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Popular Parts */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: 1,
              borderColor: 'divider',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TrendingUpIcon color="success" sx={{ mr: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {t('analytics.popularParts')} ({t('analytics.top10')})
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {data?.popularParts.map((part, index) => (
                <Card
                  key={part.partId}
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                  }}
                >
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          bgcolor: index < 3 ? 'primary.main' : 'action.hover',
                          color: index < 3 ? 'primary.contrastText' : 'text.primary',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                        }}
                      >
                        {index + 1}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" noWrap>
                          {part.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {part.partNumber}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Chip
                          label={part.ordersCount}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          {t('analytics.ordersCount')}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ mt: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={(part.ordersCount / maxOrdersCount) * 100}
                        sx={{
                          height: 4,
                          borderRadius: 2,
                          bgcolor: 'action.hover',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 2,
                            bgcolor: index < 3 ? 'primary.main' : 'action.active',
                          },
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              ))}
              {(!data?.popularParts || data.popularParts.length === 0) && (
                <Typography color="text.secondary" textAlign="center" py={4}>
                  {t('common.noData')}
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Low Stock Parts */}
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: 1,
              borderColor: 'divider',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <WarningIcon color="error" sx={{ mr: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {t('analytics.lowStockParts')}
              </Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('parts.partNumber')}</TableCell>
                    <TableCell>{t('parts.name')}</TableCell>
                    <TableCell align="right">{t('parts.stock')}</TableCell>
                    <TableCell align="right">{t('parts.minStockLevel')}</TableCell>
                    <TableCell>{t('parts.location')}</TableCell>
                    <TableCell align="right">{t('parts.price')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data?.lowStockParts.map((part) => {
                    const stockPercentage = part.minStockLevel > 0
                      ? (part.stock / part.minStockLevel) * 100
                      : 0;
                    
                    return (
                      <TableRow key={part.partId} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {part.partNumber}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{part.name}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={part.stock}
                            size="small"
                            color="error"
                            variant={part.stock === 0 ? 'filled' : 'outlined'}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">{part.minStockLevel}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {part.location || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {part.price ? `${part.price} ₽` : '-'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {(!data?.lowStockParts || data.lowStockParts.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          Нет запчастей с низким остатком
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </AdminLayout>
  );
}
