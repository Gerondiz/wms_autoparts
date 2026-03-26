'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TablePagination,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
  ImageNotSupported as RemoveImageIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';

interface HierarchyNode {
  id: number;
  name: string;
}

interface PartImage {
  id: number;
  imageUrl: string;
  isPrimary: boolean;
}

interface Part {
  id: number;
  name: string;
  partNumber: string;
  description?: string;
  stock: number;
  price?: string;
  minStockLevel: number;
  location?: string;
  hierarchyId: number;
  hierarchyName?: string;
  specifications?: Record<string, any>;
  images?: PartImage[];
}

interface PartsManagerProps {
  selectedNodeId?: number | null;
}

export default function PartsManager({ selectedNodeId }: PartsManagerProps) {
  const t = useTranslations('admin');
  
  const [parts, setParts] = useState<Part[]>([]);
  const [hierarchyNodes, setHierarchyNodes] = useState<HierarchyNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [totalCount, setTotalCount] = useState(0);
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    partNumber: '',
    description: '',
    stock: 0,
    price: '',
    minStockLevel: 0,
    location: '',
    hierarchyId: '' as number | '',
    specifications: '{}',
  });
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Загрузка запчастей
  const loadParts = useCallback(async () => {
    setLoading(true);
    try {
      const nodeId = selectedNodeId || 1; // Default to root if not selected
      const response = await fetch(`/api/parts?nodeId=${nodeId}&page=${paginationModel.page + 1}&limit=${paginationModel.pageSize}`);
      const result = await response.json();
      
      if (result.success) {
        setParts(result.data.items || []);
        setTotalCount(result.data.total || 0);
      }
    } catch (error) {
      console.error('Error loading parts:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedNodeId, paginationModel]);

  // Загрузка иерархии для селекта
  const loadHierarchyNodes = async () => {
    try {
      const response = await fetch('/api/hierarchy');
      const result = await response.json();
      
      if (result.success) {
        setHierarchyNodes(result.data || []);
      }
    } catch (error) {
      console.error('Error loading hierarchy:', error);
    }
  };

  useEffect(() => {
    loadParts();
    loadHierarchyNodes();
  }, [loadParts]);

  // Обработчики для диалогов
  const handleOpenCreate = () => {
    setFormData({
      name: '',
      partNumber: '',
      description: '',
      stock: 0,
      price: '',
      minStockLevel: 0,
      location: '',
      hierarchyId: selectedNodeId || '',
      specifications: '{}',
    });
    setError(null);
    setCreateDialogOpen(true);
  };

  const handleOpenEdit = (part: Part) => {
    setSelectedPart(part);
    setFormData({
      name: part.name,
      partNumber: part.partNumber,
      description: part.description || '',
      stock: part.stock,
      price: part.price || '',
      minStockLevel: part.minStockLevel,
      location: part.location || '',
      hierarchyId: part.hierarchyId,
      specifications: JSON.stringify(part.specifications || {}, null, 2),
    });
    setError(null);
    setEditDialogOpen(true);
  };

  const handleOpenDelete = (part: Part) => {
    setSelectedPart(part);
    setDeleteDialogOpen(true);
  };

  // CRUD операции
  const handleCreate = async () => {
    setFormLoading(true);
    setError(null);
    
    try {
      let specs = {};
      try {
        specs = JSON.parse(formData.specifications);
      } catch (e) {
        setError('Неверный формат JSON в спецификациях');
        setFormLoading(false);
        return;
      }

      const response = await fetch('/api/parts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          partNumber: formData.partNumber,
          description: formData.description,
          stock: formData.stock,
          price: formData.price || '0',
          minStockLevel: formData.minStockLevel,
          location: formData.location,
          hierarchyId: Number(formData.hierarchyId),
          specifications: specs,
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setCreateDialogOpen(false);
        await loadParts();
      } else {
        setError(result.error?.message || 'Ошибка при создании запчасти');
      }
    } catch (error) {
      setError('Ошибка при создании запчасти');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedPart) return;
    
    setFormLoading(true);
    setError(null);
    
    try {
      let specs = {};
      try {
        specs = JSON.parse(formData.specifications);
      } catch (e) {
        setError('Неверный формат JSON в спецификациях');
        setFormLoading(false);
        return;
      }

      const response = await fetch(`/api/parts/${selectedPart.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          stock: formData.stock,
          price: formData.price || '0',
          minStockLevel: formData.minStockLevel,
          location: formData.location,
          hierarchyId: Number(formData.hierarchyId),
          specifications: specs,
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setEditDialogOpen(false);
        await loadParts();
      } else {
        setError(result.error?.message || 'Ошибка при обновлении запчасти');
      }
    } catch (error) {
      setError('Ошибка при обновлении запчасти');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPart) return;
    
    setFormLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/parts/${selectedPart.id}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (result.success) {
        setDeleteDialogOpen(false);
        await loadParts();
      } else {
        setError(result.error?.message || 'Ошибка при удалении запчасти');
      }
    } catch (error) {
      setError('Ошибка при удалении запчасти');
    } finally {
      setFormLoading(false);
    }
  };

  // Columns для DataGrid
  const columns: GridColDef[] = [
    {
      field: 'partNumber',
      headerName: t('parts.partNumber'),
      width: 150,
    },
    {
      field: 'name',
      headerName: t('parts.name'),
      width: 250,
    },
    {
      field: 'stock',
      headerName: t('parts.stock'),
      width: 100,
      renderCell: (params) => {
        const isLow = params.value < (params.row.minStockLevel || 0);
        return (
          <Chip
            label={params.value}
            color={isLow ? 'error' : 'success'}
            size="small"
            variant={isLow ? 'filled' : 'outlined'}
          />
        );
      },
    },
    {
      field: 'price',
      headerName: t('parts.price'),
      width: 100,
      renderCell: (params) => params.value ? `${params.value} ₽` : '-',
    },
    {
      field: 'location',
      headerName: t('parts.location'),
      width: 120,
    },
    {
      field: 'actions',
      headerName: t('common.actions'),
      width: 100,
      type: 'actions',
      getActions: (params) => [
        <GridActionsCellItem
          key="edit"
          icon={<EditIcon />}
          label={t('common.edit')}
          onClick={() => handleOpenEdit(params.row)}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon sx={{ color: 'error.main' }} />}
          label={t('common.delete')}
          onClick={() => handleOpenDelete(params.row)}
        />,
      ],
    },
  ];

  return (
    <Box>
      {/* Toolbar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
        >
          {t('parts.createPart')}
        </Button>
      </Box>

      {/* Table */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          border: 1,
          borderColor: 'divider',
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : parts.length === 0 ? (
          <Typography color="text.secondary" textAlign="center" py={4}>
            {t('common.noData')}
          </Typography>
        ) : (
          <DataGrid
            rows={parts}
            columns={columns}
            rowCount={totalCount}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[10, 25, 50]}
            disableRowSelectionOnClick
            autoHeight={false}
            sx={{
              border: 'none',
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: 'action.hover',
              },
            }}
          />
        )}
      </Paper>

      {/* Create/Edit Dialog */}
      <Dialog
        open={createDialogOpen || editDialogOpen}
        onClose={() => {
          setCreateDialogOpen(false);
          setEditDialogOpen(false);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {createDialogOpen ? t('parts.createTitle') : t('parts.editTitle')}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label={t('parts.partNumberLabel')}
                placeholder={t('parts.partNumberPlaceholder')}
                fullWidth
                value={formData.partNumber}
                onChange={(e) => setFormData({ ...formData, partNumber: e.target.value })}
              />
              <TextField
                label={t('parts.nameLabel')}
                placeholder={t('parts.namePlaceholder')}
                fullWidth
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Box>

            <TextField
              label={t('parts.descriptionLabel')}
              placeholder={t('parts.descriptionPlaceholder')}
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label={t('parts.priceLabel')}
                placeholder={t('parts.pricePlaceholder')}
                fullWidth
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                inputProps={{ step: '0.01', min: '0' }}
              />
              <TextField
                label={t('parts.stockLabel')}
                placeholder={t('parts.stockPlaceholder')}
                fullWidth
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                inputProps={{ min: 0 }}
              />
              <TextField
                label={t('parts.minStockLevelLabel')}
                placeholder={t('parts.minStockLevelPlaceholder')}
                fullWidth
                type="number"
                value={formData.minStockLevel}
                onChange={(e) => setFormData({ ...formData, minStockLevel: Number(e.target.value) })}
                inputProps={{ min: 0 }}
              />
            </Box>

            <TextField
              label={t('parts.locationLabel')}
              placeholder={t('parts.locationPlaceholder')}
              fullWidth
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />

            <FormControl fullWidth>
              <InputLabel>{t('parts.hierarchyLabel')}</InputLabel>
              <Select
                value={formData.hierarchyId}
                label={t('parts.hierarchyLabel')}
                onChange={(e) => setFormData({ ...formData, hierarchyId: e.target.value as number })}
              >
                {hierarchyNodes.map((node) => (
                  <MenuItem key={node.id} value={node.id}>
                    {node.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label={t('parts.specificationsJson')}
              placeholder={t('parts.specificationsPlaceholder')}
              fullWidth
              multiline
              rows={5}
              value={formData.specifications}
              onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
              error={error?.includes('JSON')}
              helperText={error?.includes('JSON') ? error : ''}
            />

            {error && !error.includes('JSON') && (
              <Alert severity="error">{error}</Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setCreateDialogOpen(false);
              setEditDialogOpen(false);
            }}
            disabled={formLoading}
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={createDialogOpen ? handleCreate : handleUpdate}
            variant="contained"
            disabled={formLoading}
          >
            {formLoading ? t('common.saving') : createDialogOpen ? t('common.create') : t('common.edit')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>{t('parts.deletePart')}</DialogTitle>
        <DialogContent>
          <Typography>{t('parts.deleteConfirm')}</Typography>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={formLoading}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleDelete} variant="contained" color="error" disabled={formLoading}>
            {formLoading ? t('common.deleting') : t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
