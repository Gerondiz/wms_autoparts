'use client';

import { Box, Typography, Paper, alpha } from '@mui/material';
import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  trend?: {
    value: number;
    label: string;
  };
  subtitle?: string;
}

const colorMap = {
  primary: {
    bg: 'primary.main',
    light: 'primary.light',
    contrast: 'primary.contrastText',
  },
  secondary: {
    bg: 'secondary.main',
    light: 'secondary.light',
    contrast: 'secondary.contrastText',
  },
  success: {
    bg: 'success.main',
    light: 'success.light',
    contrast: 'success.contrastText',
  },
  warning: {
    bg: 'warning.main',
    light: 'warning.light',
    contrast: 'warning.contrastText',
  },
  error: {
    bg: 'error.main',
    light: 'error.light',
    contrast: 'error.contrastText',
  },
  info: {
    bg: 'info.main',
    light: 'info.light',
    contrast: 'info.contrastText',
  },
};

export default function StatCard({
  title,
  value,
  icon,
  color = 'primary',
  trend,
  subtitle,
}: StatCardProps) {
  const colors = colorMap[color];

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 1, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}
          >
            {title}
          </Typography>
          
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            {value}
          </Typography>

          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}

          {trend && (
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                mt: 1,
                px: 1,
                py: 0.5,
                borderRadius: 1,
                bgcolor: trend.value >= 0 
                  ? alpha('#4caf50', 0.1) 
                  : alpha('#f44336', 0.1),
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: trend.value >= 0 ? 'success.main' : 'error.main',
                  fontWeight: 600,
                }}
              >
                {trend.value >= 0 ? '+' : ''}{trend.value}%
              </Typography>
              <Typography
                variant="caption"
                sx={{ ml: 0.5, color: 'text.secondary' }}
              >
                {trend.label}
              </Typography>
            </Box>
          )}
        </Box>

        {icon && (
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(colors.bg, 0.1),
              color: colors.bg,
            }}
          >
            {icon}
          </Box>
        )}
      </Box>
    </Paper>
  );
}
