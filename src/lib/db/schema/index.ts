import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  timestamp,
  jsonb,
  decimal,
  boolean,
  index,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

// ==================== Справочники ====================

// Роли (справочник)
export const roleTypes = pgTable(
  'role_types',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 50 }).unique().notNull(),
    displayName: varchar('display_name', { length: 100 }),
    permissions: jsonb('permissions').notNull().default([]),
    sortOrder: integer('sort_order'),
    isSystem: boolean('is_system').default(false),
  },
  (table) => ({
    idx_role_types_name: index('idx_role_types_name').on(table.name),
  })
);

// Статусы заказов (справочник)
export const orderStatuses = pgTable(
  'order_statuses',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 50 }).unique().notNull(),
    displayName: varchar('display_name', { length: 100 }),
    color: varchar('color', { length: 20 }),
    isFinal: boolean('is_final').default(false),
    isEditable: boolean('is_editable').default(false),
    allowedTransitions: integer('allowed_transitions').array(),
  },
  (table) => ({
    idx_order_statuses_name: index('idx_order_statuses_name').on(table.name),
  })
);

// Типы узлов иерархии
export const nodeTypes = pgTable(
  'node_types',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 50 }).unique().notNull(),
    displayName: varchar('display_name', { length: 100 }),
    icon: varchar('icon', { length: 50 }),
    defaultAttributes: jsonb('default_attributes'),
    canHaveChildren: boolean('can_have_children').default(true),
    canHaveParts: boolean('can_have_parts').default(false),
    sortOrder: integer('sort_order'),
  },
  (table) => ({
    idx_node_types_name: index('idx_node_types_name').on(table.name),
  })
);

// ==================== Пользователи ====================

export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    email: varchar('email', { length: 255 }).unique().notNull(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    fullName: varchar('full_name', { length: 255 }),
    roleTypeId: integer('role_type_id').references(() => roleTypes.id, {
      onDelete: 'restrict',
    }),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    idx_users_email: index('idx_users_email').on(table.email),
    idx_users_role_type_id: index('idx_users_role_type_id').on(table.roleTypeId),
    idx_users_is_active: index('idx_users_is_active').on(table.isActive),
  })
);

// ==================== Иерархия ====================

export const itemHierarchy = pgTable(
  'item_hierarchy',
  {
    id: serial('id').primaryKey(),
    parentId: integer('parent_id').references((): any => itemHierarchy.id, {
      onDelete: 'cascade',
    }),
    nodeTypeId: integer('node_type_id').references(() => nodeTypes.id),
    name: varchar('name', { length: 255 }).notNull(),
    path: varchar('path', { length: 1024 }).notNull(),
    sortOrder: integer('sort_order'),
    attributes: jsonb('attributes'),
  },
  (table) => ({
    idx_item_hierarchy_path: index('idx_item_hierarchy_path').on(table.path),
    idx_item_hierarchy_parent_id: index('idx_item_hierarchy_parent_id').on(
      table.parentId
    ),
    idx_item_hierarchy_node_type_id: index('idx_item_hierarchy_node_type_id').on(
      table.nodeTypeId
    ),
  })
);

// ==================== Запчасти ====================

export const parts = pgTable(
  'parts',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    partNumber: varchar('part_number', { length: 100 }).unique().notNull(),
    description: text('description'),
    stock: integer('stock').notNull().default(0),
    price: decimal('price', { precision: 10, scale: 2 }),
    minStockLevel: integer('min_stock_level').default(0),
    location: varchar('location', { length: 100 }),
    hierarchyId: integer('hierarchy_id').references(() => itemHierarchy.id, {
      onDelete: 'restrict',
    }),
    specifications: jsonb('specifications'),
  },
  (table) => ({
    idx_parts_part_number: index('idx_parts_part_number').on(table.partNumber),
    idx_parts_hierarchy_id: index('idx_parts_hierarchy_id').on(table.hierarchyId),
    idx_parts_name: index('idx_parts_name').on(table.name),
    idx_parts_stock: index('idx_parts_stock').on(table.stock),
    // Composite index для поиска запчастей с низким остатком
    idx_parts_stock_min: index('idx_parts_stock_min').on(
      table.stock,
      table.minStockLevel
    ),
  })
);

// Изображения запчастей
export const partImages = pgTable(
  'part_images',
  {
    id: serial('id').primaryKey(),
    partId: integer('part_id').references(() => parts.id, {
      onDelete: 'cascade',
    }),
    imageUrl: varchar('image_url', { length: 500 }).notNull(),
    isPrimary: boolean('is_primary').default(false),
  },
  (table) => ({
    idx_part_images_part_id: index('idx_part_images_part_id').on(table.partId),
    idx_part_images_is_primary: index('idx_part_images_is_primary').on(
      table.isPrimary
    ),
  })
);

// ==================== Заказы ====================

export const orders = pgTable(
  'orders',
  {
    id: serial('id').primaryKey(),
    mechanicId: integer('mechanic_id').references(() => users.id, {
      onDelete: 'restrict',
    }),
    repairManagerId: integer('repair_manager_id').references(() => users.id),
    statusId: integer('status_id').references(() => orderStatuses.id),
    priority: integer('priority'), // 1-высокий, 2-средний, 3-низкий
    notes: text('notes'),
    approvedAt: timestamp('approved_at'),
    completedAt: timestamp('completed_at'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    idx_orders_mechanic_id: index('idx_orders_mechanic_id').on(table.mechanicId),
    idx_orders_repair_manager_id: index('idx_orders_repair_manager_id').on(
      table.repairManagerId
    ),
    idx_orders_status_id: index('idx_orders_status_id').on(table.statusId),
    idx_orders_created_at: index('idx_orders_created_at').on(table.createdAt),
    idx_orders_priority_status: index('idx_orders_priority_status').on(
      table.priority,
      table.statusId
    ),
  })
);

// Позиции заказа
export const orderItems = pgTable(
  'order_items',
  {
    id: serial('id').primaryKey(),
    orderId: integer('order_id').references(() => orders.id, {
      onDelete: 'cascade',
    }),
    partId: integer('part_id').references(() => parts.id, {
      onDelete: 'restrict',
    }),
    quantity: integer('quantity').notNull(),
    quantityFulfilled: integer('quantity_fulfilled').default(0),
    status: varchar('status', { length: 20 }).default('pending'),
  },
  (table) => ({
    idx_order_items_order_id: index('idx_order_items_order_id').on(table.orderId),
    idx_order_items_part_id: index('idx_order_items_part_id').on(table.partId),
    idx_order_items_status: index('idx_order_items_status').on(table.status),
  })
);

// ==================== История склада ====================

export const stockHistory = pgTable(
  'stock_history',
  {
    id: serial('id').primaryKey(),
    partId: integer('part_id').references(() => parts.id, {
      onDelete: 'cascade',
    }),
    userId: integer('user_id').references(() => users.id),
    quantityChange: integer('quantity_change').notNull(),
    reason: varchar('reason', { length: 100 }).notNull(),
    orderId: integer('order_id').references(() => orders.id, {
      onDelete: 'set null',
    }),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    idx_stock_history_part_id: index('idx_stock_history_part_id').on(table.partId),
    idx_stock_history_user_id: index('idx_stock_history_user_id').on(table.userId),
    idx_stock_history_order_id: index('idx_stock_history_order_id').on(table.orderId),
    idx_stock_history_created_at: index('idx_stock_history_created_at').on(
      table.createdAt
    ),
    // Composite index для истории по запчасти + дате
    idx_stock_history_part_created: index('idx_stock_history_part_created').on(
      table.partId,
      table.createdAt
    ),
  })
);

// ==================== Relations ====================

export const roleTypesRelations = relations(roleTypes, ({ many }) => ({
  users: many(users),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  roleType: one(roleTypes, {
    fields: [users.roleTypeId],
    references: [roleTypes.id],
  }),
  createdOrders: many(orders, { relationName: 'mechanicOrders' }),
  approvedOrders: many(orders, { relationName: 'repairManagerOrders' }),
  stockHistory: many(stockHistory),
}));

export const nodeTypesRelations = relations(nodeTypes, ({ many }) => ({
  hierarchyItems: many(itemHierarchy),
}));

export const itemHierarchyRelations = relations(
  itemHierarchy,
  ({ one, many }) => ({
    parent: one(itemHierarchy, {
      fields: [itemHierarchy.parentId],
      references: [itemHierarchy.id],
      relationName: 'hierarchyTree',
    }),
    children: many(itemHierarchy, { relationName: 'hierarchyTree' }),
    nodeType: one(nodeTypes, {
      fields: [itemHierarchy.nodeTypeId],
      references: [nodeTypes.id],
    }),
    parts: many(parts),
  })
);

export const partsRelations = relations(parts, ({ one, many }) => ({
  hierarchy: one(itemHierarchy, {
    fields: [parts.hierarchyId],
    references: [itemHierarchy.id],
  }),
  images: many(partImages),
  orderItems: many(orderItems),
  stockHistory: many(stockHistory),
}));

export const partImagesRelations = relations(partImages, ({ one }) => ({
  part: one(parts, {
    fields: [partImages.partId],
    references: [parts.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  mechanic: one(users, {
    fields: [orders.mechanicId],
    references: [users.id],
    relationName: 'mechanicOrders',
  }),
  repairManager: one(users, {
    fields: [orders.repairManagerId],
    references: [users.id],
    relationName: 'repairManagerOrders',
  }),
  status: one(orderStatuses, {
    fields: [orders.statusId],
    references: [orderStatuses.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  part: one(parts, {
    fields: [orderItems.partId],
    references: [parts.id],
  }),
}));

export const orderStatusesRelations = relations(orderStatuses, ({ many }) => ({
  orders: many(orders),
}));

export const stockHistoryRelations = relations(stockHistory, ({ one }) => ({
  part: one(parts, {
    fields: [stockHistory.partId],
    references: [parts.id],
  }),
  user: one(users, {
    fields: [stockHistory.userId],
    references: [users.id],
  }),
  order: one(orders, {
    fields: [stockHistory.orderId],
    references: [orders.id],
  }),
}));

// ==================== NextAuth Tables ====================

export const accounts = pgTable('accounts', {
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 255 })
    .$type<'oauth' | 'oidc' | 'email' | 'webauthn'>()
    .notNull(),
  provider: varchar('provider', { length: 255 }).notNull(),
  providerAccountId: varchar('provider_account_id', { length: 255 }).notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: varchar('token_type', { length: 255 }),
  scope: varchar('scope', { length: 255 }),
  id_token: text('id_token'),
  session_state: varchar('session_state', { length: 255 }),
});

export const sessions = pgTable('sessions', {
  sessionToken: varchar('session_token', { length: 255 }).primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

export const verificationTokens = pgTable(
  'verification_tokens',
  {
    identifier: varchar('identifier', { length: 255 }).notNull(),
    token: varchar('token', { length: 255 }).notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (table) => ({
    pk: index('verification_tokens_pk').on(table.identifier, table.token),
    single: index('verification_tokens_token').on(table.token),
  })
);
