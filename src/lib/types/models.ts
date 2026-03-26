// Основные модели данных приложения

export interface UserRole {
  id: number;
  name: string;
  displayName: string | null;
  permissions: string[];
  isSystem: boolean;
  sortOrder: number | null;
}

export interface User {
  id: number;
  email: string;
  fullName: string | null;
  roleTypeId: number | null;
  isActive: boolean;
  createdAt: Date | null;
  roleType?: UserRole;
}

export interface NodeType {
  id: number;
  name: string;
  displayName: string | null;
  icon: string | null;
  defaultAttributes: Record<string, unknown> | null;
  canHaveChildren: boolean;
  canHaveParts: boolean;
  sortOrder: number | null;
}

export interface ItemHierarchy {
  id: number;
  parentId: number | null;
  nodeTypeId: number | null;
  name: string;
  path: string;
  sortOrder: number | null;
  attributes: Record<string, unknown> | null;
  parent?: ItemHierarchy;
  children?: ItemHierarchy[];
  nodeType?: NodeType;
  parts?: Part[];
}

export interface Part {
  id: number;
  name: string;
  partNumber: string;
  description: string | null;
  stock: number;
  price: string | null;
  minStockLevel: number | null;
  location: string | null;
  hierarchyId: number | null;
  specifications: Record<string, unknown> | null;
  hierarchy?: ItemHierarchy;
  images?: PartImage[];
}

export interface PartImage {
  id: number;
  partId: number;
  imageUrl: string;
  isPrimary: boolean;
  part?: Part;
}

export interface OrderStatus {
  id: number;
  name: string;
  displayName: string | null;
  color: string | null;
  isFinal: boolean;
  isEditable: boolean;
  allowedTransitions: number[] | null;
}

export interface OrderItem {
  id: number;
  orderId: number;
  partId: number;
  quantity: number;
  quantityFulfilled: number;
  status: string;
  order?: Order;
  part?: Part;
}

export interface Order {
  id: number;
  mechanicId: number | null;
  repairManagerId: number | null;
  statusId: number | null;
  priority: 1 | 2 | 3 | null;
  notes: string | null;
  approvedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  mechanic?: User;
  repairManager?: User;
  status?: OrderStatus;
  items?: OrderItem[];
}

export interface StockHistory {
  id: number;
  partId: number;
  userId: number | null;
  quantityChange: number;
  reason: string;
  orderId: number | null;
  notes: string | null;
  createdAt: Date | null;
  part?: Part;
  user?: User;
  order?: Order;
}
