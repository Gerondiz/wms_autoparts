'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
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
} from '@mui/material';
import {
  People as PeopleIcon,
  Inventory as InventoryIcon,
  ShoppingBasket as OrderIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import StatCard from '@/components/admin/StatCard';

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
}

export default function AdminDashboardPage() {
  const t = useTranslations('admin');
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
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

    loadDashboardData();
  }, []);

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1: return 'Высокий';
      case 2: return 'Средний';
      case 3: return 'Низкий';
      default: return '-';
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'error';
      case 2: return 'warning';
      case 3: return 'success';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
          {t('dashboard.welcome', { name: session?.user?.name || session?.user?.email || 'Admin' })}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('dashboard.quickStats')}
        </Typography>
      </Box>

      {/* Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t('dashboard.totalUsers')}
            value={data?.stats.totalUsers || 0}
            icon={<PeopleIcon sx={{ fontSize: 32 }} />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t('dashboard.totalParts')}
            value={data?.stats.totalParts || 0}
            icon={<InventoryIcon sx={{ fontSize: 32 }} />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t('dashboard.totalOrders')}
            value={data?.stats.totalOrders || 0}
            icon={<OrderIcon sx={{ fontSize: 32 }} />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t('roles.title')}
            value={data?.stats.totalRoles || 0}
            icon={<TrendingUpIcon sx={{ fontSize: 32 }} />}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Recent Orders */}
        <Grid item xs={12} lg={8}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: 1,
              borderColor: 'divider',
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              {t('dashboard.recentOrders')}
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>{t('orders.mechanic')}</TableCell>
                    <TableCell>{t('orders.status')}</TableCell>
                    <TableCell>{t('orders.priority')}</TableCell>
                    <TableCell>{t('orders.items')}</TableCell>
                    <TableCell>{t('orders.createdAt')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data?.recentOrders.slice(0, 5).map((order) => (
                    <TableRow key={order.id} hover>
                      <TableCell>#{order.id}</TableCell>
                      <TableCell>{order.mechanicName || '-'}</TableCell>
                      <TableCell>
                        <Chip
                          label={order.statusDisplayName || order.status}
                          size="small"
                          sx={{
                            bgcolor: order.statusColor || 'action.default',
                            color: order.statusColor ? '#fff' : 'text.primary',
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getPriorityLabel(order.priority)}
                          size="small"
                          color={getPriorityColor(order.priority) as any}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{order.itemsCount}</TableCell>
                      <TableCell>
                        {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!data?.recentOrders || data.recentOrders.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          {t('common.noData')}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Low Stock Alert */}
        <Grid item xs={12} lg={4}>
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
                {t('dashboard.lowStockAlert')}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {data?.lowStockParts.slice(0, 5).map((part) => (
                <Card
                  key={part.partId}
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    borderColor: 'error.light',
                    bgcolor: 'error.lighter',
                  }}
                >
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography variant="subtitle2" noWrap>
                      {part.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {part.partNumber}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="body2" color="error.main" sx={{ fontWeight: 600 }}>
                        Остаток: {part.stock}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Мин: {part.minStockLevel}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}
              {(!data?.lowStockParts || data.lowStockParts.length === 0) && (
                <Typography color="text.secondary" textAlign="center" py={4}>
                  Нет запчастей с низким остатком
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

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
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              {t('analytics.ordersByStatus')}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {data?.ordersByStatus.map((item) => (
                <Box
                  key={item.status}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: 'action.hover',
                  }}
                >
                  <Typography variant="body1">{item.displayName || item.status}</Typography>
                  <Chip
                    label={item.count}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              ))}
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
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              {t('analytics.popularParts')} ({t('analytics.top10')})
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t('parts.name')}</TableCell>
                    <TableCell align="right">{t('analytics.ordersCount')}</TableCell>
                    <TableCell align="right">{t('analytics.totalQuantity')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data?.popularParts.slice(0, 5).map((part) => (
                    <TableRow key={part.partId} hover>
                      <TableCell>
                        <Typography variant="body2" noWrap>
                          {part.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {part.partNumber}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Chip label={part.ordersCount} size="small" />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">{part.totalQuantity}</Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!data?.popularParts || data.popularParts.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          {t('common.noData')}
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
    </Box>
  );
}
