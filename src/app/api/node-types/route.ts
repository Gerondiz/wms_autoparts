import { NextRequest } from 'next/server';
import { successResponse, errorResponse, ApiErrorCode, HttpStatus } from '@/lib/api';
import { ensureAuth } from '@/lib/api';
import { db } from '@/lib/db';
import { nodeTypes } from '@/lib/db/schema';
import { asc } from 'drizzle-orm';

/**
 * GET /api/node-types
 * Получить список типов узлов
 */
export async function GET(request: NextRequest) {
  try {
    const session = await ensureAuth();
    if (session instanceof Response) {
      return session;
    }

    const types = await db
      .select({
        id: nodeTypes.id,
        name: nodeTypes.name,
        displayName: nodeTypes.displayName,
        icon: nodeTypes.icon,
        canHaveChildren: nodeTypes.canHaveChildren,
        canHaveParts: nodeTypes.canHaveParts,
        sortOrder: nodeTypes.sortOrder,
        defaultAttributes: nodeTypes.defaultAttributes,
      })
      .from(nodeTypes)
      .orderBy(asc(nodeTypes.sortOrder), asc(nodeTypes.name));

    return successResponse(types);
  } catch (error) {
    console.error('Error in node-types:', error);
    return errorResponse(
      ApiErrorCode.INTERNAL_ERROR,
      'Внутренняя ошибка сервера',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
