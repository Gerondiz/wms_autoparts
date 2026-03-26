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
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import AdminLayout from '@/components/admin/AdminLayout';
import UserForm from '@/components/admin/UserForm';

interface Role {
  id: number;
  name: string;
  displayName: string;
}

interface User {
  id: number;
  email: string;
  fullName: string;
  roleTypeId: number | null;
  roleName: string | null;
  roleDisplayName: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const t = useTranslations('admin');
  
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Загрузка пользователей
  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users');
      const result = await response.json();
      
      if (result.success) {
        setUsers(result.data || []);
      } else {
        setError(result.error?.message || 'Ошибка загрузки пользователей');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Ошибка подключения к серверу');
    } finally {
      setLoading(false);
    }
  }, []);

  // Загрузка ролей
  const loadRoles = async () => {
    try {
      const response = await fetch('/api/roles');
      const result = await response.json();
      
      if (result.success) {
        setRoles(result.data || []);
      }
    } catch (error) {
      console.error('Error loading roles:', error);
    }
  };

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, [loadUsers]);

  // Обработчики
  const handleOpenCreate = () => {
    setSelectedUser(null);
    setError(null);
    setFormDialogOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setSelectedUser(user);
    setError(null);
    setFormDialogOpen(true);
  };

  const handleOpenDelete = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleToggleActive = async (user: User) => {
    try {
      setFormLoading(true);
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isActive: !user.isActive,
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        await loadUsers();
        setSuccessMessage(`Пользователь ${user.isActive ? 'заблокирован' : 'разблокирован'}`);
      } else {
        setError(result.error?.message || 'Ошибка изменения статуса');
      }
    } catch (error) {
      setError('Ошибка подключения к серверу');
    } finally {
      setFormLoading(false);
    }
  };

  const handleFormSubmit = async (data: any) => {
    setFormLoading(true);
    setError(null);
    
    try {
      const url = selectedUser ? `/api/users/${selectedUser.id}` : '/api/users';
      const method = selectedUser ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setFormDialogOpen(false);
        await loadUsers();
        setSuccessMessage(selectedUser ? 'Пользователь обновлён' : 'Пользователь создан');
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
    if (!selectedUser) return;
    
    setFormLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (result.success) {
        setDeleteDialogOpen(false);
        await loadUsers();
        setSuccessMessage('Пользователь удалён');
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
      field: 'email',
      headerName: t('users.email'),
      width: 250,
    },
    {
      field: 'fullName',
      headerName: t('users.fullName'),
      width: 200,
    },
    {
      field: 'roleDisplayName',
      headerName: t('users.role'),
      width: 150,
      renderCell: (params) => params.value || '-',
    },
    {
      field: 'isActive',
      headerName: t('users.isActive'),
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Активен' : 'Заблокирован'}
          size="small"
          color={params.value ? 'success' : 'default'}
          variant={params.value ? 'filled' : 'outlined'}
          icon={params.value ? <CheckCircleIcon /> : <BlockIcon />}
        />
      ),
    },
    {
      field: 'createdAt',
      headerName: t('users.createdAt'),
      width: 150,
      renderCell: (params) =>
        params.value ? new Date(params.value).toLocaleDateString('ru-RU') : '-',
    },
    {
      field: 'actions',
      headerName: t('common.actions'),
      width: 150,
      type: 'actions',
      getActions: (params) => [
        <GridActionsCellItem
          key="edit"
          icon={<EditIcon />}
          label={t('common.edit')}
          onClick={() => handleOpenEdit(params.row)}
        />,
        <GridActionsCellItem
          key="toggle"
          icon={params.row.isActive ? <BlockIcon /> : <CheckCircleIcon />}
          label={params.row.isActive ? t('users.blockUser') : t('users.unblockUser')}
          onClick={() => handleToggleActive(params.row)}
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
    <AdminLayout title={t('users.title')}>
      {/* Toolbar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
        >
          {t('users.createUser')}
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
        ) : users.length === 0 ? (
          <Typography color="text.secondary" textAlign="center" py={4}>
            {t('common.noData')}
          </Typography>
        ) : (
          <DataGrid
            rows={users}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10 },
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

      {/* User Form Dialog */}
      <UserForm
        open={formDialogOpen}
        onClose={() => {
          setFormDialogOpen(false);
          setError(null);
        }}
        onSubmit={handleFormSubmit}
        roles={roles}
        user={selectedUser}
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
              {t('users.deleteUser')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('users.deleteConfirm')}
            </Typography>
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
