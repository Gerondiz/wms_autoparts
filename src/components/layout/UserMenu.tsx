'use client';

import { useTranslations } from 'next-intl';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  Avatar,
  useTheme,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Logout,
  Dashboard,
  Assignment,
  Inventory,
  AdminPanelSettings,
} from '@mui/icons-material';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from '@/i18n/routing';
import { useState } from 'react';
import { usePermission } from '@/lib/hooks/usePermission';

export default function UserMenu() {
  const t = useTranslations();
  const theme = useTheme();
  const router = useRouter();
  const { data: session } = useSession();
  const { hasPermission } = usePermission();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    handleClose();
    await signOut({ callbackUrl: '/' });
  };

  const handleProfile = () => {
    handleClose();
    // router.push('/profile'); // TODO: Страница профиля
  };

  const handleSettings = () => {
    handleClose();
    router.push('/settings');
  };

  // Проверка прав для пунктов меню
  const canViewAdmin = hasPermission('user_manage') || hasPermission('role_manage');
  const canViewOrders = hasPermission('order_view_all') || hasPermission('order_approve');
  const canViewStock = hasPermission('stock_manage');

  // Получаем инициалы пользователя
  const getInitials = () => {
    if (!session?.user?.name) return 'U';
    return session.user.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        size="small"
        aria-controls={open ? 'user-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        color="inherit"
      >
        <Avatar
          sx={{
            width: 32,
            height: 32,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            fontSize: '0.875rem',
          }}
        >
          {getInitials()}
        </Avatar>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        id="user-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 3,
          sx: {
            minWidth: 220,
            mt: 1.5,
          },
        }}
      >
        {/* Информация о пользователе */}
        <Box sx={{ px: 2, py: 1.5, mb: 1 }}>
          <Typography variant="subtitle2" fontWeight="600">
            {session?.user?.name || session?.user?.email}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {session?.user?.email}
          </Typography>
        </Box>

        <Divider />

        {/* Профиль */}
        <MenuItem onClick={handleProfile}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('common.profile')}</ListItemText>
        </MenuItem>

        {/* Настройки */}
        <MenuItem onClick={handleSettings}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('common.settings')}</ListItemText>
        </MenuItem>

        <Divider />

        {/* Ролевые пункты меню */}
        {canViewAdmin && (
          <MenuItem onClick={() => router.push('/admin')}>
            <ListItemIcon>
              <AdminPanelSettings fontSize="small" />
            </ListItemIcon>
            <ListItemText>{t('navigation.admin')}</ListItemText>
          </MenuItem>
        )}

        {canViewOrders && (
          <MenuItem onClick={() => router.push('/orders')}>
            <ListItemIcon>
              <Assignment fontSize="small" />
            </ListItemIcon>
            <ListItemText>{t('navigation.orders')}</ListItemText>
          </MenuItem>
        )}

        {canViewStock && (
          <MenuItem onClick={() => router.push('/stock')}>
            <ListItemIcon>
              <Inventory fontSize="small" />
            </ListItemIcon>
            <ListItemText>{t('navigation.stock')}</ListItemText>
          </MenuItem>
        )}

        <Divider />

        {/* Выход */}
        <MenuItem onClick={handleSignOut}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('auth.signOut')}</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
