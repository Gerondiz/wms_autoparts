'use client';

/**
 * Хук usePermission для проверки разрешений в компонентах
 * 
 * Использование:
 * ```tsx
 * const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermission();
 * 
 * if (hasPermission('order_create')) {
 *   return <Button>Создать заказ</Button>;
 * }
 * 
 * // В JSX
 * {hasPermission('order_approve') && <ApproveButton />}
 * ```
 */

import { useMemo } from 'react';
import { useSession } from 'next-auth/react';
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  hasPermissionInGroup,
  getMissingPermissions,
  type Permission,
  type PermissionGroup,
} from '@/lib/config/permissions';

export interface UsePermissionReturn {
  /** Все разрешения пользователя */
  permissions: string[];
  /** Роль пользователя */
  roleName: string | null;
  /** Отображаемое имя роли */
  roleDisplayName: string | null;
  /** Проверка одного разрешения */
  hasPermission: (permission: Permission) => boolean;
  /** Проверка любого из разрешений (ИЛИ) */
  hasAnyPermission: (permissions: Permission[]) => boolean;
  /** Проверка всех разрешений (И) */
  hasAllPermissions: (permissions: Permission[]) => boolean;
  /** Проверка наличия разрешения в группе */
  hasPermissionInGroup: (group: PermissionGroup) => boolean;
  /** Получение отсутствующих разрешений */
  getMissingPermissions: (requiredPermissions: Permission[]) => Permission[];
  /** Загружается ли сессия */
  isLoading: boolean;
  /** Авторизован ли пользователь */
  isAuthenticated: boolean;
}

export function usePermission(): UsePermissionReturn {
  const { data: session, status } = useSession();

  // Мемоизируем permissions чтобы избежать пересоздания массива на каждом рендере
  const permissions = useMemo(
    () => session?.user?.permissions ?? [],
    [session?.user?.permissions]
  );
  const roleName = useMemo(
    () => session?.user?.roleName ?? null,
    [session?.user?.roleName]
  );
  const roleDisplayName = useMemo(
    () => session?.user?.roleDisplayName ?? null,
    [session?.user?.roleDisplayName]
  );

  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';

  // Мемоизируем функции проверки
  const checkPermission = useMemo(
    () => (permission: Permission) => hasPermission(permissions, permission),
    [permissions]
  );

  const checkAnyPermission = useMemo(
    () => (permissionList: Permission[]) => hasAnyPermission(permissions, permissionList),
    [permissions]
  );

  const checkAllPermissions = useMemo(
    () => (permissionList: Permission[]) => hasAllPermissions(permissions, permissionList),
    [permissions]
  );

  const checkPermissionInGroup = useMemo(
    () => (group: PermissionGroup) => hasPermissionInGroup(permissions, group),
    [permissions]
  );

  const getMissing = useMemo(
    () => (requiredPermissions: Permission[]) =>
      getMissingPermissions(permissions, requiredPermissions),
    [permissions]
  );

  return {
    permissions,
    roleName,
    roleDisplayName,
    hasPermission: checkPermission,
    hasAnyPermission: checkAnyPermission,
    hasAllPermissions: checkAllPermissions,
    hasPermissionInGroup: checkPermissionInGroup,
    getMissingPermissions: getMissing,
    isLoading,
    isAuthenticated,
  };
}

/**
 * HOC для защиты компонентов на основе разрешений
 * 
 * @param WrappedComponent - Компонент для обёртки
 * @param requiredPermission - Требуемое разрешение
 * @param fallback - Компонент для показа при отсутствии прав (по умолчанию null)
 */
export function withPermission<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredPermission: Permission,
  fallback: React.ComponentType<P> | null = null
): React.FC<P> {
  return function WithPermissionComponent(props: P) {
    const { hasPermission, isLoading } = usePermission();

    if (isLoading) {
      return null; // Или компонент загрузки
    }

    if (!hasPermission(requiredPermission)) {
      const FallbackComponent = fallback;
      return FallbackComponent ? <FallbackComponent {...props} /> : null;
    }

    return <WrappedComponent {...props} />;
  };
}

/**
 * Компонент для условного рендеринга на основе разрешений
 * 
 * Использование:
 * ```tsx
 * <Permission required="order_create">
 *   <Button>Создать заказ</Button>
 * </Permission>
 * 
 * <Permission required="order_create" fallback={<NoAccess />}>
 *   <Button>Создать заказ</Button>
 * </Permission>
 * ```
 */
interface PermissionProps {
  /** Требуемое разрешение */
  required: Permission;
  /** ИЛИ список требуемых разрешений (хотя бы одно) */
  requiredAny?: Permission[];
  /** И список требуемых разрешений (все) */
  requiredAll?: Permission[];
  /** Компонент для показа при отсутствии прав */
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function Permission({
  required,
  requiredAny,
  requiredAll,
  fallback = null,
  children,
}: PermissionProps): React.ReactElement | null {
  const { hasPermission, hasAnyPermission, hasAllPermissions, isLoading } = usePermission();

  if (isLoading) {
    return null;
  }

  // Проверка одного разрешения
  if (required && !hasPermission(required)) {
    return fallback as React.ReactElement | null;
  }

  // Проверка любого из разрешений
  if (requiredAny && !hasAnyPermission(requiredAny)) {
    return fallback as React.ReactElement | null;
  }

  // Проверка всех разрешений
  if (requiredAll && !hasAllPermissions(requiredAll)) {
    return fallback as React.ReactElement | null;
  }

  return <>{children}</>;
}

/**
 * Компонент для защиты групп контента по группе разрешений
 * 
 * Использование:
 * ```tsx
 * <PermissionGroup group="orders">
 *   <OrdersMenu />
 * </PermissionGroup>
 * ```
 */
interface PermissionGroupProps {
  /** Группа разрешений */
  group: PermissionGroup;
  /** Компонент для показа при отсутствии прав */
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function PermissionGroup({
  group,
  fallback = null,
  children,
}: PermissionGroupProps): React.ReactElement | null {
  const { hasPermissionInGroup, isLoading } = usePermission();

  if (isLoading) {
    return null;
  }

  if (!hasPermissionInGroup(group)) {
    return fallback as React.ReactElement | null;
  }

  return <>{children}</>;
}
