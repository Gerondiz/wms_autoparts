/**
 * Конфигурация разрешений (permissions) для WMS Autoparts
 * 
 * Система разрешений для контроля доступа к функционалу:
 * - Каталог
 * - Заказы
 * - Склад
 * - Пользователи
 * - Роли
 * - Иерархия
 * - Запчасти
 * - Отчёты
 * - Настройки
 */

// ==================== Список всех разрешений ====================

export const permissions = {
  // Каталог
  /** Просмотр каталога */
  catalogView: 'catalog_view',

  // Заказы
  /** Создание нового заказа */
  orderCreate: 'order_create',
  /** Редактирование собственного черновика */
  orderEditOwnDraft: 'order_edit_own_draft',
  /** Просмотр собственных заказов */
  orderViewOwn: 'order_view_own',
  /** Просмотр всех заказов (глобально) */
  orderViewAll: 'order_view_all',
  /** Согласование заказов */
  orderApprove: 'order_approve',
  /** Исполнение заказов (выдача запчастей) */
  orderFulfill: 'order_fulfill',

  // Склад
  /** Управление складом (приемка, списание, перемещение) */
  stockManage: 'stock_manage',
  /** Просмотр истории склада */
  stockViewHistory: 'stock_view_history',

  // Пользователи
  /** Управление пользователями (CRUD) */
  userManage: 'user_manage',

  // Роли
  /** Управление ролями и разрешениями */
  roleManage: 'role_manage',

  // Иерархия
  /** Управление иерархией запчастей */
  hierarchyManage: 'hierarchy_manage',

  // Запчасти
  /** Управление запчастями (CRUD) */
  partsManage: 'parts_manage',

  // Отчёты
  /** Просмотр отчётов */
  reportsView: 'reports_view',

  // Настройки
  /** Доступ к настройкам системы */
  settingsAccess: 'settings_access',
} as const;

// Тип для всех возможных разрешений
export type Permission = (typeof permissions)[keyof typeof permissions];

// Массив всех разрешений для итерации
export const allPermissions: Permission[] = Object.values(permissions);

// ==================== Группы разрешений ====================

/**
 * Группы разрешений по функциональным областям
 */
export const permissionGroups = {
  catalog: {
    label: 'Каталог',
    permissions: [permissions.catalogView] as Permission[],
  },
  orders: {
    label: 'Заказы',
    permissions: [
      permissions.orderCreate,
      permissions.orderEditOwnDraft,
      permissions.orderViewOwn,
      permissions.orderViewAll,
      permissions.orderApprove,
      permissions.orderFulfill,
    ] as Permission[],
  },
  stock: {
    label: 'Склад',
    permissions: [permissions.stockManage, permissions.stockViewHistory] as Permission[],
  },
  users: {
    label: 'Пользователи',
    permissions: [permissions.userManage] as Permission[],
  },
  roles: {
    label: 'Роли',
    permissions: [permissions.roleManage] as Permission[],
  },
  hierarchy: {
    label: 'Иерархия',
    permissions: [permissions.hierarchyManage] as Permission[],
  },
  parts: {
    label: 'Запчасти',
    permissions: [permissions.partsManage] as Permission[],
  },
  reports: {
    label: 'Отчёты',
    permissions: [permissions.reportsView] as Permission[],
  },
  settings: {
    label: 'Настройки',
    permissions: [permissions.settingsAccess] as Permission[],
  },
} as const;

// Тип для групп разрешений
export type PermissionGroup = keyof typeof permissionGroups;

// ==================== Пресеты ролей ====================

/**
 * Пресеты разрешений для стандартных ролей
 * Используются как шаблон при создании новых ролей
 */
export const rolePresets = {
  /** Механик - базовые права для создания и просмотра своих заказов */
  MECHANIC: [
    permissions.catalogView,
    permissions.orderCreate,
    permissions.orderEditOwnDraft,
    permissions.orderViewOwn,
  ] as Permission[],

  /** Менеджер по ремонту - расширенные права + согласование */
  REPAIR_MANAGER: [
    permissions.catalogView,
    permissions.orderCreate,
    permissions.orderEditOwnDraft,
    permissions.orderViewOwn,
    permissions.orderViewAll,
    permissions.orderApprove,
    permissions.reportsView,
  ] as Permission[],

  /** Кладовщик - управление складом и исполнение заказов */
  STOREKEEPER: [
    permissions.catalogView,
    permissions.orderViewAll,
    permissions.orderFulfill,
    permissions.stockManage,
    permissions.stockViewHistory,
    permissions.partsManage,
  ] as Permission[],

  /** Администратор - полный доступ ко всем функциям */
  ADMIN: allPermissions,
} as const;

// Тип для пресетов ролей
export type RolePreset = keyof typeof rolePresets;

// ==================== Функции проверки разрешений ====================

/**
 * Проверка наличия разрешения у пользователя
 * @param userPermissions - Список разрешений пользователя
 * @param permission - Разрешение для проверки
 * @returns true если разрешение есть
 */
export function hasPermission(
  userPermissions: string[] = [],
  permission: Permission
): boolean {
  return userPermissions.includes(permission);
}

/**
 * Проверка наличия любого из разрешений (логическое ИЛИ)
 * @param userPermissions - Список разрешений пользователя
 * @param permissionList - Список разрешений для проверки
 * @returns true если есть хотя бы одно разрешение
 */
export function hasAnyPermission(
  userPermissions: string[] = [],
  permissionList: Permission[]
): boolean {
  return permissionList.some((permission) => userPermissions.includes(permission));
}

/**
 * Проверка наличия всех разрешений (логическое И)
 * @param userPermissions - Список разрешений пользователя
 * @param permissionList - Список разрешений для проверки
 * @returns true если есть все разрешения
 */
export function hasAllPermissions(
  userPermissions: string[] = [],
  permissionList: Permission[]
): boolean {
  return permissionList.every((permission) => userPermissions.includes(permission));
}

/**
 * Проверка наличия разрешения в группе
 * @param userPermissions - Список разрешений пользователя
 * @param group - Группа разрешений
 * @returns true если есть хотя бы одно разрешение в группе
 */
export function hasPermissionInGroup(
  userPermissions: string[] = [],
  group: PermissionGroup
): boolean {
  const groupPermissions = permissionGroups[group].permissions;
  return hasAnyPermission(userPermissions, groupPermissions);
}

/**
 * Получение отсутствующих разрешений
 * @param userPermissions - Список разрешений пользователя
 * @param requiredPermissions - Требуемые разрешения
 * @returns Массив отсутствующих разрешений
 */
export function getMissingPermissions(
  userPermissions: string[] = [],
  requiredPermissions: Permission[]
): Permission[] {
  return requiredPermissions.filter(
    (permission) => !userPermissions.includes(permission)
  );
}

/**
 * Проверка доступа к маршруту
 * @param userPermissions - Список разрешений пользователя
 * @param path - Путь маршрута
 * @returns true если есть доступ
 */
export function hasRouteAccess(
  userPermissions: string[] = [],
  path: string
): boolean {
  // Карта маршрутов и требуемых разрешений
  const routePermissions: Record<string, Permission | Permission[]> = {
    '/catalog': permissions.catalogView,
    '/orders': permissions.orderViewOwn,
    '/orders/create': permissions.orderCreate,
    '/stock': permissions.stockViewHistory,
    '/stock/manage': permissions.stockManage,
    '/admin/users': permissions.userManage,
    '/admin/roles': permissions.roleManage,
    '/admin/hierarchy': permissions.hierarchyManage,
    '/admin/parts': permissions.partsManage,
    '/reports': permissions.reportsView,
    '/settings': permissions.settingsAccess,
  };

  const required = routePermissions[path];
  if (!required) return true; // Если маршрут не указан, доступ открыт

  if (Array.isArray(required)) {
    return hasAnyPermission(userPermissions, required);
  }

  return hasPermission(userPermissions, required);
}
