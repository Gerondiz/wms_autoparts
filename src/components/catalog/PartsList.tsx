'use client';

import { useTranslations } from 'next-intl';
import { useState, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  IconButton,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  Chip,
  alpha,
  Skeleton,
} from '@mui/material';
import {
  ViewModule as ViewModuleIcon,
  ViewList as ViewListIcon,
  AddShoppingCart as AddCartIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { Part } from '@/lib/hooks/api/useParts';
import { useCartStore } from '@/lib/stores/cart.store';

type ViewMode = 'grid' | 'table';

interface PartsListProps {
  parts: Part[];
  total: number;
  page: number;
  limit: number;
  isLoading?: boolean;
  onPageChange: (newPage: number) => void;
  onPartClick?: (partId: number) => void;
}

interface PartCardProps {
  part: Part;
  onAddToCart: (part: Part) => void;
}

// Карточка запчасти для режима плитки
function PartCard({ part, onAddToCart }: PartCardProps) {
  const t = useTranslations('catalog');
  const items = useCartStore((state) => state.items);
  const isInCart = items.some((item) => item.partId === part.id);

  const imageUrl = part.primaryImage || '/images/placeholder-part.png';

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        },
        position: 'relative',
      }}
    >
      {/* Изображение */}
      <Box
        sx={{
          position: 'relative',
          pt: '75%', // 4:3 aspect ratio
          bgcolor: 'grey.100',
          overflow: 'hidden',
        }}
      >
        <CardMedia
          component="img"
          image={imageUrl}
          alt={part.name}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/placeholder-part.png';
          }}
        />
        {/* Бейдж остатка */}
        <Chip
          label={part.stock > 0 ? `${part.stock} шт.` : 'Нет в наличии'}
          size="small"
          color={part.stock > 0 ? 'success' : 'default'}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            fontWeight: 600,
            fontSize: '0.7rem',
          }}
        />
      </Box>

      <CardContent sx={{ flexGrow: 1 }}>
        {/* Артикул */}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontWeight: 500, fontFamily: 'monospace' }}
        >
          {part.partNumber}
        </Typography>

        {/* Название */}
        <Typography
          variant="h6"
          component="h3"
          sx={{
            mt: 0.5,
            mb: 1,
            fontSize: '1rem',
            fontWeight: 600,
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {part.name}
        </Typography>

        {/* Цена */}
        <Typography
          variant="h6"
          color="primary.main"
          sx={{ fontWeight: 700, fontSize: '1.25rem' }}
        >
          {part.price} ₽
        </Typography>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          fullWidth
          variant={isInCart ? 'outlined' : 'contained'}
          startIcon={isInCart ? <CheckCircleIcon /> : <AddCartIcon />}
          onClick={() => onAddToCart(part)}
          color={isInCart ? 'success' : 'primary'}
          size="small"
        >
          {isInCart ? t('inCart') || 'В заказе' : t('addToCart')}
        </Button>
      </CardActions>
    </Card>
  );
}

// Строка таблицы запчасти
function PartTableRow({
  part,
  onAddToCart,
}: {
  part: Part;
  onAddToCart: (part: Part) => void;
}) {
  const t = useTranslations('catalog');
  const items = useCartStore((state) => state.items);
  const isInCart = items.some((item) => item.partId === part.id);

  return (
    <TableRow
      hover
      sx={{
        '&:hover': {
          bgcolor: 'action.hover',
        },
      }}
    >
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            component="img"
            src={part.primaryImage || '/images/placeholder-part.png'}
            alt={part.name}
            sx={{
              width: 48,
              height: 48,
              objectFit: 'cover',
              borderRadius: 1,
              bgcolor: 'grey.100',
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/placeholder-part.png';
            }}
          />
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {part.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" fontFamily="monospace">
              {part.partNumber}
            </Typography>
          </Box>
        </Box>
      </TableCell>
      <TableCell align="right">
        <Typography variant="body2" fontWeight={600} color="primary.main">
          {part.price} ₽
        </Typography>
      </TableCell>
      <TableCell align="center">
        <Chip
          label={part.stock > 0 ? `${part.stock} шт.` : 'Нет в наличии'}
          size="small"
          color={part.stock > 0 ? 'success' : 'default'}
          sx={{ fontWeight: 600 }}
        />
      </TableCell>
      <TableCell align="right">
        <Tooltip title={isInCart ? t('inCart') || 'В заказе' : t('addToCart')}>
          <IconButton
            onClick={() => onAddToCart(part)}
            color={isInCart ? 'success' : 'primary'}
          >
            {isInCart ? <CheckCircleIcon /> : <AddCartIcon />}
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}

// Skeleton для загрузки
function PartCardSkeleton() {
  return (
    <Card sx={{ height: '100%' }}>
      <Skeleton variant="rectangular" height={180} />
      <CardContent>
        <Skeleton variant="text" width="40%" height={20} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="90%" height={24} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="60%" height={24} />
      </CardContent>
      <CardActions>
        <Skeleton variant="rectangular" width="100%" height={36} />
      </CardActions>
    </Card>
  );
}

export default function PartsList({
  parts,
  total,
  page,
  limit,
  isLoading = false,
  onPageChange,
  onPartClick,
}: PartsListProps) {
  const t = useTranslations('catalog');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const addItem = useCartStore((state) => state.addItem);

  const handleViewModeChange = useCallback(
    (_event: React.MouseEvent<HTMLElement>, newMode: ViewMode | null) => {
      if (newMode) {
        setViewMode(newMode);
      }
    },
    []
  );

  const handleAddToCart = useCallback(
    (part: Part) => {
      addItem({
        partId: part.id,
        partNumber: part.partNumber,
        name: part.name,
        quantity: 1,
      });
    },
    [addItem]
  );

  const handleChangePage = useCallback(
    (_event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
      onPageChange(newPage + 1); // API использует 1-based indexing
    },
    [onPageChange]
  );

  const totalPages = Math.ceil(total / limit);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Панель управления видом */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
          pb: 2,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {total} {t('items') || 'запчастей'}
        </Typography>

        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          size="small"
          color="primary"
        >
          <ToggleButton value="grid" aria-label="grid view">
            <ViewModuleIcon fontSize="small" />
          </ToggleButton>
          <ToggleButton value="table" aria-label="table view">
            <ViewListIcon fontSize="small" />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Контент */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {isLoading ? (
          // Skeletons для загрузки
          viewMode === 'grid' ? (
            <Grid container spacing={2}>
              {Array.from({ length: 6 }).map((_, i) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                  <PartCardSkeleton />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} variant="rectangular" height={64} />
              ))}
            </Box>
          )
        ) : parts.length === 0 ? (
          // Пустое состояние
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              py: 8,
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {t('noParts') || 'Запчасти не найдены'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('noPartsHint') || 'Выберите другую категорию или измените параметры поиска'}
            </Typography>
          </Box>
        ) : viewMode === 'grid' ? (
          // Режим плитки
          <Grid container spacing={2}>
            {parts.map((part) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={part.id}>
                <PartCard part={part} onAddToCart={handleAddToCart} />
              </Grid>
            ))}
          </Grid>
        ) : (
          // Режим таблицы
          <TableContainer>
            <Table size="medium">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ minWidth: 280 }}>{t('part')}</TableCell>
                  <TableCell align="right">{t('price')}</TableCell>
                  <TableCell align="center">{t('stock')}</TableCell>
                  <TableCell align="right">{t('actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {parts.map((part) => (
                  <PartTableRow
                    key={part.id}
                    part={part}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Пагинация */}
      {totalPages > 1 && (
        <TablePagination
          component="div"
          count={total}
          page={page - 1}
          onPageChange={handleChangePage}
          rowsPerPage={limit}
          rowsPerPageOptions={[10, 20, 50, 100]}
          onRowsPerPageChange={(e) => {
            // Можно добавить обработку изменения количества на странице
          }}
          labelDisplayedRows={({ from, to, count }) =>
            `${from}–${to} ${t('of') || 'из'} ${count}`
          }
          sx={{
            borderTop: 1,
            borderColor: 'divider',
            mt: 'auto',
          }}
        />
      )}
    </Box>
  );
}
