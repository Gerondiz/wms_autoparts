'use client';

import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  FormLabel,
  Box,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  Divider,
  Chip,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const roleSchema = z.object({
  name: z.string().min(1, 'Обязательное поле').max(50),
  displayName: z.string().min(1, 'Обязательное поле').max(100),
  permissions: z.array(z.string()).min(1, 'Выберите хотя бы одно разрешение'),
  sortOrder: z.number().int().nonnegative(),
});

type RoleFormData = z.infer<typeof roleSchema>;

interface Permission {
  key: string;
  label: string;
  group: string;
}

interface RoleFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: RoleFormData) => Promise<void>;
  role?: {
    id: number;
    name: string;
    displayName: string;
    permissions: string[];
    sortOrder: number;
    isSystem: boolean;
  } | null;
  isLoading?: boolean;
}

// Список всех доступных разрешений с группировкой
const permissionsList: Permission[] = [
  // Иерархия и каталог
  { key: 'catalog_view', label: 'Просмотр каталога', group: 'Каталог' },
  { key: 'hierarchy_manage', label: 'Управление иерархией', group: 'Каталог' },
  { key: 'parts_manage', label: 'Управление запчастями', group: 'Каталог' },
  
  // Заказы
  { key: 'order_create', label: 'Создание заказов', group: 'Заказы' },
  { key: 'order_view_own', label: 'Просмотр своих заказов', group: 'Заказы' },
  { key: 'order_view_all', label: 'Просмотр всех заказов', group: 'Заказы' },
  { key: 'order_edit_own_draft', label: 'Редактирование черновиков', group: 'Заказы' },
  { key: 'order_approve', label: 'Согласование заказов', group: 'Заказы' },
  { key: 'order_fulfill', label: 'Исполнение заказов', group: 'Заказы' },
  
  // Склад
  { key: 'stock_view', label: 'Просмотр склада', group: 'Склад' },
  { key: 'stock_view_history', label: 'Просмотр истории склада', group: 'Склад' },
  { key: 'stock_manage', label: 'Управление складом', group: 'Склад' },
  
  // Администрирование
  { key: 'user_manage', label: 'Управление пользователями', group: 'Администрирование' },
  { key: 'role_manage', label: 'Управление ролями', group: 'Администрирование' },
  { key: 'reports_view', label: 'Просмотр отчётов', group: 'Администрирование' },
];

// Группировка разрешений
const permissionsByGroup = permissionsList.reduce((acc, perm) => {
  if (!acc[perm.group]) {
    acc[perm.group] = [];
  }
  acc[perm.group].push(perm);
  return acc;
}, {} as Record<string, Permission[]>);

export default function RoleForm({
  open,
  onClose,
  onSubmit,
  role,
  isLoading = false,
}: RoleFormProps) {
  const t = useTranslations('admin');
  const isEdit = !!role;
  const isSystem = role?.isSystem ?? false;

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: role?.name || '',
      displayName: role?.displayName || '',
      permissions: role?.permissions || [],
      sortOrder: role?.sortOrder || 0,
    },
  });

  const watchedPermissions = watch('permissions');

  const handleFormSubmit = async (data: RoleFormData) => {
    await onSubmit(data);
    if (!isEdit) {
      reset({
        name: '',
        displayName: '',
        permissions: [],
        sortOrder: 0,
      });
    }
  };

  const handlePermissionToggle = (
    currentPermissions: string[],
    permissionKey: string,
    onChange: (value: string[]) => void
  ) => {
    if (currentPermissions.includes(permissionKey)) {
      onChange(currentPermissions.filter((p) => p !== permissionKey));
    } else {
      onChange([...currentPermissions, permissionKey]);
    }
  };

  const handleSelectAll = (group: string, onChange: (value: string[]) => void) => {
    const groupPermissions = permissionsByGroup[group].map((p) => p.key);
    const currentPermissions = watchedPermissions || [];
    const allSelected = groupPermissions.every((p) => currentPermissions.includes(p));
    
    if (allSelected) {
      onChange(currentPermissions.filter((p) => !groupPermissions.includes(p)));
    } else {
      const unique = Array.from(new Set([...currentPermissions, ...groupPermissions]));
      onChange(unique);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogTitle>
          {isEdit ? t('roles.editTitle') : t('roles.createTitle')}
          {isSystem && (
            <Chip
              label={t('roles.systemRoleBadge')}
              size="small"
              color="error"
              sx={{ ml: 1, verticalAlign: 'middle' }}
            />
          )}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t('roles.nameLabel')}
                    placeholder={t('roles.namePlaceholder')}
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    disabled={isLoading || isSystem}
                  />
                )}
              />

              <Controller
                name="displayName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t('roles.displayNameLabel')}
                    placeholder={t('roles.displayNamePlaceholder')}
                    fullWidth
                    error={!!errors.displayName}
                    helperText={errors.displayName?.message}
                    disabled={isLoading || isSystem}
                  />
                )}
              />
            </Box>

            <Controller
              name="sortOrder"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t('roles.sortOrderLabel')}
                  type="number"
                  fullWidth
                  error={!!errors.sortOrder}
                  helperText={errors.sortOrder?.message}
                  disabled={isLoading}
                  inputProps={{ min: 0 }}
                />
              )}
            />

            <Box>
              <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
                {t('roles.permissionsLabel')}
              </Typography>
              
              {Object.entries(permissionsByGroup).map(([group, perms]) => {
                const groupPermissions = perms.map((p) => p.key);
                const currentPermissions = watchedPermissions || [];
                const allSelected = groupPermissions.every((p) => currentPermissions.includes(p));
                const someSelected = groupPermissions.some((p) => currentPermissions.includes(p));

                return (
                  <Box key={group} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, flex: 1 }}>
                        {group}
                      </Typography>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={allSelected}
                            indeterminate={someSelected && !allSelected}
                            onChange={() => handleSelectAll(group, (value) => {
                              // Обновляем через react-hook-form
                            })}
                            disabled={isLoading || isSystem}
                            size="small"
                          />
                        }
                        label="Все"
                        sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } }}
                      />
                    </Box>
                    <FormGroup row>
                      {perms.map((perm) => (
                        <Controller
                          key={perm.key}
                          name="permissions"
                          control={control}
                          render={({ field }) => (
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={field.value?.includes(perm.key)}
                                  onChange={(e) =>
                                    handlePermissionToggle(
                                      field.value || [],
                                      perm.key,
                                      field.onChange
                                    )
                                  }
                                  disabled={isLoading || isSystem}
                                  size="small"
                                />
                              }
                              label={perm.label}
                              sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } }}
                            />
                          )}
                        />
                      ))}
                    </FormGroup>
                    <Divider sx={{ my: 1 }} />
                  </Box>
                );
              })}
              
              {errors.permissions && (
                <Typography color="error" variant="caption">
                  {errors.permissions.message}
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isLoading}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" variant="contained" disabled={isLoading || isSystem}>
            {isLoading ? t('common.saving') : isEdit ? t('common.edit') : t('common.create')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
