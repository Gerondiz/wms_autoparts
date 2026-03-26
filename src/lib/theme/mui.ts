/**
 * MUI Theme с поддержкой RTL
 * 
 * Создает тему Material-UI с учётом направления письма
 * для арабского языка (RTL)
 */

import { createTheme, Direction } from '@mui/material/styles';
import type { Locale } from '@/i18n/config';

/**
 * Создание MUI темы с RTL поддержкой
 * 
 * @param locale - Текущая локаль
 * @param mode - Режим темы (light/dark)
 */
export function createMuiTheme(locale: Locale, mode: 'light' | 'dark' = 'light') {
  const direction: Direction = locale === 'ar' ? 'rtl' : 'ltr';

  const theme = createTheme({
    direction,
    palette: {
      mode,
      primary: {
        main: '#3B82F6',
        light: '#60A5FA',
        dark: '#2563EB',
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: '#6B7280',
        light: '#9CA3AF',
        dark: '#4B5563',
        contrastText: '#FFFFFF',
      },
      success: {
        main: '#22C55E',
        light: '#4ADE80',
        dark: '#16A34A',
        contrastText: '#FFFFFF',
      },
      warning: {
        main: '#EAB308',
        light: '#FACC15',
        dark: '#CA8A04',
        contrastText: '#FFFFFF',
      },
      error: {
        main: '#EF4444',
        light: '#F87171',
        dark: '#DC2626',
        contrastText: '#FFFFFF',
      },
      info: {
        main: '#3B82F6',
        light: '#60A5FA',
        dark: '#2563EB',
        contrastText: '#FFFFFF',
      },
      background: {
        default: mode === 'light' ? '#F3F4F6' : '#111827',
        paper: mode === 'light' ? '#FFFFFF' : '#1F2937',
      },
      text: {
        primary: mode === 'light' ? '#111827' : '#F9FAFB',
        secondary: mode === 'light' ? '#6B7280' : '#9CA3AF',
      },
    },
    typography: {
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      h1: {
        fontWeight: 700,
        fontSize: '2.5rem',
        lineHeight: 1.2,
      },
      h2: {
        fontWeight: 700,
        fontSize: '2rem',
        lineHeight: 1.25,
      },
      h3: {
        fontWeight: 600,
        fontSize: '1.5rem',
        lineHeight: 1.3,
      },
      h4: {
        fontWeight: 600,
        fontSize: '1.25rem',
        lineHeight: 1.35,
      },
      h5: {
        fontWeight: 600,
        fontSize: '1.125rem',
        lineHeight: 1.4,
      },
      h6: {
        fontWeight: 600,
        fontSize: '1rem',
        lineHeight: 1.45,
      },
      subtitle1: {
        fontSize: '1rem',
        fontWeight: 500,
        lineHeight: 1.5,
      },
      subtitle2: {
        fontSize: '0.875rem',
        fontWeight: 500,
        lineHeight: 1.5,
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.5,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.5,
      },
      button: {
        textTransform: 'none' as const,
        fontWeight: 500,
      },
      caption: {
        fontSize: '0.75rem',
        lineHeight: 1.5,
      },
      overline: {
        fontSize: '0.75rem',
        fontWeight: 600,
        textTransform: 'uppercase' as const,
        lineHeight: 1.5,
      },
    },
    shape: {
      borderRadius: 8,
    },
    shadows: [
      'none',
      '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      '0 25px 50px -12px rgb(0 0 0 / 0.25)',
      '0 25px 50px -12px rgb(0 0 0 / 0.25)',
      '0 25px 50px -12px rgb(0 0 0 / 0.25)',
      '0 25px 50px -12px rgb(0 0 0 / 0.25)',
      '0 25px 50px -12px rgb(0 0 0 / 0.25)',
      '0 25px 50px -12px rgb(0 0 0 / 0.25)',
      '0 25px 50px -12px rgb(0 0 0 / 0.25)',
      '0 25px 50px -12px rgb(0 0 0 / 0.25)',
      '0 25px 50px -12px rgb(0 0 0 / 0.25)',
      '0 25px 50px -12px rgb(0 0 0 / 0.25)',
      '0 25px 50px -12px rgb(0 0 0 / 0.25)',
      '0 25px 50px -12px rgb(0 0 0 / 0.25)',
      '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    ],
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '8px 16px',
            fontWeight: 500,
            transition: 'all 150ms ease',
          },
          contained: {
            boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
            '&:hover': {
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            fontWeight: 500,
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 16,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: 'none',
            borderLeft: 'none',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'light' ? '#F9FAFB' : '#1F2937',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            padding: '12px 16px',
            borderBottom: `1px solid ${mode === 'light' ? '#E5E7EB' : '#374151'}`,
          },
          head: {
            fontWeight: 600,
            fontSize: '0.75rem',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.05em',
          },
        },
      },
      // RTL специфичные стили
      MuiListItemIcon: {
        styleOverrides: {
          root: {
            ...(direction === 'rtl' && {
              minWidth: 'auto',
              marginRight: 0,
              marginLeft: 16,
            }),
          },
        },
      },
      MuiListItemText: {
        styleOverrides: {
          root: {
            ...(direction === 'rtl' && {
              textAlign: 'right',
            }),
          },
        },
      },
      MuiList: {
        styleOverrides: {
          root: {
            ...(direction === 'rtl' && {
              direction: 'rtl',
            }),
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            ...(direction === 'rtl' && {
              textAlign: 'right',
            }),
          },
        },
      },
      MuiInputAdornment: {
        styleOverrides: {
          root: {
            ...(direction === 'rtl' && {
              marginLeft: 0,
              marginRight: 0,
            }),
          },
          positionStart: {
            ...(direction === 'rtl' && {
              marginRight: 0,
              marginLeft: 8,
            }),
          },
          positionEnd: {
            ...(direction === 'rtl' && {
              marginLeft: 0,
              marginRight: 8,
            }),
          },
        },
      },
      MuiFormHelperText: {
        styleOverrides: {
          root: {
            ...(direction === 'rtl' && {
              textAlign: 'right',
            }),
          },
        },
      },
      MuiFormControlLabel: {
        styleOverrides: {
          root: {
            ...(direction === 'rtl' && {
              marginLeft: 0,
              marginRight: -11,
            }),
          },
          label: {
            ...(direction === 'rtl' && {
              direction: 'rtl',
            }),
          },
        },
      },
      MuiCheckbox: {
        styleOverrides: {
          root: {
            ...(direction === 'rtl' && {
              marginRight: -9,
              marginLeft: 9,
            }),
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          root: {
            ...(direction === 'rtl' && {
              marginRight: -9,
              marginLeft: 9,
            }),
          },
        },
      },
      MuiRadio: {
        styleOverrides: {
          root: {
            ...(direction === 'rtl' && {
              marginRight: -9,
              marginLeft: 9,
            }),
          },
        },
      },
      MuiSvgIcon: {
        styleOverrides: {
          root: {
            fontSize: '1.25rem',
          },
        },
      },
      MuiIcon: {
        styleOverrides: {
          root: {
            fontSize: '1.25rem',
          },
        },
      },
    },
  });

  return theme;
}

/**
 * Хук для получения MUI темы с учётом локали и режима
 * 
 * @example
 * ```tsx
 * 'use client';
 * import { useThemeMode } from '@/lib/hooks/useThemeMode';
 * import { useI18n } from '@/lib/hooks/useI18n';
 * import { createMuiTheme } from '@/lib/theme/mui';
 * import { ThemeProvider } from '@mui/material/styles';
 * 
 * export default function App({ children }) {
 *   const { locale } = useI18n();
 *   const { mode } = useThemeMode();
 *   const theme = createMuiTheme(locale, mode);
 * 
 *   return (
 *     <ThemeProvider theme={theme}>
 *       {children}
 *     </ThemeProvider>
 *   );
 * }
 * ```
 */
export function getMuiTheme(locale: Locale, mode: 'light' | 'dark' = 'light') {
  return createMuiTheme(locale, mode);
}

export default createMuiTheme;
