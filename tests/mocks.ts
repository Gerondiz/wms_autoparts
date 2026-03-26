/**
 * Тестовые данные и фабрики для WMS Autoparts
 * 
 * Используется в unit, integration и e2e тестах
 */

// ============================================
// Типы данных
// ============================================

export interface MockUser {
  id: number;
  email: string;
  fullName: string;
  roleTypeId: number;
  roleName: string;
  permissions: string[];
  isActive: boolean;
}

export interface MockPart {
  id: number;
  name: string;
  partNumber: string;
  description: string;
  stock: number;
  price: string;
  minStockLevel: number;
  location: string;
  hierarchyId: number;
  hierarchyName: string;
}

export interface MockOrder {
  id: number;
  mechanicId: number;
  mechanicName: string;
  repairManagerId: number | null;
  statusId: number;
  statusName: string;
  statusDisplayName: string;
  statusColor: string;
  priority: number;
  notes: string;
  itemsCount: number;
  createdAt: Date;
  approvedAt: Date | null;
  completedAt: Date | null;
}

export interface MockOrderItem {
  id: number;
  orderId: number;
  partId: number;
  partName: string;
  partNumber: string;
  quantity: number;
  quantityFulfilled: number;
  status: string;
}

export interface MockStockHistory {
  id: number;
  partId: number;
  partName: string;
  partNumber: string;
  userId: number;
  userName: string;
  quantityChange: number;
  reason: string;
  orderId: number | null;
  notes: string;
  createdAt: Date;
}

export interface MockHierarchyNode {
  id: number;
  name: string;
  parentId: number | null;
  nodeTypeId: number;
  nodeTypeName: string;
  path: string;
  sortOrder: number;
}

export interface MockCart {
  items: Array<{
    partId: number;
    partNumber: string;
    name: string;
    quantity: number;
    price?: string;
  }>;
}

// ============================================
// Фабрики пользователей
// ============================================

export const userFactory = {
  admin(): MockUser {
    return {
      id: 1,
      email: 'admin@wms-autoparts.local',
      fullName: 'Администратор Системы',
      roleTypeId: 1,
      roleName: 'admin',
      permissions: ['*'],
      isActive: true,
    };
  },

  mechanic(id = 2): MockUser {
    return {
      id,
      email: `mechanic${id}@wms-autoparts.local`,
      fullName: `Механик ${id}`,
      roleTypeId: 2,
      roleName: 'mechanic',
      permissions: [
        'order_create',
        'order_view',
        'order_edit_own',
        'parts_view',
        'cart_manage',
      ],
      isActive: true,
    };
  },

  repairManager(id = 3): MockUser {
    return {
      id,
      email: `repair.manager${id}@wms-autoparts.local`,
      fullName: `Менеджер по ремонту ${id}`,
      roleTypeId: 3,
      roleName: 'repair_manager',
      permissions: [
        'order_view',
        'order_approve',
        'order_reject',
        'parts_view',
        'users_view',
      ],
      isActive: true,
    };
  },

  storekeeper(id = 4): MockUser {
    return {
      id,
      email: `storekeeper${id}@wms-autoparts.local`,
      fullName: `Кладовщик ${id}`,
      roleTypeId: 4,
      roleName: 'storekeeper',
      permissions: [
        'order_view',
        'order_fulfill',
        'stock_view',
        'stock_manage',
        'parts_view',
        'parts_manage',
      ],
      isActive: true,
    };
  },

  inactive(): MockUser {
    return {
      id: 99,
      email: 'inactive@wms-autoparts.local',
      fullName: 'Неактивный Пользователь',
      roleTypeId: 2,
      roleName: 'mechanic',
      permissions: ['order_create'],
      isActive: false,
    };
  },
};

// ============================================
// Фабрики запчастей
// ============================================

export const partFactory = {
  basic(id = 1): MockPart {
    return {
      id,
      name: `Масляный фильтр ${id}`,
      partNumber: `OF-${String(id).padStart(5, '0')}`,
      description: `Качественный масляный фильтр для двигателя ${id}`,
      stock: 50,
      price: '1250.00',
      minStockLevel: 10,
      location: `A-${String(id).padStart(2, '0')}-01`,
      hierarchyId: 10,
      hierarchyName: 'Фильтры',
    };
  },

  brakePad(id = 2): MockPart {
    return {
      id,
      name: `Тормозные колодки ${id}`,
      partNumber: `BP-${String(id).padStart(5, '0')}`,
      description: `Передние тормозные колодки ${id}`,
      stock: 30,
      price: '4500.00',
      minStockLevel: 5,
      location: `B-${String(id).padStart(2, '0')}-02`,
      hierarchyId: 20,
      hierarchyName: 'Тормозная система',
    };
  },

  sparkPlug(id = 3): MockPart {
    return {
      id,
      name: `Свеча зажигания ${id}`,
      partNumber: `SP-${String(id).padStart(5, '0')}`,
      description: `Иридиевая свеча зажигания ${id}`,
      stock: 100,
      price: '890.00',
      minStockLevel: 20,
      location: `C-${String(id).padStart(2, '0')}-03`,
      hierarchyId: 30,
      hierarchyName: 'Система зажигания',
    };
  },

  lowStock(id = 4): MockPart {
    return {
      id,
      name: `Воздушный фильтр ${id}`,
      partNumber: `AF-${String(id).padStart(5, '0')}`,
      description: `Воздушный фильтр двигателя ${id}`,
      stock: 3,
      price: '750.00',
      minStockLevel: 15,
      location: `A-${String(id).padStart(2, '0')}-04`,
      hierarchyId: 10,
      hierarchyName: 'Фильтры',
    };
  },

  outOfStock(id = 5): MockPart {
    return {
      id,
      name: `Топливный фильтр ${id}`,
      partNumber: `FF-${String(id).padStart(5, '0')}`,
      description: `Топливный фильтр высокого давления ${id}`,
      stock: 0,
      price: '2100.00',
      minStockLevel: 8,
      location: `A-${String(id).padStart(2, '0')}-05`,
      hierarchyId: 10,
      hierarchyName: 'Фильтры',
    };
  },
};

// ============================================
// Фабрики заказов
// ============================================

export const orderFactory = {
  draft(id = 1, mechanicId = 2): MockOrder {
    return {
      id,
      mechanicId,
      mechanicName: 'Механик 1',
      repairManagerId: null,
      statusId: 1,
      statusName: 'draft',
      statusDisplayName: 'Черновик',
      statusColor: 'gray',
      priority: 1,
      notes: 'Заказ в статусе черновика',
      itemsCount: 3,
      createdAt: new Date(),
      approvedAt: null,
      completedAt: null,
    };
  },

  submitted(id = 2, mechanicId = 2): MockOrder {
    return {
      id,
      mechanicId,
      mechanicName: 'Механик 1',
      repairManagerId: null,
      statusId: 2,
      statusName: 'submitted',
      statusDisplayName: 'На согласовании',
      statusColor: 'yellow',
      priority: 1,
      notes: 'Заказ отправлен на согласование',
      itemsCount: 3,
      createdAt: new Date(),
      approvedAt: null,
      completedAt: null,
    };
  },

  approved(id = 3, mechanicId = 2, repairManagerId = 3): MockOrder {
    return {
      id,
      mechanicId,
      mechanicName: 'Механик 1',
      repairManagerId,
      statusId: 3,
      statusName: 'approved',
      statusDisplayName: 'Согласован',
      statusColor: 'green',
      priority: 2,
      notes: 'Заказ согласован менеджером',
      itemsCount: 3,
      createdAt: new Date(),
      approvedAt: new Date(),
      completedAt: null,
    };
  },

  partiallyFulfilled(id = 4, mechanicId = 2): MockOrder {
    return {
      id,
      mechanicId,
      mechanicName: 'Механик 1',
      repairManagerId: 3,
      statusId: 5,
      statusName: 'partially_fulfilled',
      statusDisplayName: 'Частично выдан',
      statusColor: 'blue',
      priority: 2,
      notes: 'Заказ частично выдан со склада',
      itemsCount: 5,
      createdAt: new Date(),
      approvedAt: new Date(),
      completedAt: null,
    };
  },

  fulfilled(id = 5, mechanicId = 2): MockOrder {
    return {
      id,
      mechanicId,
      mechanicName: 'Механик 1',
      repairManagerId: 3,
      statusId: 4,
      statusName: 'fulfilled',
      statusDisplayName: 'Выдан',
      statusColor: 'blue',
      priority: 2,
      notes: 'Заказ полностью выдан',
      itemsCount: 3,
      createdAt: new Date(),
      approvedAt: new Date(),
      completedAt: new Date(),
    };
  },

  rejected(id = 6, mechanicId = 2): MockOrder {
    return {
      id,
      mechanicId,
      mechanicName: 'Механик 1',
      repairManagerId: null,
      statusId: 7,
      statusName: 'rejected',
      statusDisplayName: 'Отклонен',
      statusColor: 'red',
      priority: 1,
      notes: 'Отклонено: Недостаточно обоснования',
      itemsCount: 2,
      createdAt: new Date(),
      approvedAt: null,
      completedAt: null,
    };
  },
};

// ============================================
// Фабрики позиций заказа
// ============================================

export const orderItemFactory = {
  pending(orderId = 1, partId = 1): MockOrderItem {
    return {
      id: 1,
      orderId,
      partId,
      partName: 'Масляный фильтр',
      partNumber: 'OF-00001',
      quantity: 2,
      quantityFulfilled: 0,
      status: 'pending',
    };
  },

  partiallyFulfilled(orderId = 1, partId = 1): MockOrderItem {
    return {
      id: 1,
      orderId,
      partId,
      partName: 'Масляный фильтр',
      partNumber: 'OF-00001',
      quantity: 2,
      quantityFulfilled: 1,
      status: 'partially_fulfilled',
    };
  },

  fulfilled(orderId = 1, partId = 1): MockOrderItem {
    return {
      id: 1,
      orderId,
      partId,
      partName: 'Масляный фильтр',
      partNumber: 'OF-00001',
      quantity: 2,
      quantityFulfilled: 2,
      status: 'fulfilled',
    };
  },
};

// ============================================
// Фабрики иерархии
// ============================================

export const hierarchyFactory = {
  category(id = 1): MockHierarchyNode {
    return {
      id,
      name: 'Запчасти для ТО',
      parentId: null,
      nodeTypeId: 1,
      nodeTypeName: 'category',
      path: '/запчасти-для-то',
      sortOrder: 1,
    };
  },

  subcategory(id = 10): MockHierarchyNode {
    return {
      id,
      name: 'Фильтры',
      parentId: 1,
      nodeTypeId: 2,
      nodeTypeName: 'subcategory',
      path: '/запчасти-для-то/фильтры',
      sortOrder: 1,
    };
  },

  brakeSystem(id = 20): MockHierarchyNode {
    return {
      id,
      name: 'Тормозная система',
      parentId: 1,
      nodeTypeId: 2,
      nodeTypeName: 'subcategory',
      path: '/запчасти-для-то/тормозная-система',
      sortOrder: 2,
    };
  },

  ignitionSystem(id = 30): MockHierarchyNode {
    return {
      id,
      name: 'Система зажигания',
      parentId: 1,
      nodeTypeId: 2,
      nodeTypeName: 'subcategory',
      path: '/запчасти-для-то/система-зажигания',
      sortOrder: 3,
    };
  },
};

// ============================================
// Фабрики истории склада
// ============================================

export const stockHistoryFactory = {
  receipt(id = 1): MockStockHistory {
    return {
      id,
      partId: 1,
      partName: 'Масляный фильтр',
      partNumber: 'OF-00001',
      userId: 4,
      userName: 'Кладовщик 1',
      quantityChange: 50,
      reason: 'receipt',
      orderId: null,
      notes: 'Приход от поставщика',
      createdAt: new Date(),
    };
  },

  writeOff(id = 2): MockStockHistory {
    return {
      id,
      partId: 1,
      partName: 'Масляный фильтр',
      partNumber: 'OF-00001',
      userId: 4,
      userName: 'Кладовщик 1',
      quantityChange: -5,
      reason: 'write_off',
      orderId: null,
      notes: 'Списание по акту',
      createdAt: new Date(),
    };
  },

  orderFulfillment(id = 3): MockStockHistory {
    return {
      id,
      partId: 1,
      partName: 'Масляный фильтр',
      partNumber: 'OF-00001',
      userId: 4,
      userName: 'Кладовщик 1',
      quantityChange: -2,
      reason: 'order_fulfillment',
      orderId: 1,
      notes: 'Выдача по заказу #1',
      createdAt: new Date(),
    };
  },
};

// ============================================
// Фабрики корзины
// ============================================

export const cartFactory = {
  empty(): MockCart {
    return { items: [] };
  },

  singleItem(partId = 1): MockCart {
    return {
      items: [
        {
          partId,
          partNumber: 'OF-00001',
          name: 'Масляный фильтр',
          quantity: 2,
          price: '1250.00',
        },
      ],
    };
  },

  multipleItems(): MockCart {
    return {
      items: [
        {
          partId: 1,
          partNumber: 'OF-00001',
          name: 'Масляный фильтр',
          quantity: 2,
          price: '1250.00',
        },
        {
          partId: 2,
          partNumber: 'BP-00002',
          name: 'Тормозные колодки',
          quantity: 1,
          price: '4500.00',
        },
        {
          partId: 3,
          partNumber: 'SP-00003',
          name: 'Свеча зажигания',
          quantity: 4,
          price: '890.00',
        },
      ],
    };
  },
};

// ============================================
// Валидационные данные
// ============================================

export const validationData = {
  // Валидные email
  validEmails: [
    'test@example.com',
    'user.name@domain.org',
    'user+tag@example.co.uk',
    'admin@wms-autoparts.local',
  ],

  // Невалидные email
  invalidEmails: [
    'invalid',
    'invalid@',
    '@example.com',
    'user@.com',
    '',
  ],

  // Валидные пароли
  validPasswords: [
    'SecurePass123!',
    'MyP@ssw0rd',
    'StrongPassword1!',
    'Complex123$Pass',
  ],

  // Невалидные пароли
  invalidPasswords: [
    '123',
    'password',
    'qwerty',
    'short',
    'ноуспешалчарс123',
  ],

  // Валидные номера запчастей
  validPartNumbers: [
    'OF-00001',
    'BP-12345',
    'SP-99999',
    'ABC123',
  ],

  // Неалидные номера запчастей
  invalidPartNumbers: [
    '',
    'a',
    'AB',
    'ОченьДлинныйНомерЗапчастиКоторыйПревышаетМаксимум',
  ],

  // Валидные количества
  validQuantities: [1, 2, 5, 10, 100, 999],

  // Неалидные количества
  invalidQuantities: [0, -1, -100, 1000000],

  // Валидные цены
  validPrices: [
    '100.00',
    '1250.50',
    '99.99',
    '1000',
    '0.01',
  ],

  // Неалидные цены
  invalidPrices: [
    '-100.00',
    'abc',
    '100.999',
    '1,000.00',
    '$100',
  ],
};

// ============================================
// API Response моки
// ============================================

export const apiResponseFactory = {
  success<T>(data: T) {
    return {
      success: true as const,
      data,
      error: null,
      timestamp: new Date().toISOString(),
    };
  },

  error(code: string, message: string, details?: any) {
    return {
      success: false as const,
      data: null,
      error: {
        code,
        message,
        details,
      },
      timestamp: new Date().toISOString(),
    };
  },

  paginated<T>(items: T[], total: number, page = 1, limit = 20) {
    return {
      success: true as const,
      data: {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      error: null,
      timestamp: new Date().toISOString(),
    };
  },
};

// ============================================
// Сессионные данные для тестов
// ============================================

export const sessionFactory = {
  authenticated(user: MockUser) {
    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        roleName: user.roleName,
        roleTypeId: user.roleTypeId,
        permissions: user.permissions,
      },
    };
  },

  unauthenticated() {
    return null;
  },

  withPermissions(user: MockUser, permissions: string[]) {
    return {
      user: {
        ...user,
        permissions,
      },
    };
  },
};

// ============================================
// Экспорт всех фабрик
// ============================================

export const factories = {
  user: userFactory,
  part: partFactory,
  order: orderFactory,
  orderItem: orderItemFactory,
  hierarchy: hierarchyFactory,
  stockHistory: stockHistoryFactory,
  cart: cartFactory,
  apiResponse: apiResponseFactory,
  session: sessionFactory,
};

export default factories;
