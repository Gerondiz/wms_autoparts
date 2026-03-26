'use client';

import { useTranslations } from 'next-intl';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Box,
  Typography,
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

interface SideMenuProps {
  open: boolean;
  onClose: () => void;
}

const DRAWER_WIDTH = 260;

export default function SideMenu({ open, onClose }: SideMenuProps) {
  const t = useTranslations();
  const theme = useTheme();
  const router = useRouter();
  const { data: session } = useSession();
  const permission = usePermission();

  // Проверка прав для пунктов меню
  const canViewAdmin = permission.hasPermission('user_manage') || permission.hasPermission('role_manage');
  const canViewAnalytics = permission.hasPermission('reports_view');

  const menuItems = [
    {
      text: t('navigation.catalog'),
      icon: <CatalogIcon />,
      path: '/catalog',
      alwaysShow: true,
    },
    {
      text: t('navigation.orders'),
      icon: <OrdersIcon />,
      path: '/orders',
      requiredPermission: 'order_view_own' as const,
    },
    {
      text: t('navigation.stock'),
      icon: <StockIcon />,
      path: '/stock',
      requiredPermission: 'stock_manage' as const,
    },
  ];

  const adminItems = [
    {
      text: t('navigation.admin'),
      icon: <AdminIcon />,
      path: '/admin',
      show: canViewAdmin,
    },
    {
      text: t('navigation.analytics'),
      icon: <AnalyticsIcon />,
      path: '/admin/analytics',
      show: canViewAnalytics,
    },
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
    onClose();
  };

  return (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile.
      }}
      sx={{
        display: { xs: 'block', md: 'none' },
        '& .MuiDrawer-paper': {
          boxSizing: 'border-box',
          width: DRAWER_WIDTH,
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
        }}
      >
        <Typography variant="h6" fontWeight="700" color="primary.main">
          WMS Autoparts
        </Typography>
      </Box>

      <List sx={{ pt: 1 }}>
        {menuItems.map((item) => {
          // Показываем если: всегда показывать ИЛИ есть разрешение
          const show = item.alwaysShow || (item.requiredPermission && permission.hasPermission(item.requiredPermission));
          
          if (!show) return null;
          
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton onClick={() => handleNavigation(item.path)}>
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider />

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ px: 2, py: 1, display: 'block' }}
      >
        {t('common.administration')}
      </Typography>

      <List>
        {adminItems.map((item) => {
          if (!item.show) return null;
          
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton onClick={() => handleNavigation(item.path)}>
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {session && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            p: 2,
            borderTop: 1,
            borderColor: 'divider',
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {session.user?.email}
          </Typography>
        </Box>
      )}
    </Drawer>
  );
}
