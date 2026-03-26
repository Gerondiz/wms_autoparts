'use client';

/**
 * Страница выхода из системы WMS Autoparts
 * 
 * Функции:
 * - Подтверждение выхода
 * - Обработка выхода через next-auth
 * - Редирект после выхода
 */

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { signOut } from 'next-auth/react';
import { useRouter } from '@/i18n/routing';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Logout as LogoutIcon, Cancel as CancelIcon } from '@mui/icons-material';

export default function SignOutPage() {
  const t = useTranslations('auth');
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignOut = async () => {
    setLoading(true);
    setError('');

    try {
      await signOut({
        redirect: true,
        callbackUrl: '/auth/signin?signout=success',
      });
    } catch (err) {
      setError(t('signOutError'));
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

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
          {/* Иконка выхода */}
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              backgroundColor: 'warning.light',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
            }}
          >
            <LogoutIcon sx={{ fontSize: 40, color: 'warning.dark' }} />
          </Box>

          {/* Заголовок */}
          <Typography variant="h5" component="h1" gutterBottom fontWeight="bold">
            {t('signOut')}
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            {t('signOutConfirm')}
          </Typography>

          {/* Сообщение об ошибке */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

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
              color="warning"
              onClick={handleSignOut}
              disabled={loading}
              size="large"
              startIcon={loading ? <CircularProgress size={20} /> : <LogoutIcon />}
            >
              {loading ? t('signingOut') : t('signOut')}
            </Button>

            <Button
              variant="outlined"
              onClick={handleCancel}
              disabled={loading}
              size="large"
              startIcon={<CancelIcon />}
            >
              {t('cancel')}
            </Button>
          </Box>

          {/* Дополнительная информация */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}
          >
            {t('signOutInfo')}
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
