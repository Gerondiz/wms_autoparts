'use client';

import { ReactNode, useState } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CssBaseline,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useTheme,
  Chip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Analytics as AnalyticsIcon,
  Folder as HierarchyIcon,
  Inventory as PartsIcon,
  People as UsersIcon,
  Badge as RolesIcon,
  Menu as MenuIcon,
  AccountCircle,
  Logout,
  Brightness4,
  Brightness7,
} from '@mui/icons-material';
import { useSession, signOut } from 'next-auth/react';

const DRAWER_WIDTH = 260;

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
}

interface NavItem {
  key: string;
  label: string;
  icon: ReactNode;
  href: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const t = useTranslations('admin');
  const pathname = usePathname();
  const router = useRouter();
  const theme = useTheme();
  const { data: session } = useSession();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [darkMode, setDarkMode] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleProfileMenuClose();
    await signOut({ callbackUrl: '/auth/signin' });
  };

  const handleThemeToggle = () => {
    setDarkMode(!darkMode);
    // Здесь можно добавить логику переключения темы
  };

  const navItems: NavItem[] = [
    {
      key: 'dashboard',
      label: t('menu.dashboard'),
      icon: <DashboardIcon />,
      href: '/admin',
    },
    {
      key: 'analytics',
      label: t('menu.analytics'),
      icon: <AnalyticsIcon />,
      href: '/admin/analytics',
    },
    {
      key: 'hierarchy',
      label: t('menu.hierarchy'),
      icon: <HierarchyIcon />,
      href: '/admin/hierarchy',
    },
    {
      key: 'parts',
      label: t('menu.parts'),
      icon: <PartsIcon />,
      href: '/admin/parts',
    },
    {
      key: 'users',
      label: t('menu.users'),
      icon: <UsersIcon />,
      href: '/admin/users',
    },
    {
      key: 'roles',
      label: t('menu.roles'),
      icon: <RolesIcon />,
      href: '/admin/roles',
    },
  ];

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700 }}>
          WMS Autoparts
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <ListItem key={item.key} disablePadding>
              <ListItemButton
                selected={isActive}
                onClick={() => router.push(item.href)}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: 'action.selected',
                  },
                  '&.Mui-selected:hover': {
                    backgroundColor: 'action.selectedHover',
                  },
                }}
              >
                <ListItemIcon sx={{ color: isActive ? 'primary.main' : 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { sm: `${DRAWER_WIDTH}px` },
          backgroundColor: 'background.paper',
          color: 'text.primary',
          boxShadow: 'none',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {title || t('title')}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton color="inherit" onClick={handleThemeToggle}>
              {darkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
            
            <IconButton color="inherit" onClick={handleProfileMenuOpen}>
              <Avatar
                sx={{ 
                  width: 32, 
                  height: 32,
                  bgcolor: 'primary.main',
                  fontSize: '0.875rem'
                }}
              >
                {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || 'U'}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: 8,
        }}
      >
        {children}
      </Box>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2">{session?.user?.name || 'User'}</Typography>
          <Typography variant="caption" color="text.secondary">
            {session?.user?.email}
          </Typography>
          {session?.user?.roleName && (
            <Chip
              label={session.user.roleName}
              size="small"
              sx={{ mt: 0.5 }}
            />
          )}
        </Box>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          {t('common.close')}
        </MenuItem>
      </Menu>
    </Box>
  );
}
