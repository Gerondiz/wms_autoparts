import { PaginationParams, SortParams, PaginatedResponse } from './types';

/**
 * Вычислить offset на основе page и limit
 */
export function calculateOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}

/**
 * Вычислить totalPages
 */
export function calculateTotalPages(total: number, limit: number): number {
  return Math.ceil(total / limit);
}

/**
 * Создать пагинированный ответ
 */
export function createPaginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> {
  return {
    items,
    total,
    page,
    limit,
    totalPages: calculateTotalPages(total, limit),
  };
}

/**
 * Парсить параметры пагинации из URL
 */
export function parsePaginationParams(
  searchParams: URLSearchParams,
  defaults: Partial<PaginationParams> = {}
): Required<PaginationParams> {
  const page = parseInt(searchParams.get('page') || String(defaults.page || 1), 10);
  const limit = parseInt(searchParams.get('limit') || String(defaults.limit || 20), 10);
  const offset = parseInt(searchParams.get('offset') || String(defaults.offset || 0), 10);

  return {
    page: Math.max(1, page),
    limit: Math.max(1, Math.min(100, limit)),
    offset: offset || calculateOffset(page, limit),
  };
}

/**
 * Парсить параметры сортировки из URL
 */
export function parseSortParams(
  searchParams: URLSearchParams,
  defaults: Partial<SortParams> = {}
): Required<SortParams> {
  const sortBy = searchParams.get('sortBy') || defaults.sortBy || 'createdAt';
  const sortOrder = (searchParams.get('sortOrder') || defaults.sortOrder || 'desc') as 'asc' | 'desc';

  return {
    sortBy,
    sortOrder: sortOrder === 'asc' ? 'asc' : 'desc',
  };
}

/**
 * Создать объект для сортировки Drizzle
 */
export function createSortOrder<T extends Record<string, any>>(
  table: T,
  sortBy: string,
  sortOrder: 'asc' | 'desc'
): any {
  const column = (table as any)[sortBy];
  if (!column) {
    return (table as any).createdAt?.[sortOrder]();
  }
  return column[sortOrder]();
}

/**
 * Получить диапазон дат для фильтрации
 */
export function getDateRange(
  fromDate?: string,
  toDate?: string
): { fromDate?: Date; toDate?: Date } {
  const result: { fromDate?: Date; toDate?: Date } = {};

  if (fromDate) {
    result.fromDate = new Date(fromDate);
  }

  if (toDate) {
    result.toDate = new Date(toDate);
    // Установить конец дня
    result.toDate.setHours(23, 59, 59, 999);
  }

  return result;
}

/**
 * Безопасно парсить числовой параметр
 */
export function parseNumericParam(
  value: string | null,
  options?: { min?: number; max?: number; default?: number }
): number | undefined {
  if (value === null || value === undefined) {
    return options?.default;
  }

  const num = parseInt(value, 10);
  if (isNaN(num)) {
    return options?.default;
  }

  let result = num;
  if (options?.min !== undefined) {
    result = Math.max(options.min, result);
  }
  if (options?.max !== undefined) {
    result = Math.min(options.max, result);
  }

  return result;
}

/**
 * Безопасно парсить булев параметр
 */
export function parseBooleanParam(value: string | null, defaultValue = false): boolean {
  if (value === null || value === undefined) {
    return defaultValue;
  }
  return value === 'true' || value === '1' || value === 'yes';
}

/**
 * Создать фильтр для поиска по тексту (LIKE)
 */
export function createSearchFilter(searchTerm: string): string {
  return `%${searchTerm.toLowerCase()}%`;
}

/**
 * Разбить массив на чанки
 */
export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Группировать элементы по ключу
 */
export function groupBy<T, K extends keyof any>(
  array: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  return array.reduce((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {} as Record<K, T[]>);
}
