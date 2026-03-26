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
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Box,
  Alert,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(8, 'Минимум 8 символов').optional(),
  fullName: z.string().min(1, 'Обязательное поле'),
  roleTypeId: z.number().min(1, 'Выберите роль'),
  isActive: z.boolean(),
});

type UserFormData = z.infer<typeof userSchema>;

interface Role {
  id: number;
  name: string;
  displayName: string;
}

interface UserFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData) => Promise<void>;
  roles: Role[];
  user?: {
    id: number;
    email: string;
    fullName: string;
    roleTypeId: number | null;
    isActive: boolean;
  } | null;
  isLoading?: boolean;
}

export default function UserForm({
  open,
  onClose,
  onSubmit,
  roles,
  user,
  isLoading = false,
}: UserFormProps) {
  const t = useTranslations('admin');
  const isEdit = !!user;

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: user?.email || '',
      password: '',
      fullName: user?.fullName || '',
      roleTypeId: user?.roleTypeId || undefined,
      isActive: user?.isActive ?? true,
    },
  });

  const handleFormSubmit = async (data: UserFormData) => {
    await onSubmit(data);
    if (!isEdit) {
      reset({
        email: '',
        password: '',
        fullName: '',
        roleTypeId: undefined,
        isActive: true,
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogTitle>
          {isEdit ? t('users.editTitle') : t('users.createTitle')}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t('users.emailLabel')}
                  placeholder={t('users.emailPlaceholder')}
                  fullWidth
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  disabled={isLoading}
                />
              )}
            />

            <Controller
              name="fullName"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t('users.fullNameLabel')}
                  placeholder={t('users.fullNamePlaceholder')}
                  fullWidth
                  error={!!errors.fullName}
                  helperText={errors.fullName?.message}
                  disabled={isLoading}
                />
              )}
            />

            {!isEdit && (
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t('users.passwordLabel')}
                    placeholder={t('users.passwordPlaceholder')}
                    type="password"
                    fullWidth
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    disabled={isLoading}
                  />
                )}
              />
            )}

            <Controller
              name="roleTypeId"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.roleTypeId}>
                  <InputLabel>{t('users.roleLabel')}</InputLabel>
                  <Select
                    {...field}
                    value={field.value || ''}
                    label={t('users.roleLabel')}
                    placeholder={t('users.rolePlaceholder')}
                    disabled={isLoading}
                  >
                    {roles.map((role) => (
                      <MenuItem key={role.id} value={role.id}>
                        {role.displayName}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.roleTypeId && (
                    <small style={{ color: 'red', marginTop: 4 }}>
                      {errors.roleTypeId.message}
                    </small>
                  )}
                </FormControl>
              )}
            />

            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Switch
                      {...field}
                      checked={field.value}
                      disabled={isLoading}
                    />
                  }
                  label={t('users.isActiveLabel')}
                />
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isLoading}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" variant="contained" disabled={isLoading}>
            {isLoading ? t('common.saving') : isEdit ? t('common.edit') : t('common.create')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
