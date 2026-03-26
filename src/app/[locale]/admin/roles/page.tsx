'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import AdminLayout from '@/components/admin/AdminLayout';
import RoleForm from '@/components/admin/RoleForm';

interface Role {
  id: number;
  name: string;
  displayName: string;
  permissions: string[];
  sortOrder: number;
  isSystem: boolean;
  usersCount: number;
}

export default function AdminRolesPage() {
  const t = useTranslations('admin');
  
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Загрузка ролей
  const loadRoles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/roles');
      const result = await response.json();
      
      if (result.success) {
        setRoles(result.data || []);
      } else {
        setError(result.error?.message || 'Ошибка загрузки ролей');
      }
    } catch (error) {
      console.error('Error loading roles:', error);
      setError('Ошибка подключения к серверу');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  // Обработчики
  const handleOpenCreate = () => {
    setSelectedRole(null);
    setError(null);
    setFormDialogOpen(true);
  };

  const handleOpenEdit = (role: Role) => {
    setSelectedRole(role);
    setError(null);
    setFormDialogOpen(true);
  };

  const handleOpenDelete = (role: Role) => {
    setSelectedRole(role);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    setFormLoading(true);
    setError(null);
    
    try {
      const url = selectedRole ? `/api/roles/${selectedRole.id}` : '/api/roles';
      const method = selectedRole ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setFormDialogOpen(false);
        await loadRoles();
        setSuccessMessage(selectedRole ? 'Роль обновлена' : 'Роль создана');
      } else {
        setError(result.error?.message || 'Ошибка сохранения');
      }
    } catch (error) {
      setError('Ошибка подключения к серверу');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRole) return;
    
    setFormLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/roles/${selectedRole.id}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (result.success) {
        setDeleteDialogOpen(false);
        await loadRoles();
        setSuccessMessage('Роль удалена');
      } else {
        setError(result.error?.message || 'Ошибка удаления');
      }
    } catch (error) {
      setError('Ошибка подключения к серверу');
    } finally {
      setFormLoading(false);
    }
  };

  // Columns для DataGrid
  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: t('roles.name'),
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" fontWeight={600}>
            {params.value}
          </Typography>
          {params.row.isSystem && (
            <Chip
              label={t('roles.systemRoleBadge')}
              size="small"
              color="error"
              sx={{ height: 20 }}
            />
          )}
        </Box>
      ),
    },
    {
      field: 'displayName',
      headerName: t('roles.displayName'),
      width: 200,
    },
    {
      field: 'permissions',
      headerName: t('roles.permissions'),
      width: 150,
      renderCell: (params) => (
        <Chip
          label={params.value?.length || 0}
          size="small"
          color="info"
          variant="outlined"
        />
      ),
    },
    {
      field: 'usersCount',
      headerName: t('roles.usersCount'),
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value || 0}
          size="small"
          variant={params.value > 0 ? 'filled' : 'outlined'}
        />
      ),
    },
    {
      field: 'sortOrder',
      headerName: t('roles.sortOrder'),
      width: 100,
    },
    {
      field: 'actions',
      headerName: t('common.actions'),
      width: 120,
      type: 'actions',
      getActions: (params) => [
        <GridActionsCellItem
          key="edit"
          icon={<EditIcon />}
          label={t('common.edit')}
          onClick={() => handleOpenEdit(params.row)}
          disabled={params.row.isSystem}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon sx={{ color: 'error.main' }} />}
          label={t('common.delete')}
          onClick={() => handleOpenDelete(params.row)}
          disabled={params.row.isSystem || params.row.usersCount > 0}
        />,
      ],
    },
  ];

  return (
    <AdminLayout title={t('roles.title')}>
      {/* Toolbar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
        >
          {t('roles.createRole')}
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
        ) : roles.length === 0 ? (
          <Typography color="text.secondary" textAlign="center" py={4}>
            {t('common.noData')}
          </Typography>
        ) : (
          <DataGrid
            rows={roles}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10 },
              },
              sorting: {
                sortModel: [{ field: 'sortOrder', sort: 'asc' }],
              },
            }}
            pageSizeOptions={[10, 25, 50]}
            disableRowSelectionOnClick
            autoHeight
            sx={{
              border: 'none',
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: 'action.hover',
              },
            }}
          />
        )}
      </Paper>

      {/* Role Form Dialog */}
      <RoleForm
        open={formDialogOpen}
        onClose={() => {
          setFormDialogOpen(false);
          setError(null);
        }}
        onSubmit={handleFormSubmit}
        role={selectedRole}
        isLoading={formLoading}
      />

      {/* Delete Dialog */}
      {deleteDialogOpen && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1300,
          }}
        >
          <Paper
            elevation={6}
            sx={{
              p: 3,
              maxWidth: 400,
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" gutterBottom>
              {t('roles.deleteRole')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('roles.deleteConfirm')}
            </Typography>
            {selectedRole?.usersCount ? (
              <Alert severity="warning" sx={{ mb: 2 }}>
                У этой роли есть {selectedRole.usersCount} пользователей
              </Alert>
            ) : null}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setError(null);
                }}
                disabled={formLoading}
              >
                {t('common.cancel')}
              </Button>
              <Button
                onClick={handleDelete}
                variant="contained"
                color="error"
                disabled={formLoading}
              >
                {formLoading ? t('common.deleting') : t('common.delete')}
              </Button>
            </Box>
          </Paper>
        </Box>
      )}

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage(null)}
        message={successMessage}
      />

      {/* Error Snackbar */}
      <Snackbar
        open={!!error && !deleteDialogOpen}
        autoHideDuration={5000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </AdminLayout>
  );
}
