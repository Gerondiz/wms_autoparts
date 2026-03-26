import { db } from '@/lib/db';
import { parts, partImages, itemHierarchy, stockHistory } from '@/lib/db/schema';
import { eq, and, like, sql, desc, asc, inArray, isNull } from 'drizzle-orm';

/**
 * Получить запчасти для узла иерархии
 */
export async function getPartsByNodeId(
  nodeId: number,
  page: number = 1,
  limit: number = 20
) {
  const offset = (page - 1) * limit;

  // Получаем общее количество
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(parts)
    .where(eq(parts.hierarchyId, nodeId));

  const total = Number(countResult[0]?.count || 0);

  // Получаем запчасти
  const items = await db
    .select({
      id: parts.id,
      name: parts.name,
      partNumber: parts.partNumber,
      description: parts.description,
      stock: parts.stock,
      price: parts.price,
      minStockLevel: parts.minStockLevel,
      location: parts.location,
      hierarchyId: parts.hierarchyId,
      specifications: parts.specifications,
      primaryImage: partImages.imageUrl,
    })
    .from(parts)
    .leftJoin(partImages, and(eq(partImages.partId, parts.id), eq(partImages.isPrimary, true)))
    .where(eq(parts.hierarchyId, nodeId))
    .orderBy(asc(parts.name))
    .limit(limit)
    .offset(offset);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Глобальный поиск запчастей и узлов
 */
export async function searchPartsAndNodes(query: string, limit: number = 10) {
  const searchTerm = `%${query.toLowerCase()}%`;

  // Поиск запчастей
  const partsResults = await db
    .select({
      id: parts.id,
      name: parts.name,
      partNumber: parts.partNumber,
      description: parts.description,
      hierarchyId: parts.hierarchyId,
      hierarchyPath: itemHierarchy.path,
    })
    .from(parts)
    .leftJoin(itemHierarchy, eq(parts.hierarchyId, itemHierarchy.id))
    .where(
      sql`${parts.name} ILIKE ${searchTerm} OR ${parts.partNumber} ILIKE ${searchTerm}`
    )
    .limit(limit);

  // Поиск узлов
  const nodesResults = await db
    .select({
      id: itemHierarchy.id,
      name: itemHierarchy.name,
      path: itemHierarchy.path,
    })
    .from(itemHierarchy)
    .where(like(itemHierarchy.name, searchTerm))
    .limit(limit);

  return {
    parts: partsResults.map((p) => ({
      type: 'part' as const,
      id: p.id,
      name: p.name,
      partNumber: p.partNumber,
      hierarchyPath: p.hierarchyPath || '',
    })),
    nodes: nodesResults.map((n) => ({
      type: 'node' as const,
      id: n.id,
      name: n.name,
      path: n.path,
    })),
  };
}

/**
 * Получить запчасть по ID с изображениями и иерархией
 */
export async function getPartById(id: number) {
  const partResults = await db
    .select({
      id: parts.id,
      name: parts.name,
      partNumber: parts.partNumber,
      description: parts.description,
      stock: parts.stock,
      price: parts.price,
      minStockLevel: parts.minStockLevel,
      location: parts.location,
      hierarchyId: parts.hierarchyId,
      specifications: parts.specifications,
      hierarchyName: itemHierarchy.name,
      hierarchyPath: itemHierarchy.path,
    })
    .from(parts)
    .leftJoin(itemHierarchy, eq(parts.hierarchyId, itemHierarchy.id))
    .where(eq(parts.id, id))
    .limit(1);

  const part = partResults[0];
  if (!part) return null;

  // Получаем изображения
  const images = await db
    .select({
      id: partImages.id,
      imageUrl: partImages.imageUrl,
      isPrimary: partImages.isPrimary,
    })
    .from(partImages)
    .where(eq(partImages.partId, id))
    .orderBy(desc(partImages.isPrimary), asc(partImages.id));

  return {
    ...part,
    images,
  };
}

/**
 * Создать запчасть
 */
export async function createPart(data: {
  name: string;
  partNumber: string;
  description?: string;
  stock?: number;
  price?: string;
  minStockLevel?: number;
  location?: string;
  hierarchyId: number;
  specifications?: Record<string, any>;
}) {
  // Проверяем существование иерархии
  const hierarchy = await db
    .select({ id: itemHierarchy.id })
    .from(itemHierarchy)
    .where(eq(itemHierarchy.id, data.hierarchyId))
    .limit(1);

  if (hierarchy.length === 0) {
    throw new Error('Узел иерархии не найден');
  }

  const result = await db
    .insert(parts)
    .values({
      name: data.name,
      partNumber: data.partNumber,
      description: data.description,
      stock: data.stock ?? 0,
      price: data.price,
      minStockLevel: data.minStockLevel ?? 0,
      location: data.location,
      hierarchyId: data.hierarchyId,
      specifications: data.specifications ?? {},
    })
    .returning();

  return result[0];
}

/**
 * Обновить запчасть
 */
export async function updatePart(
  id: number,
  data: {
    name?: string;
    description?: string;
    stock?: number;
    price?: string;
    minStockLevel?: number;
    location?: string;
    hierarchyId?: number;
    specifications?: Record<string, any>;
  }
) {
  const result = await db
    .update(parts)
    .set(data)
    .where(eq(parts.id, id))
    .returning();

  return result[0] || null;
}

/**
 * Удалить запчасть
 */
export async function deletePart(id: number): Promise<boolean> {
  const result = await db
    .delete(parts)
    .where(eq(parts.id, id))
    .returning({ id: parts.id });

  return result.length > 0;
}

/**
 * Добавить изображение к запчасти
 */
export async function addPartImage(
  partId: number,
  imageUrl: string,
  isPrimary: boolean = false
) {
  // Если isPrimary = true, сбрасываем остальные
  if (isPrimary) {
    await db
      .update(partImages)
      .set({ isPrimary: false })
      .where(eq(partImages.partId, partId));
  }

  const result = await db
    .insert(partImages)
    .values({
      partId,
      imageUrl,
      isPrimary,
    })
    .returning();

  return result[0];
}

/**
 * Удалить изображение запчасти
 */
export async function deletePartImage(imageId: number): Promise<boolean> {
  const result = await db
    .delete(partImages)
    .where(eq(partImages.id, imageId))
    .returning({ id: partImages.id });

  return result.length > 0;
}

/**
 * Установить изображение как основное
 */
export async function setPrimaryImage(partId: number, imageId: number) {
  await db.transaction(async (tx) => {
    // Сбросить все основные
    await tx
      .update(partImages)
      .set({ isPrimary: false })
      .where(eq(partImages.partId, partId));

    // Установить новое основное
    await tx
      .update(partImages)
      .set({ isPrimary: true })
      .where(and(eq(partImages.partId, partId), eq(partImages.id, imageId)));
  });
}

/**
 * Получить запчасти с низким остатком
 */
export async function getLowStockParts(page: number = 1, limit: number = 20) {
  const offset = (page - 1) * limit;

  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(parts)
    .where(sql`${parts.stock} < ${parts.minStockLevel}`);

  const total = Number(countResult[0]?.count || 0);

  const items = await db
    .select({
      id: parts.id,
      name: parts.name,
      partNumber: parts.partNumber,
      stock: parts.stock,
      minStockLevel: parts.minStockLevel,
      location: parts.location,
      price: parts.price,
    })
    .from(parts)
    .where(sql`${parts.stock} < ${parts.minStockLevel}`)
    .orderBy(asc(parts.stock))
    .limit(limit)
    .offset(offset);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
