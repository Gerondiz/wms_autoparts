import { z } from 'zod';

// ==================== Иерархия ====================

export const hierarchyChildrenSchema = z.object({
  parentId: z.string().transform((val) => (val === 'null' ? null : Number(val))).optional().nullable(),
});

export const hierarchyCreateSchema = z.object({
  name: z.string().min(1).max(255),
  parentId: z.number().int().positive().nullable(),
  nodeTypeId: z.number().int().positive(),
  sortOrder: z.number().int().nonnegative().optional().default(0),
  attributes: z.record(z.unknown()).optional().default({}),
});

export const hierarchyUpdateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  nodeTypeId: z.number().int().positive().optional(),
  sortOrder: z.number().int().nonnegative().optional(),
  attributes: z.record(z.unknown()).optional(),
});

export const hierarchyMoveSchema = z.object({
  newParentId: z.number().int().positive().nullable(),
  newSortOrder: z.number().int().nonnegative().optional(),
});

// ==================== Запчасти ====================

export const partsListSchema = z.object({
  nodeId: z.number().int().nonnegative().nullable(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
});

export const partsSearchSchema = z.object({
  q: z.string().min(1).max(255),
  limit: z.number().int().positive().max(50).optional().default(10),
});

export const partCreateSchema = z.object({
  name: z.string().min(1).max(255),
  partNumber: z.string().min(1).max(100),
  description: z.string().max(10000).optional(),
  stock: z.number().int().nonnegative().optional().default(0),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  minStockLevel: z.number().int().nonnegative().optional().default(0),
  location: z.string().max(100).optional(),
  hierarchyId: z.number().int().positive(),
  specifications: z.record(z.unknown()).optional().default({}),
});

export const partUpdateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(10000).optional(),
  stock: z.number().int().nonnegative().optional(),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  minStockLevel: z.number().int().nonnegative().optional(),
  location: z.string().max(100).optional(),
  hierarchyId: z.number().int().positive().optional(),
  specifications: z.record(z.unknown()).optional(),
});

export const partImageUploadSchema = z.object({
  isPrimary: z.boolean().optional().default(false),
});

// ==================== Заказы ====================

export const ordersListSchema = z.object({
  status: z.string().optional(),
  priority: z.number().int().positive().optional(),
  mechanicId: z.number().int().positive().optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
});

export const orderCreateSchema = z.object({
  items: z
    .array(
      z.object({
        partId: z.number().int().positive(),
        quantity: z.number().int().positive().min(1),
      })
    )
    .min(1),
  notes: z.string().max(5000).optional(),
  priority: z.number().int().min(1).max(3).optional(),
});

export const orderUpdateSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.number().int().positive().optional(),
        partId: z.number().int().positive(),
        quantity: z.number().int().positive().min(1),
      })
    )
    .optional(),
  notes: z.string().max(5000).optional(),
  priority: z.number().int().min(1).max(3).optional(),
});

export const orderSubmitSchema = z.object({
  notes: z.string().max(5000).optional(),
});

export const orderApproveSchema = z.object({
  priority: z.number().int().min(1).max(3),
  notes: z.string().max(5000).optional(),
});

export const orderRejectSchema = z.object({
  rejectionReason: z.string().min(1).max(1000),
});

export const orderFulfillSchema = z.object({
  items: z
    .array(
      z.object({
        orderItemId: z.number().int().positive(),
        quantityFulfilled: z.number().int().positive().min(1),
      })
    )
    .min(1),
  notes: z.string().max(1000).optional(),
});

// ==================== Склад ====================

export const stockListSchema = z.object({
  search: z.string().max(255).optional(),
  lowStock: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  nodeId: z.number().int().positive().optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
});

export const stockReceiptSchema = z.object({
  partId: z.number().int().positive(),
  quantity: z.number().int().positive().min(1),
  reason: z.string().min(1).max(100),
  notes: z.string().max(1000).optional(),
});

export const stockWriteOffSchema = z.object({
  partId: z.number().int().positive(),
  quantity: z.number().int().positive().min(1),
  reason: z.string().min(1).max(100),
  notes: z.string().max(1000).optional(),
});

export const stockHistorySchema = z.object({
  partId: z.number().int().positive().optional(),
  userId: z.number().int().positive().optional(),
  orderId: z.number().int().positive().optional(),
  reason: z.string().max(100).optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
});

// ==================== Пользователи ====================

export const userCreateSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  fullName: z.string().min(1).max(255),
  roleTypeId: z.number().int().positive(),
});

export const userUpdateSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(8).max(100).optional(),
  fullName: z.string().min(1).max(255).optional(),
  roleTypeId: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
});

// ==================== Роли ====================

export const roleCreateSchema = z.object({
  name: z.string().min(1).max(50),
  displayName: z.string().min(1).max(100),
  permissions: z.array(z.string()).min(1),
  sortOrder: z.number().int().nonnegative().optional().default(0),
});

export const roleUpdateSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  permissions: z.array(z.string()).min(1).optional(),
  sortOrder: z.number().int().nonnegative().optional(),
});

// ==================== Экспорт всех схем ====================

export const apiSchemas = {
  // Иерархия
  hierarchyChildren: hierarchyChildrenSchema,
  hierarchyCreate: hierarchyCreateSchema,
  hierarchyUpdate: hierarchyUpdateSchema,
  hierarchyMove: hierarchyMoveSchema,
  // Запчасти
  partsList: partsListSchema,
  partsSearch: partsSearchSchema,
  partCreate: partCreateSchema,
  partUpdate: partUpdateSchema,
  partImageUpload: partImageUploadSchema,
  // Заказы
  ordersList: ordersListSchema,
  orderCreate: orderCreateSchema,
  orderUpdate: orderUpdateSchema,
  orderSubmit: orderSubmitSchema,
  orderApprove: orderApproveSchema,
  orderReject: orderRejectSchema,
  orderFulfill: orderFulfillSchema,
  // Склад
  stockList: stockListSchema,
  stockReceipt: stockReceiptSchema,
  stockWriteOff: stockWriteOffSchema,
  stockHistory: stockHistorySchema,
  // Пользователи
  userCreate: userCreateSchema,
  userUpdate: userUpdateSchema,
  // Роли
  roleCreate: roleCreateSchema,
  roleUpdate: roleUpdateSchema,
};
