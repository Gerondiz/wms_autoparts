'use client';

import { useTranslations } from 'next-intl';
import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  alpha,
  Divider,
  Chip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Category as CategoryIcon,
  Build as BuildIcon,
} from '@mui/icons-material';
import { useSearch } from '@/lib/hooks/api/useSearch';
import { Link } from '@/i18n/routing';
import { useLocale } from 'next-intl';

interface SearchBarProps {
  onPartSelect?: (partId: number) => void;
  onNodeSelect?: (nodeId: number) => void;
}

export default function SearchBar({ onPartSelect, onNodeSelect }: SearchBarProps) {
  const t = useTranslations('catalog');
  const tCommon = useTranslations('common');
  const locale = useLocale();

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    query,
    results,
    isLoading,
    hasResults,
    onQueryChange,
    clearSearch,
  } = useSearch({
    debounceMs: 300,
    minQueryLength: 2,
  });

  // Закрытие по клику вне
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFocus = useCallback(() => {
    if (query.length >= 2) {
      setIsOpen(true);
    }
  }, [query]);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onQueryChange(event.target.value);
      setIsOpen(true);
    },
    [onQueryChange]
  );

  const handleClear = useCallback(() => {
    clearSearch();
    setIsOpen(false);
  }, [clearSearch]);

  const handlePartClick = useCallback(
    (partId: number) => {
      onPartSelect?.(partId);
      setIsOpen(false);
      clearSearch();
    },
    [onPartSelect, clearSearch]
  );

  const handleNodeClick = useCallback(
    (nodeId: number) => {
      onNodeSelect?.(nodeId);
      setIsOpen(false);
      clearSearch();
    },
    [onNodeSelect, clearSearch]
  );

  const hasParts = results.parts && results.parts.length > 0;
  const hasNodes = results.nodes && results.nodes.length > 0;

  return (
    <Box ref={containerRef} sx={{ position: 'relative', width: '100%', maxWidth: 600 }}>
      <TextField
        fullWidth
        size="small"
        placeholder={`${t('search')}...`}
        value={query}
        onChange={handleChange}
        onFocus={handleFocus}
        InputProps={{
          startAdornment: (
            <SearchIcon
              sx={{
                color: 'text.secondary',
                mr: 1,
              }}
              fontSize="small"
            />
          ),
          endAdornment: query && (
            <IconButton size="small" onClick={handleClear} edge="end">
              <ClearIcon fontSize="small" />
            </IconButton>
          ),
          sx: {
            borderRadius: 2,
            bgcolor: (theme) =>
              theme.palette.mode === 'dark'
                ? alpha(theme.palette.common.white, 0.05)
                : alpha(theme.palette.common.black, 0.03),
            '&:hover': {
              bgcolor: (theme) =>
                theme.palette.mode === 'dark'
                  ? alpha(theme.palette.common.white, 0.1)
                  : alpha(theme.palette.common.black, 0.06),
            },
            '&.Mui-focused': {
              bgcolor: (theme) =>
                theme.palette.mode === 'dark'
                  ? alpha(theme.palette.common.white, 0.1)
                  : alpha(theme.palette.common.black, 0.06),
              boxShadow: (theme) =>
                `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
            },
          },
        }}
      />

      {/* Выпадающие результаты */}
      {isOpen && (query.length >= 2) && (
        <Paper
          elevation={8}
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            mt: 0.5,
            maxHeight: 400,
            overflow: 'auto',
            zIndex: 1300,
          }}
        >
          {isLoading && (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {tCommon('loading')}
              </Typography>
            </Box>
          )}

          {!isLoading && !hasResults && query.length >= 2 && (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {t('noResults') || 'Ничего не найдено'}
              </Typography>
            </Box>
          )}

          {!isLoading && hasResults && (
            <List sx={{ py: 0 }}>
              {/* Запчасти (сначала) */}
              {hasParts && (
                <>
                  <ListItem sx={{ px: 2, py: 1 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={600}
                      textTransform="uppercase"
                    >
                      {t('parts')}
                    </Typography>
                  </ListItem>
                  {results.parts.slice(0, 5).map((part) => (
                    <ListItem key={part.id} sx={{ px: 0, py: 0 }}>
                      <ListItemButton
                        onClick={() => handlePartClick(part.id)}
                        sx={{
                          py: 1.5,
                          '&:hover': {
                            bgcolor: 'action.hover',
                          },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <BuildIcon color="action" />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" fontWeight={500}>
                                {part.name}
                              </Typography>
                              <Chip
                                label={part.partNumber}
                                size="small"
                                variant="outlined"
                                sx={{ height: 20, fontSize: '0.7rem' }}
                              />
                            </Box>
                          }
                          secondary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="caption" color="text.secondary">
                                {part.hierarchyName}
                              </Typography>
                              <Typography variant="caption" color="primary.main" fontWeight={600}>
                                {part.price} ₽
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                  {results.parts.length > 5 && (
                    <ListItem sx={{ px: 2, py: 1 }}>
                      <Box
                        component={Link}
                        href={`/${locale}/catalog?q=${encodeURIComponent(query)}`}
                        sx={{
                          fontSize: '0.875rem',
                          color: 'primary.main',
                          textDecoration: 'none',
                          '&:hover': {
                            textDecoration: 'underline',
                          },
                        }}
                      >
                        {t('showAllParts') || `Показать все (${results.parts.length})`} →
                      </Box>
                    </ListItem>
                  )}
                  <Divider />
                </>
              )}

              {/* Узлы иерархии */}
              {hasNodes && (
                <>
                  <ListItem sx={{ px: 2, py: 1 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={600}
                      textTransform="uppercase"
                    >
                      {t('categories') || 'Категории'}
                    </Typography>
                  </ListItem>
                  {results.nodes.slice(0, 5).map((node) => (
                    <ListItem key={node.id} sx={{ px: 0, py: 0 }}>
                      <ListItemButton
                        onClick={() => handleNodeClick(node.id)}
                        sx={{
                          py: 1.5,
                          '&:hover': {
                            bgcolor: 'action.hover',
                          },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <CategoryIcon color="action" />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" fontWeight={500}>
                                {node.name}
                              </Typography>
                              <Chip
                                label={node.partsCount}
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{ height: 20, fontSize: '0.7rem' }}
                              />
                            </Box>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary">
                              {node.nodeTypeName}
                            </Typography>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                  {results.nodes.length > 5 && (
                    <ListItem sx={{ px: 2, py: 1 }}>
                      <Box
                        component={Link}
                        href={`/${locale}/catalog?q=${encodeURIComponent(query)}`}
                        sx={{
                          fontSize: '0.875rem',
                          color: 'primary.main',
                          textDecoration: 'none',
                          '&:hover': {
                            textDecoration: 'underline',
                          },
                        }}
                      >
                        {t('showAllCategories') || `Показать все (${results.nodes.length})`} →
                      </Box>
                    </ListItem>
                  )}
                </>
              )}
            </List>
          )}
        </Paper>
      )}
    </Box>
  );
}
