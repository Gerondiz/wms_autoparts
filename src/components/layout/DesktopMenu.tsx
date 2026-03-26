'use client';

import { useTranslations } from 'next-intl';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Assessment as CatalogIcon,
  Assignment as OrdersIcon,
  Inventory as StockIcon,
  AdminPanelSettings as AdminIcon,
  Analytics as AnalyticsIcon,
  Description as ReportsIcon,
} from '@mui/icons-material';
import { useRouter } from '@/i18n/routing';
import { useSession } from 'next-auth/react';
import { usePermission } from '@/lib/hooks/usePermission';

interface DesktopMenuProps {
  onNavigate?: () => void;
}

const DRAWER_WIDTH = 260;

export default function DesktopMenu({ onNavigate }: DesktopMenuProps) {
  const t = useTranslations();
  const theme = useTheme();
  const router = useRouter();
  const { data: session } = useSession();
  const { hasPermission } = usePermission();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Проверка прав для пунктов меню
  const canViewAdmin = hasPermission('user_manage') || hasPermission('role_manage');
  const canViewAnalytics = hasPermission('reports_view');
  const canViewOrders = hasPermission('order_view_own');
  const canViewStock = hasPermission('stock_manage');

  const handleNavigation = (path: string) => {
    if (onNavigate) onNavigate();
    router.push(path);
  };

  if (isMobile) {
    return null;
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: 'none', md: 'block' },
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          borderRight: 1,
          borderColor: 'divider',
          bgcolor: 'background.default',
        },
      }}
    >
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: 1,
          borderColor: 'divider',
          height: 64,
        }}
      >
        <Typography variant="h6" fontWeight="700" color="primary.main">
          WMS Autoparts
        </Typography>
      </Box>

      <List sx={{ pt: 2 }}>
        {/* Каталог - всегда доступен */}
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => handleNavigation('/catalog')}
            selected={typeof window !== 'undefined' && window.location.pathname.includes('/catalog')}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <CatalogIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary={t('navigation.catalog')}
              primaryTypographyProps={{ fontWeight: 500 }}
            />
          </ListItemButton>
        </ListItem>

        {/* Заказы */}
        {canViewOrders && (
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleNavigation('/orders')}>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <OrdersIcon />
              </ListItemIcon>
              <ListItemText primary={t('navigation.orders')} />
            </ListItemButton>
          </ListItem>
        )}

        {/* Склад */}
        {canViewStock && (
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleNavigation('/stock')}>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <StockIcon />
              </ListItemIcon>
              <ListItemText primary={t('navigation.stock')} />
            </ListItemButton>
          </ListItem>
        )}
      </List>

      <Divider sx={{ my: 1 }} />

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ px: 2, py: 1, display: 'block' }}
      >
        {t('common.administration')}
      </Typography>

      <List>
        {/* Администрирование */}
        {canViewAdmin && (
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleNavigation('/admin')}>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <AdminIcon />
              </ListItemIcon>
              <ListItemText primary={t('navigation.admin')} />
            </ListItemButton>
          </ListItem>
        )}

        {/* Аналитика */}
        {canViewAnalytics && (
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleNavigation('/admin/analytics')}>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <AnalyticsIcon />
              </ListItemIcon>
              <ListItemText primary={t('navigation.analytics')} />
            </ListItemButton>
          </ListItem>
        )}
      </List>

      {/* Информация о пользователе внизу */}
      {session && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            p: 2,
            borderTop: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Typography variant="caption" color="text.secondary" noWrap>
            {session.user?.name || session.user?.email}
          </Typography>
        </Box>
      )}
    </Drawer>
  );
}
