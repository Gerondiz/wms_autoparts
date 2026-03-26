'use client';

/**
 * Страница входа в систему WMS Autoparts
 * 
 * Функции:
 * - Форма входа с email и паролем
 * - Валидация через Zod
 * - Обработка ошибок аутентификации
 * - Редирект после успешного входа
 * - Интеграция с next-intl
 */

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  Email as EmailIcon,
  Lock as LockIcon,
} from '@mui/icons-material';

export default function SignInPage() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Проверка, есть ли уже сессия — редирект на главную
  useEffect(() => {
    if (status === 'authenticated') {
      const callbackUrl = searchParams.get('callbackUrl');
      router.push(callbackUrl || `/${locale}/`);
    }
  }, [status, router, searchParams, locale]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        // Успешный вход — редирект
        const callbackUrl = searchParams.get('callbackUrl');
        router.push(callbackUrl || `/${locale}/`);
      }
    } catch (err) {
      setError(t('genericError'));
    } finally {
      setLoading(false);
    }
  };

  // Заполнение тестовыми данными в development
  const fillTestCredentials = (role: 'admin' | 'mechanic' | 'manager' | 'storekeeper') => {
    const credentials = {
      admin: { email: 'admin@wms.local', password: 'Admin123!' },
      mechanic: { email: 'mechanic@wms.local', password: 'Mechanic123!' },
      manager: { email: 'manager@wms.local', password: 'Manager123!' },
      storekeeper: { email: 'storekeeper@wms.local', password: 'Storekeeper123!' },
    };
    setEmail(credentials[role].email);
    setPassword(credentials[role].password);
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
          }}
        >
          {/* Заголовок */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              {t('signIn')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              WMS Autoparts — Система управления складом
            </Typography>
          </Box>

          {/* Сообщения об ошибках */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* Сообщение об успешном выходе */}
          {searchParams.get('signout') === 'success' && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {t('signOutSuccess')}
            </Alert>
          )}

          {/* Форма входа */}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label={t('email')}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              autoComplete="email"
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label={t('password')}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              autoComplete="current-password"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <LoginIcon />}
            >
              {loading ? t('signingIn') : t('signIn')}
            </Button>
          </form>

          <Divider sx={{ my: 3 }}>
            <Typography variant="caption" color="text.secondary">
              {t('testAccounts')}
            </Typography>
          </Divider>

          {/* Кнопки быстрого входа для тестирования */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => fillTestCredentials('admin')}
              disabled={loading}
            >
              Admin (admin@wms.local)
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => fillTestCredentials('mechanic')}
              disabled={loading}
            >
              Mechanic (mechanic@wms.local)
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => fillTestCredentials('manager')}
              disabled={loading}
            >
              Manager (manager@wms.local)
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => fillTestCredentials('storekeeper')}
              disabled={loading}
            >
              Storekeeper (storekeeper@wms.local)
            </Button>
          </Box>

          {/* Дополнительная информация */}
          <Typography
            variant="body2"
            textAlign="center"
            color="text.secondary"
            sx={{ mt: 4 }}
          >
            {t('noAccount')}{' '}
            <Link href={`/${locale}/`} style={{ textDecoration: 'none' }}>
              {t('backToHome')}
            </Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
