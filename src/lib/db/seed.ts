/**
 * Seed данные для WMS Autoparts
 * 
 * Запуск: npm run db:seed
 * 
 * Создает:
 * - Типы узлов (category, part)
 * - Роли с permissions (MECHANIC, REPAIR_MANAGER, STOREKEEPER, ADMIN)
 * - Статусы заказов с allowed_transitions
 * - Первого пользователя admin
 * - Пример иерархии запчастей
 * - Примеры запчастей (15 штук)
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { eq, isNull } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

// Используем отдельные параметры подключения вместо URL
const client = postgres({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5435'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'wms_autoparts',
});
const db = drizzle(client, { schema });

// ==================== Данные для seed ====================

// Типы узлов
const nodeTypesData = [
  {
    name: 'category',
    displayName: 'Категория',
    icon: 'folder',
    defaultAttributes: { color: '#1976d2' },
    canHaveChildren: true,
    canHaveParts: true,
    sortOrder: 1,
  },
  {
    name: 'part',
    displayName: 'Запчасть',
    icon: 'build',
    defaultAttributes: {},
    canHaveChildren: false,
    canHaveParts: false,
    sortOrder: 2,
  },
];

// Роли с permissions
const roleTypesData = [
  {
    name: 'MECHANIC',
    displayName: 'Механик',
    permissions: [
      'catalog_view',
      'order_create',
      'order_edit_own_draft',
      'order_view_own',
    ],
    sortOrder: 1,
    isSystem: true,
  },
  {
    name: 'REPAIR_MANAGER',
    displayName: 'Менеджер по ремонту',
    permissions: [
      'catalog_view',
      'order_create',
      'order_edit_own_draft',
      'order_view_own',
      'order_view_all',
      'order_approve',
      'reports_view',
    ],
    sortOrder: 2,
    isSystem: true,
  },
  {
    name: 'STOREKEEPER',
    displayName: 'Кладовщик',
    permissions: [
      'catalog_view',
      'order_view_all',
      'order_fulfill',
      'stock_manage',
      'stock_view_history',
      'parts_manage',
    ],
    sortOrder: 3,
    isSystem: true,
  },
  {
    name: 'ADMIN',
    displayName: 'Администратор',
    permissions: [
      'catalog_view',
      'order_create',
      'order_edit_own_draft',
      'order_view_own',
      'order_view_all',
      'order_approve',
      'order_fulfill',
      'stock_manage',
      'stock_view_history',
      'user_manage',
      'role_manage',
      'hierarchy_manage',
      'parts_manage',
      'reports_view',
      'settings_access',
    ],
    sortOrder: 4,
    isSystem: true,
  },
];

// Статусы заказов с allowed_transitions
const orderStatusesData = [
  {
    name: 'draft',
    displayName: 'Черновик',
    color: '#9e9e9e',
    isFinal: false,
    isEditable: true,
    allowedTransitions: [2, 3], // submitted, rejected
  },
  {
    name: 'submitted',
    displayName: 'Отправлен',
    color: '#2196f3',
    isFinal: false,
    isEditable: false,
    allowedTransitions: [4, 5, 6], // approved, rejected, partially_fulfilled
  },
  {
    name: 'approved',
    displayName: 'Согласован',
    color: '#4caf50',
    isFinal: false,
    isEditable: false,
    allowedTransitions: [5, 6, 7], // rejected, partially_fulfilled, fulfilled
  },
  {
    name: 'rejected',
    displayName: 'Отклонен',
    color: '#f44336',
    isFinal: true,
    isEditable: false,
    allowedTransitions: [1], // draft (возврат на доработку)
  },
  {
    name: 'partially_fulfilled',
    displayName: 'Частично выдан',
    color: '#ff9800',
    isFinal: false,
    isEditable: false,
    allowedTransitions: [7], // fulfilled
  },
  {
    name: 'fulfilled',
    displayName: 'Выдан',
    color: '#00bcd4',
    isFinal: true,
    isEditable: false,
    allowedTransitions: [],
  },
];

// Пользователи
const usersData = [
  {
    email: 'admin@wms.local',
    password: 'Admin123!',
    fullName: 'Администратор Системы',
    roleName: 'ADMIN',
    isActive: true,
  },
  {
    email: 'mechanic@wms.local',
    password: 'Mechanic123!',
    fullName: 'Иван Петров',
    roleName: 'MECHANIC',
    isActive: true,
  },
  {
    email: 'manager@wms.local',
    password: 'Manager123!',
    fullName: 'Алексей Смирнов',
    roleName: 'REPAIR_MANAGER',
    isActive: true,
  },
  {
    email: 'storekeeper@wms.local',
    password: 'Storekeeper123!',
    fullName: 'Дмитрий Козлов',
    roleName: 'STOREKEEPER',
    isActive: true,
  },
];

// Иерархия запчастей (Materialized Path)
const hierarchyData = [
  {
    name: 'Корень',
    path: '1',
    parentPath: null,
    nodeTypeName: 'category',
    attributes: { description: 'Корневой узел иерархии' },
    sortOrder: 0,
  },
  {
    name: 'Двигатель',
    path: '1.2',
    parentPath: '1',
    nodeTypeName: 'category',
    attributes: { description: 'Двигатель и компоненты' },
    sortOrder: 1,
  },
  {
    name: 'Поршневая группа',
    path: '1.2.3',
    parentPath: '1.2',
    nodeTypeName: 'category',
    attributes: { description: 'Поршни, кольца, пальцы' },
    sortOrder: 1,
  },
  {
    name: 'Трансмиссия',
    path: '1.4',
    parentPath: '1',
    nodeTypeName: 'category',
    attributes: { description: 'КПП, сцепление, приводы' },
    sortOrder: 2,
  },
  {
    name: 'Сцепление',
    path: '1.4.5',
    parentPath: '1.4',
    nodeTypeName: 'category',
    attributes: { description: 'Диск сцепления, корзина, выжимной' },
    sortOrder: 1,
  },
  {
    name: 'Тормозная система',
    path: '1.6',
    parentPath: '1',
    nodeTypeName: 'category',
    attributes: { description: 'Тормоза, колодки, диски' },
    sortOrder: 3,
  },
  {
    name: 'Передние тормоза',
    path: '1.6.7',
    parentPath: '1.6',
    nodeTypeName: 'category',
    attributes: { description: 'Передние тормозные компоненты' },
    sortOrder: 1,
  },
  {
    name: 'Задние тормоза',
    path: '1.6.8',
    parentPath: '1.6',
    nodeTypeName: 'category',
    attributes: { description: 'Задние тормозные компоненты' },
    sortOrder: 2,
  },
  {
    name: 'Подвеска',
    path: '1.9',
    parentPath: '1',
    nodeTypeName: 'category',
    attributes: { description: 'Амортизаторы, рычаги, сайлентблоки' },
    sortOrder: 4,
  },
  {
    name: 'Передняя подвеска',
    path: '1.9.10',
    parentPath: '1.9',
    nodeTypeName: 'category',
    attributes: { description: 'Передние элементы подвески' },
    sortOrder: 1,
  },
];

// Запчасти
const partsData = [
  {
    name: 'Поршень комплект (стандарт)',
    partNumber: 'PN-001-STD',
    description: 'Комплект поршней стандартного размера для ВАЗ 2110-2112',
    stock: 24,
    price: '4500.00',
    minStockLevel: 5,
    location: 'A-1-1',
    hierarchyPath: '1.2.3',
    specifications: {
      diameter: '82.0 мм',
      compression_height: '32.5 мм',
      material: 'Алюминиевый сплав',
      manufacturer: 'АвтоВАЗ',
    },
  },
  {
    name: 'Поршень комплект (+0.5)',
    partNumber: 'PN-001-05',
    description: 'Комплект поршней ремонтного размера +0.5мм',
    stock: 12,
    price: '4800.00',
    minStockLevel: 5,
    location: 'A-1-2',
    hierarchyPath: '1.2.3',
    specifications: {
      diameter: '82.5 мм',
      compression_height: '32.5 мм',
      material: 'Алюминиевый сплав',
      manufacturer: 'АвтоВАЗ',
    },
  },
  {
    name: 'Кольца поршневые комплект',
    partNumber: 'PR-002-STD',
    description: 'Комплект поршневых колец (компрессионные + маслосъемные)',
    stock: 50,
    price: '1200.00',
    minStockLevel: 10,
    location: 'A-1-3',
    hierarchyPath: '1.2.3',
    specifications: {
      type: 'Компрессионные + маслосъемные',
      material: 'Чугун',
      manufacturer: 'Kolbenschmidt',
    },
  },
  {
    name: 'Палец поршневой',
    partNumber: 'PP-003',
    description: 'Поршневой палец с стопорными кольцами',
    stock: 100,
    price: '350.00',
    minStockLevel: 20,
    location: 'A-1-4',
    hierarchyPath: '1.2.3',
    specifications: {
      diameter: '22 мм',
      length: '55 мм',
      material: 'Сталь',
    },
  },
  {
    name: 'Диск сцепления ВАЗ 2110',
    partNumber: 'CL-101',
    description: 'Диск сцепления ведомый для ВАЗ 2110-2112',
    stock: 18,
    price: '2100.00',
    minStockLevel: 5,
    location: 'B-2-1',
    hierarchyPath: '1.4.5',
    specifications: {
      diameter: '200 мм',
      teeth: '22',
      manufacturer: 'Valeo',
    },
  },
  {
    name: 'Корзина сцепления',
    partNumber: 'CL-102',
    description: 'Корзина сцепления в сборе',
    stock: 15,
    price: '3500.00',
    minStockLevel: 5,
    location: 'B-2-2',
    hierarchyPath: '1.4.5',
    specifications: {
      type: 'Нажимная',
      diameter: '200 мм',
      manufacturer: 'Valeo',
    },
  },
  {
    name: 'Выжимной подшипник',
    partNumber: 'CL-103',
    description: 'Подшипник выключения сцепления',
    stock: 25,
    price: '1800.00',
    minStockLevel: 8,
    location: 'B-2-3',
    hierarchyPath: '1.4.5',
    specifications: {
      type: 'Гидравлический',
      manufacturer: 'INA',
    },
  },
  {
    name: 'Колодки тормозные передние',
    partNumber: 'BP-201',
    description: 'Комплект тормозных колодок передних',
    stock: 40,
    price: '1500.00',
    minStockLevel: 10,
    location: 'C-3-1',
    hierarchyPath: '1.6.7',
    specifications: {
      type: 'Дисковые',
      material: 'Керамика',
      manufacturer: 'TRW',
    },
  },
  {
    name: 'Диск тормозной передний',
    partNumber: 'BR-202',
    description: 'Тормозной диск передний вентилируемый',
    stock: 20,
    price: '2800.00',
    minStockLevel: 8,
    location: 'C-3-2',
    hierarchyPath: '1.6.7',
    specifications: {
      diameter: '260 мм',
      thickness: '22 мм',
      type: 'Вентилируемый',
      manufacturer: 'Brembo',
    },
  },
  {
    name: 'Колодки тормозные задние',
    partNumber: 'BP-203',
    description: 'Комплект тормозных колодок задних',
    stock: 35,
    price: '1200.00',
    minStockLevel: 10,
    location: 'C-3-3',
    hierarchyPath: '1.6.8',
    specifications: {
      type: 'Барабанные',
      material: 'Органика',
      manufacturer: 'TRW',
    },
  },
  {
    name: 'Амортизатор передний',
    partNumber: 'SH-301',
    description: 'Амортизатор передней подвески газовый',
    stock: 16,
    price: '4200.00',
    minStockLevel: 4,
    location: 'D-4-1',
    hierarchyPath: '1.9.10',
    specifications: {
      type: 'Газовый',
      side: 'Универсальный',
      manufacturer: 'KYB',
    },
  },
  {
    name: 'Рычаг подвески передний',
    partNumber: 'AR-302',
    description: 'Рычаг передней подвески нижний',
    stock: 12,
    price: '3800.00',
    minStockLevel: 4,
    location: 'D-4-2',
    hierarchyPath: '1.9.10',
    specifications: {
      side: 'Левый/Правый',
      material: 'Сталь',
      manufacturer: 'Febi',
    },
  },
  {
    name: 'Сайлентблок рычага',
    partNumber: 'SB-303',
    description: 'Сайлентблок переднего рычага',
    stock: 60,
    price: '450.00',
    minStockLevel: 20,
    location: 'D-4-3',
    hierarchyPath: '1.9.10',
    specifications: {
      material: 'Резина-металл',
      manufacturer: 'Lemforder',
    },
  },
  {
    name: 'Масло моторное 5W-40',
    partNumber: 'OIL-401',
    description: 'Моторное масло синтетическое 5W-40, 4л',
    stock: 48,
    price: '3200.00',
    minStockLevel: 12,
    location: 'E-5-1',
    hierarchyPath: '1',
    specifications: {
      viscosity: '5W-40',
      volume: '4л',
      type: 'Синтетика',
      manufacturer: 'Mobil 1',
    },
  },
  {
    name: 'Фильтр масляный',
    partNumber: 'OF-402',
    description: 'Фильтр масляный двигателя',
    stock: 80,
    price: '450.00',
    minStockLevel: 20,
    location: 'E-5-2',
    hierarchyPath: '1',
    specifications: {
      type: 'Навивной',
      manufacturer: 'Mann-Filter',
    },
  },
];

// ==================== Функции seed ====================

async function seedNodeTypes() {
  console.log('📁 Создание типов узлов...');

  for (const nodeType of nodeTypesData) {
    const existing = await db.query.nodeTypes.findFirst({
      where: eq(schema.nodeTypes.name, nodeType.name),
    });

    if (!existing) {
      await db.insert(schema.nodeTypes).values(nodeType);
      console.log(`  ✓ Создан тип узла: ${nodeType.displayName}`);
    } else {
      console.log(`  ⊘ Пропущен тип узла: ${nodeType.displayName} (уже существует)`);
    }
  }
}

async function seedRoleTypes() {
  console.log('👥 Создание ролей...');

  for (const role of roleTypesData) {
    const existing = await db.query.roleTypes.findFirst({
      where: eq(schema.roleTypes.name, role.name),
    });

    if (!existing) {
      await db.insert(schema.roleTypes).values(role);
      console.log(`  ✓ Создана роль: ${role.displayName}`);
    } else {
      console.log(`  ⊘ Пропущена роль: ${role.displayName} (уже существует)`);
    }
  }
}

async function seedOrderStatuses() {
  console.log('📊 Создание статусов заказов...');

  for (const status of orderStatusesData) {
    const existing = await db.query.orderStatuses.findFirst({
      where: eq(schema.orderStatuses.name, status.name),
    });

    if (!existing) {
      await db.insert(schema.orderStatuses).values(status);
      console.log(`  ✓ Создан статус: ${status.displayName}`);
    } else {
      console.log(`  ⊘ Пропущен статус: ${status.displayName} (уже существует)`);
    }
  }
}

async function seedUsers() {
  console.log('👤 Создание пользователей...');

  for (const userData of usersData) {
    const role = await db.query.roleTypes.findFirst({
      where: eq(schema.roleTypes.name, userData.roleName),
    });

    if (!role) {
      console.error(`  ✗ Роль не найдена: ${userData.roleName}`);
      continue;
    }

    const existing = await db.query.users.findFirst({
      where: eq(schema.users.email, userData.email),
    });

    if (!existing) {
      const passwordHash = await bcrypt.hash(userData.password, 10);
      await db.insert(schema.users).values({
        email: userData.email,
        passwordHash,
        fullName: userData.fullName,
        roleTypeId: role.id,
        isActive: userData.isActive,
      });
      console.log(`  ✓ Создан пользователь: ${userData.email}`);
    } else {
      console.log(`  ⊘ Пропущен пользователь: ${userData.email} (уже существует)`);
    }
  }
}

async function seedHierarchy() {
  console.log('🌳 Создание иерархии...');

  // Карта для хранения ID узлов по path
  const nodeIdsByPath: Record<string, number> = {};

  for (const node of hierarchyData) {
    const nodeType = await db.query.nodeTypes.findFirst({
      where: eq(schema.nodeTypes.name, node.nodeTypeName),
    });

    if (!nodeType) {
      console.error(`  ✗ Тип узла не найден: ${node.nodeTypeName}`);
      continue;
    }

    const existing = await db.query.itemHierarchy.findFirst({
      where: eq(schema.itemHierarchy.path, node.path),
    });

    if (!existing) {
      const parentId = node.parentPath ? nodeIdsByPath[node.parentPath] : null;

      const inserted = await db.insert(schema.itemHierarchy).values({
        parentId,
        nodeTypeId: nodeType.id,
        name: node.name,
        path: node.path,
        attributes: node.attributes,
        sortOrder: node.sortOrder,
      }).returning();

      nodeIdsByPath[node.path] = inserted[0].id;
      console.log(`  ✓ Создан узел: ${node.name} (${node.path})`);
    } else {
      nodeIdsByPath[node.path] = existing.id;
      console.log(`  ⊘ Пропущен узел: ${node.name} (${node.path}) (уже существует)`);
    }
  }

  return nodeIdsByPath;
}

async function seedParts(nodeIdsByPath: Record<string, number>) {
  console.log('🔧 Создание запчастей...');

  for (const part of partsData) {
    const existing = await db.query.parts.findFirst({
      where: eq(schema.parts.partNumber, part.partNumber),
    });

    if (!existing) {
      const hierarchyNode = nodeIdsByPath[part.hierarchyPath];

      await db.insert(schema.parts).values({
        name: part.name,
        partNumber: part.partNumber,
        description: part.description,
        stock: part.stock,
        price: part.price,
        minStockLevel: part.minStockLevel,
        location: part.location,
        hierarchyId: hierarchyNode || null,
        specifications: part.specifications,
      });
      console.log(`  ✓ Создана запчасть: ${part.partNumber} - ${part.name}`);
    } else {
      console.log(`  ⊘ Пропущена запчасть: ${part.partNumber} (уже существует)`);
    }
  }
}

async function main() {
  console.log('🚀 Запуск seed данных для WMS Autoparts...\n');

  try {
    // Проверка подключения
    await client`SELECT 1`;
    console.log('✓ Подключение к базе данных успешно\n');

    // Seed в правильном порядке (с учетом foreign keys)
    await seedNodeTypes();
    console.log('');

    await seedRoleTypes();
    console.log('');

    await seedOrderStatuses();
    console.log('');

    await seedUsers();
    console.log('');

    const nodeIdsByPath = await seedHierarchy();
    console.log('');

    await seedParts(nodeIdsByPath);
    console.log('');

    console.log('✅ Seed данные успешно созданы!\n');
    console.log('📋 Учетные данные для входа:');
    console.log('   Admin:     admin@wms.local     / Admin123!');
    console.log('   Mechanic:  mechanic@wms.local  / Mechanic123!');
    console.log('   Manager:   manager@wms.local   / Manager123!');
    console.log('   Storekeeper: storekeeper@wms.local / Storekeeper123!');
  } catch (error) {
    console.error('❌ Ошибка при seed данных:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
