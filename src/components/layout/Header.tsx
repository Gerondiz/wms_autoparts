'use client';

import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Tooltip,
  useTheme,
} from '@mui/material';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import { useRouter } from '@/i18n/routing';
import { useSession } from 'next-auth/react';
import LanguageSwitcher from './LanguageSwitcher';
import UserMenu from './UserMenu';
import MiniCart from '../cart/MiniCart';
import NavigationMenu from './NavigationMenu';
import { isRTL } from '@/i18n/config';

export default function Header() {
  const t = useTranslations();
  const theme = useTheme();
  const router = useRouter();
  const { data: session } = useSession();
  const locale = useLocale() as 'ru' | 'en' | 'ar';
  const isRtl = isRTL(locale);

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        bgcolor: 'background.paper',
        color: 'text.primary',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
      }}
    >
      <Toolbar disableGutters sx={{ flexDirection: isRtl ? 'row-reverse' : 'row' }}>
        {/* Навигационное меню (выпадающее) */}
        <NavigationMenu />

        {/* Логотип / Название */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            ml: isRtl ? { xs: 2, md: 4 } : { xs: 1, md: 2 },
            mr: isRtl ? { xs: 1, md: 2 } : { xs: 2, md: 4 },
            cursor: 'pointer',
          }}
          onClick={() => router.push('/catalog')}
        >
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1rem', md: '1.25rem' },
              color: 'primary.main',
            }}
          >
            WMS Autoparts
          </Typography>
        </Box>

        {/* Навигация для десктопа */}
        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              fontSize: '0.875rem',
            }}
          >
            Система управления заказами запчастей
          </Typography>
        </Box>

        {/* Правая часть: Корзина, Язык, Профиль */}
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            flexDirection: isRtl ? 'row-reverse' : 'row',
          }}
        >
          {/* Корзина */}
          <Tooltip title={t('common.cart')}>
            <MiniCart />
          </Tooltip>

          {/* Переключатель языка - dropdown вместо icons */}
          <Tooltip title={t('common.language')}>
            <Box>
              <LanguageSwitcher variant="dropdown" showFlags showNames showCurrentLocale={false} />
            </Box>
          </Tooltip>

          {/* Профиль пользователя */}
          {session ? (
            <UserMenu />
          ) : (
            <Tooltip title={t('auth.signIn')}>
              <IconButton
                color="inherit"
                onClick={() => router.push('/auth/signin')}
                size="large"
              >
                <AccountCircleOutlinedIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
