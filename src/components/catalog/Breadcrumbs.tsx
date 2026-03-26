'use client';

import { useTranslations } from 'next-intl';
import { Box, Breadcrumbs as MuiBreadcrumbs, Link, Typography, Chip } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';
import { Link as RouterLink } from '@/i18n/routing';
import { useLocale } from 'next-intl';

export interface BreadcrumbItem {
  id: number;
  name: string;
  path: string;
}

interface BreadcrumbsProps {
  path: BreadcrumbItem[];
  currentLocale: string;
}

export default function Breadcrumbs({ path, currentLocale }: BreadcrumbsProps) {
  const t = useTranslations('catalog');
  const locale = useLocale();

  if (!path || path.length === 0) {
    return null;
  }

  // Фильтруем корневой узел "root" из отображения
  const displayPath = path.filter((item) => item.name !== 'root');

  if (displayPath.length === 0) {
    return (
      <Box sx={{ py: 1 }}>
        <Typography variant="body1" color="text.primary">
          {t('allParts') || 'Все запчасти'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 1 }}>
      <MuiBreadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
        maxItems={5}
        itemsAfterCollapse={2}
        itemsBeforeCollapse={2}
      >
        {/* Главная страница каталога */}
        <Link
          underline="hover"
          color="text.primary"
          component={RouterLink}
          href={`/${locale}/catalog`}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            fontWeight: 500,
            '&:hover': {
              color: 'primary.main',
            },
          }}
        >
          <HomeIcon fontSize="small" />
          {t('catalog') || 'Каталог'}
        </Link>

        {/* Элементы пути */}
        {displayPath.map((item, index) => {
          const isLast = index === displayPath.length - 1;

          if (isLast) {
            return (
              <Chip
                key={item.id}
                label={item.name}
                size="small"
                color="primary"
                variant="outlined"
              />
            );
          }

          return (
            <Link
              key={item.id}
              underline="hover"
              color="text.secondary"
              component={RouterLink}
              href={`/${locale}/catalog?nodeId=${item.id}`}
              sx={{
                fontWeight: 500,
                '&:hover': {
                  color: 'primary.main',
                },
              }}
            >
              {item.name}
            </Link>
          );
        })}
      </MuiBreadcrumbs>
    </Box>
  );
}
