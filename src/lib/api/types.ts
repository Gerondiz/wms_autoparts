import { NextResponse } from 'next/server';

/**
 * Стандартный формат успешного ответа API
 */
export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
}

/**
 * Детали ошибки API
 */
export interface ApiErrorDetails {
  code: string;
  message: string;
  details?: any;
}

/**
 * Стандартный формат ответа API с ошибкой
 */
export interface ApiErrorResponse {
  success: false;
  error: ApiErrorDetails;
}

/**
 * Union тип для ответов API
 */
export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Коды ошибок API
 */
export enum ApiErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CONFLICT = 'CONFLICT',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',
}

/**
 * Пагинированный ответ
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Параметры пагинации
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

/**
 * Параметры сортировки
 */
export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Стандартные HTTP статусы
 */
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500,
}

/**
 * Создать успешный ответ
 */
export function successResponse<T>(data: T, status: HttpStatus = HttpStatus.OK): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json({ success: true, data }, { status });
}

/**
 * Создать ответ с ошибкой
 */
export function errorResponse(
  code: ApiErrorCode,
  message: string,
  status: HttpStatus,
  details?: any
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: { code, message, details },
    },
    { status }
  );
}

/**
 * Создать ответ с ошибкой валидации
 */
export function validationError(details: any): NextResponse<ApiErrorResponse> {
  return errorResponse(
    ApiErrorCode.VALIDATION_ERROR,
    'Ошибка валидации данных',
    HttpStatus.BAD_REQUEST,
    details
  );
}

/**
 * Создать ответ с ошибкой авторизации
 */
export function unauthorizedError(message = 'Требуется аутентификация'): NextResponse<ApiErrorResponse> {
  return errorResponse(ApiErrorCode.UNAUTHORIZED, message, HttpStatus.UNAUTHORIZED);
}

/**
 * Создать ответ с ошибкой доступа
 */
export function forbiddenError(message = 'Недостаточно прав'): NextResponse<ApiErrorResponse> {
  return errorResponse(ApiErrorCode.FORBIDDEN, message, HttpStatus.FORBIDDEN);
}

/**
 * Создать ответ с ошибкой "не найдено"
 */
export function notFoundError(message = 'Ресурс не найден'): NextResponse<ApiErrorResponse> {
  return errorResponse(ApiErrorCode.NOT_FOUND, message, HttpStatus.NOT_FOUND);
}

/**
 * Создать ответ с внутренней ошибкой
 */
export function internalError(message = 'Внутренняя ошибка сервера'): NextResponse<ApiErrorResponse> {
  return errorResponse(ApiErrorCode.INTERNAL_ERROR, message, HttpStatus.INTERNAL_SERVER_ERROR);
}
