'use client';

/**
 * Страница доступа запрещён
 * 
 * Отображается когда пользователь авторизован,
 * но не имеет необходимых разрешений для доступа к странице
 */

import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { Link } from '@/i18n/routing';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
} from '@mui/material';
import {
  Block as BlockIcon,
  Home as HomeIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';

export default function AccessDeniedPage() {
  const t = useTranslations('auth');
  const router = useRouter();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        backgroundColor: 'background.default',
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 2,
            textAlign: 'center',
          }}
        >
          {/* Иконка запрета */}
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              backgroundColor: 'error.light',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
            }}
          >
            <BlockIcon sx={{ fontSize: 40, color: 'error.dark' }} />
          </Box>

          {/* Заголовок */}
          <Typography variant="h5" component="h1" gutterBottom fontWeight="bold">
            {t('accessDenied')}
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            {t('accessDeniedMessage')}
          </Typography>

          {/* Информация о правах */}
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              mb: 4,
              backgroundColor: 'warning.light',
              borderColor: 'warning.dark',
            }}
          >
            <Typography variant="body2" color="warning.dark">
              {t('accessDeniedHelp')}
            </Typography>
          </Paper>

          {/* Кнопки действий */}
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Button
              variant="contained"
              onClick={() => router.push('/')}
              size="large"
              startIcon={<HomeIcon />}
            >
              {t('backToHome')}
            </Button>

            <Button
              variant="outlined"
              onClick={() => router.back()}
              size="large"
              startIcon={<ArrowBackIcon />}
            >
              {t('goBack')}
            </Button>

            <Button
              component={Link}
              href="/auth/signout"
              variant="outlined"
              size="large"
            >
              {t('signOut')}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
