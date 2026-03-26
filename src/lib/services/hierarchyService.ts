import { db } from '@/lib/db';
import { itemHierarchy, nodeTypes, parts } from '@/lib/db/schema';
import { eq, and, like, sql, desc, asc } from 'drizzle-orm';

/**
 * Получить дочерние узлы для заданного родителя
 */
export async function getHierarchyChildren(parentId: number | null) {
  const parentCondition = parentId === null 
    ? sql`${itemHierarchy.parentId} IS NULL`
    : eq(itemHierarchy.parentId, parentId);

  const children = await db
    .select({
      id: itemHierarchy.id,
      name: itemHierarchy.name,
      path: itemHierarchy.path,
      nodeTypeId: itemHierarchy.nodeTypeId,
      nodeTypeName: nodeTypes.name,
      nodeTypeDisplayName: nodeTypes.displayName,
      nodeTypeIcon: nodeTypes.icon,
      sortOrder: itemHierarchy.sortOrder,
      attributes: itemHierarchy.attributes,
      childrenCount: sql<number>`(
        SELECT COUNT(*) FROM ${itemHierarchy} ih 
        WHERE ih.parent_id = ${itemHierarchy.id}
      )`.as('children_count'),
      partsCount: sql<number>`(
        SELECT COUNT(*) FROM ${parts} p 
        WHERE p.hierarchy_id = ${itemHierarchy.id}
      )`.as('parts_count'),
    })
    .from(itemHierarchy)
    .leftJoin(nodeTypes, eq(itemHierarchy.nodeTypeId, nodeTypes.id))
    .where(parentCondition)
    .orderBy(asc(itemHierarchy.sortOrder), asc(itemHierarchy.name));

  return children;
}

/**
 * Получить путь к узлу (хлебные крошки)
 */
export async function getHierarchyPath(id: number) {
  // Используем рекурсивный CTE для получения пути
  const result: any = await db.execute(sql`
    WITH RECURSIVE hierarchy_path AS (
      SELECT id, name, path, parent_id, 0 as depth
      FROM item_hierarchy
      WHERE id = ${id}

      UNION ALL

      SELECT ih.id, ih.name, ih.path, ih.parent_id, hp.depth + 1
      FROM item_hierarchy ih
      INNER JOIN hierarchy_path hp ON ih.id = hp.parent_id
    )
    SELECT id, name, path, parent_id
    FROM hierarchy_path
    ORDER BY depth DESC
  `);

  return (result as any).rows.map((row: any) => ({
    id: Number(row.id),
    name: row.name,
    path: row.path,
    parentId: row.parent_id ? Number(row.parent_id) : null,
  }));
}

/**
 * Получить узел по ID
 */
export async function getHierarchyById(id: number) {
  const nodes = await db
    .select({
      id: itemHierarchy.id,
      name: itemHierarchy.name,
      path: itemHierarchy.path,
      nodeTypeId: itemHierarchy.nodeTypeId,
      nodeTypeName: nodeTypes.name,
      nodeTypeDisplayName: nodeTypes.displayName,
      nodeTypeIcon: nodeTypes.icon,
      parentId: itemHierarchy.parentId,
      sortOrder: itemHierarchy.sortOrder,
      attributes: itemHierarchy.attributes,
    })
    .from(itemHierarchy)
    .leftJoin(nodeTypes, eq(itemHierarchy.nodeTypeId, nodeTypes.id))
    .where(eq(itemHierarchy.id, id))
    .limit(1);

  return nodes[0] || null;
}

/**
 * Создать новый узел иерархии
 */
export async function createHierarchyNode(data: {
  name: string;
  parentId: number | null;
  nodeTypeId: number;
  sortOrder: number;
  attributes: Record<string, any>;
}) {
  // Получаем путь родителя
  let parentPath = 'root';
  if (data.parentId) {
    const parent = await getHierarchyById(data.parentId);
    if (!parent) {
      throw new Error('Родительский узел не найден');
    }
    parentPath = parent.path;
  }

  // Вставляем новый узел
  const result = await db
    .insert(itemHierarchy)
    .values({
      name: data.name,
      parentId: data.parentId,
      nodeTypeId: data.nodeTypeId,
      sortOrder: data.sortOrder,
      attributes: data.attributes,
      path: `${parentPath}.${sql`(SELECT COALESCE(MAX(id), 0) + 1 FROM ${itemHierarchy})`}`,
    })
    .returning();

  // Обновляем path с правильным ID
  const newNode = result[0];
  const newPath = `${parentPath}.${newNode.id}`;
  
  await db
    .update(itemHierarchy)
    .set({ path: newPath })
    .where(eq(itemHierarchy.id, newNode.id));

  return { ...newNode, path: newPath };
}

/**
 * Обновить узел иерархии
 */
export async function updateHierarchyNode(
  id: number,
  data: {
    name?: string;
    nodeTypeId?: number;
    sortOrder?: number;
    attributes?: Record<string, any>;
  }
) {
  const result = await db
    .update(itemHierarchy)
    .set(data)
    .where(eq(itemHierarchy.id, id))
    .returning();

  return result[0] || null;
}

/**
 * Удалить узел иерархии (каскадно удалит дочерние)
 */
export async function deleteHierarchyNode(id: number): Promise<boolean> {
  const result = await db
    .delete(itemHierarchy)
    .where(eq(itemHierarchy.id, id))
    .returning({ id: itemHierarchy.id });

  return result.length > 0;
}

/**
 * Переместить узел в другое место иерархии
 */
export async function moveHierarchyNode(
  id: number,
  newParentId: number | null,
  newSortOrder?: number
) {
  const node = await getHierarchyById(id);
  if (!node) {
    throw new Error('Узел не найден');
  }

  // Нельзя переместить узел в себя или в своего потомка
  if (newParentId) {
    const isDescendant = node.path.startsWith(`${newParentId}.`) || newParentId === id;
    if (isDescendant) {
      throw new Error('Нельзя переместить узел в себя или в свой дочерний узел');
    }
  }

  // Получаем новый путь
  let newParentPath = 'root';
  if (newParentId) {
    const newParent = await getHierarchyById(newParentId);
    if (!newParent) {
      throw new Error('Новый родительский узел не найден');
    }
    newParentPath = newParent.path;
  }

  const oldPath = node.path;
  const newPath = `${newParentPath}.${id}`;

  // Обновляем узел
  await db
    .update(itemHierarchy)
    .set({
      parentId: newParentId,
      sortOrder: newSortOrder ?? node.sortOrder,
      path: newPath,
    })
    .where(eq(itemHierarchy.id, id));

  // Обновляем пути всех дочерних узлов
  await db.execute(sql`
    UPDATE ${itemHierarchy}
    SET path = CONCAT(${newPath}., SUBSTRING(path FROM ${oldPath.length + 2}))
    WHERE path LIKE ${oldPath + '.%'}
  `);

  return {
    id,
    oldPath,
    newPath,
  };
}

/**
 * Поиск узлов иерархии
 */
export async function searchHierarchyNodes(query: string, limit: number = 10) {
  const searchTerm = `%${query.toLowerCase()}%`;
  
  const results = await db
    .select({
      id: itemHierarchy.id,
      name: itemHierarchy.name,
      path: itemHierarchy.path,
      nodeTypeId: itemHierarchy.nodeTypeId,
      nodeTypeName: nodeTypes.name,
    })
    .from(itemHierarchy)
    .leftJoin(nodeTypes, eq(itemHierarchy.nodeTypeId, nodeTypes.id))
    .where(like(itemHierarchy.name, searchTerm))
    .limit(limit);

  return results;
}
