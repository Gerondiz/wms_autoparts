'use client';

import { useTranslations } from 'next-intl';
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Assessment as CatalogIcon,
  Assignment as OrdersIcon,
  Inventory as StockIcon,
  AdminPanelSettings as AdminIcon,
  Analytics as AnalyticsIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useRouter } from '@/i18n/routing';
import { useSession } from 'next-auth/react';
import { usePermission } from '@/lib/hooks/usePermission';
import { useState } from 'react';

export default function NavigationMenu() {
  const t = useTranslations();
  const router = useRouter();
  const { data: session } = useSession();
  const { hasPermission } = usePermission();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Проверка прав для пунктов меню
  const canViewAdmin = hasPermission('user_manage') || hasPermission('role_manage');
  const canViewAnalytics = hasPermission('reports_view');
  const canViewOrders = hasPermission('order_view_own');
  const canViewStock = hasPermission('stock_manage');

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleNavigation = (path: string) => {
    handleCloseMenu();
    router.push(path);
  };

  const isOpen = Boolean(anchorEl);

  return (
    <>
      <Tooltip title={t('navigation.menu') || 'Меню'}>
        <IconButton
          color="inherit"
          onClick={handleOpenMenu}
          size="large"
          aria-label="открыть меню навигации"
        >
          <MenuIcon />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={isOpen}
        onClose={handleCloseMenu}
        PaperProps={{
          sx: {
            minWidth: 240,
            mt: 1,
          },
        }}
      >
        {/* Каталог - всегда доступен */}
        <MenuItem onClick={() => handleNavigation('/catalog')}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <CatalogIcon color="primary" />
          </ListItemIcon>
          <ListItemText
            primary={t('navigation.catalog')}
            primaryTypographyProps={{ fontWeight: 500 }}
          />
        </MenuItem>

        {/* Заказы */}
        {canViewOrders && (
          <MenuItem onClick={() => handleNavigation('/orders')}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <OrdersIcon />
            </ListItemIcon>
            <ListItemText primary={t('navigation.orders')} />
          </MenuItem>
        )}

        {/* Склад */}
        {canViewStock && (
          <MenuItem onClick={() => handleNavigation('/stock')}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <StockIcon />
            </ListItemIcon>
            <ListItemText primary={t('navigation.stock')} />
          </MenuItem>
        )}

        <Divider sx={{ my: 1 }} />

        <ListItemText
          primary={t('common.administration')}
          primaryTypographyProps={{
            variant: 'caption',
            color: 'text.secondary',
            sx: { px: 2, display: 'block' },
          }}
        />

        {/* Администрирование */}
        {canViewAdmin && (
          <MenuItem onClick={() => handleNavigation('/admin')}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <AdminIcon />
            </ListItemIcon>
            <ListItemText primary={t('navigation.admin')} />
          </MenuItem>
        )}

        {/* Аналитика */}
        {canViewAnalytics && (
          <MenuItem onClick={() => handleNavigation('/admin/analytics')}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <AnalyticsIcon />
            </ListItemIcon>
            <ListItemText primary={t('navigation.analytics')} />
          </MenuItem>
        )}
      </Menu>
    </>
  );
}
