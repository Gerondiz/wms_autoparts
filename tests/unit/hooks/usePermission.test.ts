/**
 * Unit тесты для usePermission hook и функций разрешений
 * 
 * Тестируют хуки и утилиты работы с разрешениями
 */

import { describe, it, expect } from '@jest/globals';
import {
  permissions,
  allPermissions,
  permissionGroups,
  rolePresets,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  hasPermissionInGroup,
  getMissingPermissions,
  hasRouteAccess,
  type Permission,
} from '@/lib/config/permissions';

describe('Permissions', () => {
  describe('Константы разрешений', () => {
    it('должен содержать все основные разрешения', () => {
      expect(permissions.catalogView).toBe('catalog_view');
      expect(permissions.orderCreate).toBe('order_create');
      expect(permissions.orderApprove).toBe('order_approve');
      expect(permissions.orderFulfill).toBe('order_fulfill');
      expect(permissions.stockManage).toBe('stock_manage');
      expect(permissions.userManage).toBe('user_manage');
      expect(permissions.roleManage).toBe('role_manage');
      expect(permissions.partsManage).toBe('parts_manage');
      expect(permissions.hierarchyManage).toBe('hierarchy_manage');
      expect(permissions.reportsView).toBe('reports_view');
      expect(permissions.settingsAccess).toBe('settings_access');
    });

    it('должен содержать массив всех разрешений', () => {
      expect(allPermissions).toBeDefined();
      expect(Array.isArray(allPermissions)).toBe(true);
      expect(allPermissions.length).toBeGreaterThan(0);
    });
  });

  describe('hasPermission', () => {
    it('должен вернуть true если разрешение есть', () => {
      const userPermissions = ['order_create', 'order_view_own'];
      expect(hasPermission(userPermissions, 'order_create')).toBe(true);
    });

    it('должен вернуть false если разрешения нет', () => {
      const userPermissions = ['order_create', 'order_view_own'];
      expect(hasPermission(userPermissions, 'order_approve')).toBe(false);
    });

    it('должен вернуть false для пустого массива разрешений', () => {
      expect(hasPermission([], 'order_create')).toBe(false);
    });

    it('должен вернуть false для undefined разрешений', () => {
      expect(hasPermission(undefined as any, 'order_create')).toBe(false);
    });
  });

  describe('hasAnyPermission', () => {
    it('должен вернуть true если есть хотя бы одно разрешение', () => {
      const userPermissions = ['order_create', 'order_view_own'];
      expect(
        hasAnyPermission(userPermissions, ['order_create', 'order_approve'])
      ).toBe(true);
    });

    it('должен вернуть true если есть все разрешения', () => {
      const userPermissions = ['order_create', 'order_approve'];
      expect(
        hasAnyPermission(userPermissions, ['order_create', 'order_approve'])
      ).toBe(true);
    });

    it('должен вернуть false если нет ни одного разрешения', () => {
      const userPermissions = ['order_create'];
      expect(
        hasAnyPermission(userPermissions, ['order_approve', 'order_fulfill'])
      ).toBe(false);
    });

    it('должен вернуть false для пустого списка проверок', () => {
      const userPermissions = ['order_create'];
      expect(hasAnyPermission(userPermissions, [])).toBe(false);
    });
  });

  describe('hasAllPermissions', () => {
    it('должен вернуть true если есть все разрешения', () => {
      const userPermissions = ['order_create', 'order_approve', 'order_view_own'];
      expect(
        hasAllPermissions(userPermissions, ['order_create', 'order_approve'])
      ).toBe(true);
    });

    it('должен вернуть false если не хватает хотя бы одного разрешения', () => {
      const userPermissions = ['order_create', 'order_view_own'];
      expect(
        hasAllPermissions(userPermissions, ['order_create', 'order_approve'])
      ).toBe(false);
    });

    it('должен вернуть false если нет ни одного разрешения', () => {
      const userPermissions = ['order_view_own'];
      expect(
        hasAllPermissions(userPermissions, ['order_create', 'order_approve'])
      ).toBe(false);
    });

    it('должен вернуть true для пустого списка проверок', () => {
      const userPermissions = ['order_create'];
      expect(hasAllPermissions(userPermissions, [])).toBe(true);
    });
  });

  describe('hasPermissionInGroup', () => {
    it('должен вернуть true если есть разрешение в группе заказов', () => {
      const userPermissions = ['order_create', 'catalog_view'];
      expect(hasPermissionInGroup(userPermissions, 'orders')).toBe(true);
    });

    it('должен вернуть true если есть разрешение в группе склада', () => {
      const userPermissions = ['stock_manage', 'catalog_view'];
      expect(hasPermissionInGroup(userPermissions, 'stock')).toBe(true);
    });

    it('должен вернуть false если нет разрешений в группе', () => {
      const userPermissions = ['catalog_view'];
      expect(hasPermissionInGroup(userPermissions, 'orders')).toBe(false);
    });

    it('должен проверить группу пользователей', () => {
      const userPermissions = ['user_manage'];
      expect(hasPermissionInGroup(userPermissions, 'users')).toBe(true);
    });

    it('должен проверить группу ролей', () => {
      const userPermissions = ['role_manage'];
      expect(hasPermissionInGroup(userPermissions, 'roles')).toBe(true);
    });

    it('должен проверить группу иерархии', () => {
      const userPermissions = ['hierarchy_manage'];
      expect(hasPermissionInGroup(userPermissions, 'hierarchy')).toBe(true);
    });

    it('должен проверить группу запчастей', () => {
      const userPermissions = ['parts_manage'];
      expect(hasPermissionInGroup(userPermissions, 'parts')).toBe(true);
    });

    it('должен проверить группу отчётов', () => {
      const userPermissions = ['reports_view'];
      expect(hasPermissionInGroup(userPermissions, 'reports')).toBe(true);
    });

    it('должен проверить группу настроек', () => {
      const userPermissions = ['settings_access'];
      expect(hasPermissionInGroup(userPermissions, 'settings')).toBe(true);
    });
  });

  describe('getMissingPermissions', () => {
    it('должен вернуть пустой массив если все разрешения есть', () => {
      const userPermissions = ['order_create', 'order_approve'];
      const missing = getMissingPermissions(userPermissions, [
        'order_create',
        'order_approve',
      ]);
      expect(missing).toEqual([]);
    });

    it('должен вернуть отсутствующие разрешения', () => {
      const userPermissions = ['order_create'];
      const missing = getMissingPermissions(userPermissions, [
        'order_create',
        'order_approve',
        'order_fulfill',
      ]);
      expect(missing).toEqual(['order_approve', 'order_fulfill']);
    });

    it('должен вернуть все разрешения если у пользователя ничего нет', () => {
      const userPermissions: string[] = [];
      const missing = getMissingPermissions(userPermissions, [
        'order_create',
        'order_approve',
      ]);
      expect(missing).toEqual(['order_create', 'order_approve']);
    });
  });

  describe('hasRouteAccess', () => {
    it('должен вернуть true для каталога с разрешением catalog_view', () => {
      const userPermissions = ['catalog_view'];
      expect(hasRouteAccess(userPermissions, '/catalog')).toBe(true);
    });

    it('должен вернуть false для каталога без разрешения', () => {
      const userPermissions = ['order_create'];
      expect(hasRouteAccess(userPermissions, '/catalog')).toBe(false);
    });

    it('должен вернуть true для заказов с order_view_own', () => {
      const userPermissions = ['order_view_own'];
      expect(hasRouteAccess(userPermissions, '/orders')).toBe(true);
    });

    it('должен вернуть true для создания заказа с order_create', () => {
      const userPermissions = ['order_create'];
      expect(hasRouteAccess(userPermissions, '/orders/create')).toBe(true);
    });

    it('должен вернуть true для склада с stock_view_history', () => {
      const userPermissions = ['stock_view_history'];
      expect(hasRouteAccess(userPermissions, '/stock')).toBe(true);
    });

    it('должен вернуть true для управления складом с stock_manage', () => {
      const userPermissions = ['stock_manage'];
      expect(hasRouteAccess(userPermissions, '/stock/manage')).toBe(true);
    });

    it('должен вернуть true для пользователей с user_manage', () => {
      const userPermissions = ['user_manage'];
      expect(hasRouteAccess(userPermissions, '/admin/users')).toBe(true);
    });

    it('должен вернуть true для ролей с role_manage', () => {
      const userPermissions = ['role_manage'];
      expect(hasRouteAccess(userPermissions, '/admin/roles')).toBe(true);
    });

    it('должен вернуть true для иерархии с hierarchy_manage', () => {
      const userPermissions = ['hierarchy_manage'];
      expect(hasRouteAccess(userPermissions, '/admin/hierarchy')).toBe(true);
    });

    it('должен вернуть true для запчастей с parts_manage', () => {
      const userPermissions = ['parts_manage'];
      expect(hasRouteAccess(userPermissions, '/admin/parts')).toBe(true);
    });

    it('должен вернуть true для отчётов с reports_view', () => {
      const userPermissions = ['reports_view'];
      expect(hasRouteAccess(userPermissions, '/reports')).toBe(true);
    });

    it('должен вернуть true для настроек с settings_access', () => {
      const userPermissions = ['settings_access'];
      expect(hasRouteAccess(userPermissions, '/settings')).toBe(true);
    });

    it('должен вернуть true для неизвестного маршрута', () => {
      const userPermissions = ['catalog_view'];
      expect(hasRouteAccess(userPermissions, '/unknown')).toBe(true);
    });
  });

  describe('rolePresets', () => {
    describe('MECHANIC', () => {
      it('должен содержать базовые права механика', () => {
        expect(rolePresets.MECHANIC).toContain('catalog_view');
        expect(rolePresets.MECHANIC).toContain('order_create');
        expect(rolePresets.MECHANIC).toContain('order_edit_own_draft');
        expect(rolePresets.MECHANIC).toContain('order_view_own');
      });

      it('не должен содержать прав на согласование', () => {
        expect(rolePresets.MECHANIC).not.toContain('order_approve');
      });

      it('не должен содержать прав на управление складом', () => {
        expect(rolePresets.MECHANIC).not.toContain('stock_manage');
      });
    });

    describe('REPAIR_MANAGER', () => {
      it('должен содержать права механика', () => {
        expect(rolePresets.REPAIR_MANAGER).toContain('catalog_view');
        expect(rolePresets.REPAIR_MANAGER).toContain('order_create');
        expect(rolePresets.REPAIR_MANAGER).toContain('order_view_own');
      });

      it('должен содержать право на просмотр всех заказов', () => {
        expect(rolePresets.REPAIR_MANAGER).toContain('order_view_all');
      });

      it('должен содержать право на согласование', () => {
        expect(rolePresets.REPAIR_MANAGER).toContain('order_approve');
      });

      it('должен содержать право на просмотр отчётов', () => {
        expect(rolePresets.REPAIR_MANAGER).toContain('reports_view');
      });
    });

    describe('STOREKEEPER', () => {
      it('должен содержать права на управление складом', () => {
        expect(rolePresets.STOREKEEPER).toContain('stock_manage');
        expect(rolePresets.STOREKEEPER).toContain('stock_view_history');
      });

      it('должен содержать права на исполнение заказов', () => {
        expect(rolePresets.STOREKEEPER).toContain('order_fulfill');
      });

      it('должен содержать права на управление запчастями', () => {
        expect(rolePresets.STOREKEEPER).toContain('parts_manage');
      });

      it('должен содержать право просмотра всех заказов', () => {
        expect(rolePresets.STOREKEEPER).toContain('order_view_all');
      });
    });

    describe('ADMIN', () => {
      it('должен содержать все разрешения', () => {
        expect(rolePresets.ADMIN).toEqual(allPermissions);
      });

      it('должен содержать право на управление пользователями', () => {
        expect(rolePresets.ADMIN).toContain('user_manage');
      });

      it('должен содержать право на управление ролями', () => {
        expect(rolePresets.ADMIN).toContain('role_manage');
      });
    });
  });

  describe('permissionGroups', () => {
    it('должен содержать группу catalog', () => {
      expect(permissionGroups.catalog).toBeDefined();
      expect(permissionGroups.catalog.label).toBe('Каталог');
      expect(permissionGroups.catalog.permissions).toContain('catalog_view');
    });

    it('должен содержать группу orders', () => {
      expect(permissionGroups.orders).toBeDefined();
      expect(permissionGroups.orders.label).toBe('Заказы');
      expect(permissionGroups.orders.permissions.length).toBeGreaterThan(0);
    });

    it('должен содержать группу stock', () => {
      expect(permissionGroups.stock).toBeDefined();
      expect(permissionGroups.stock.label).toBe('Склад');
    });

    it('должен содержать группу users', () => {
      expect(permissionGroups.users).toBeDefined();
      expect(permissionGroups.users.label).toBe('Пользователи');
    });

    it('должен содержать группу roles', () => {
      expect(permissionGroups.roles).toBeDefined();
      expect(permissionGroups.roles.label).toBe('Роли');
    });

    it('должен содержать группу hierarchy', () => {
      expect(permissionGroups.hierarchy).toBeDefined();
      expect(permissionGroups.hierarchy.label).toBe('Иерархия');
    });

    it('должен содержать группу parts', () => {
      expect(permissionGroups.parts).toBeDefined();
      expect(permissionGroups.parts.label).toBe('Запчасти');
    });

    it('должен содержать группу reports', () => {
      expect(permissionGroups.reports).toBeDefined();
      expect(permissionGroups.reports.label).toBe('Отчёты');
    });

    it('должен содержать группу settings', () => {
      expect(permissionGroups.settings).toBeDefined();
      expect(permissionGroups.settings.label).toBe('Настройки');
    });
  });
});
