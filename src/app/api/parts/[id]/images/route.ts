import { NextRequest } from 'next/server';
import { successResponse, errorResponse, ApiErrorCode, HttpStatus } from '@/lib/api';
import { ensureAuth, hasPermission } from '@/lib/api';
import { partsService } from '@/lib/services';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

/**
 * POST /api/parts/:id/images
 * Загрузить изображение запчасти
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Проверка аутентификации и прав
    const session = await ensureAuth();
    if (session instanceof Response) {
      return session;
    }

    if (!hasPermission(session, 'parts_manage')) {
      return errorResponse(
        ApiErrorCode.FORBIDDEN,
        'Недостаточно прав для управления запчастями',
        HttpStatus.FORBIDDEN
      );
    }

    const partId = parseInt((await params).id, 10);
    if (isNaN(partId)) {
      return errorResponse(
        ApiErrorCode.BAD_REQUEST,
        'Неверный формат ID запчасти',
        HttpStatus.BAD_REQUEST
      );
    }

    // Проверяем существование запчасти
    const part = await partsService.getPartById(partId);
    if (!part) {
      return errorResponse(
        ApiErrorCode.NOT_FOUND,
        'Запчасть не найдена',
        HttpStatus.NOT_FOUND
      );
    }

    // Парсим multipart/form-data
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const isPrimaryParam = formData.get('isPrimary');
    const isPrimary = isPrimaryParam === 'true';

    if (!imageFile) {
      return errorResponse(
        ApiErrorCode.BAD_REQUEST,
        'Файл изображения не предоставлен',
        HttpStatus.BAD_REQUEST
      );
    }

    // Проверяем тип файла
    if (!imageFile.type.startsWith('image/')) {
      return errorResponse(
        ApiErrorCode.BAD_REQUEST,
        'Файл должен быть изображением',
        HttpStatus.BAD_REQUEST
      );
    }

    // Создаём директорию для загрузок
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'parts', partId.toString());
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Генерируем уникальное имя файла
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = imageFile.name.split('.').pop() || 'jpg';
    const fileName = `${timestamp}-${randomString}.${fileExtension}`;
    const filePath = join(uploadDir, fileName);

    // Читаем файл и записываем на диск
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(filePath, buffer);

    // URL для доступа к изображению
    const imageUrl = `/uploads/parts/${partId}/${fileName}`;

    // Добавляем запись в БД
    const imageRecord = await partsService.addPartImage(partId, imageUrl, isPrimary);

    return successResponse(imageRecord, HttpStatus.CREATED);
  } catch (error: any) {
    console.error('Error uploading image:', error);
    return errorResponse(
      ApiErrorCode.INTERNAL_ERROR,
      'Внутренняя ошибка сервера',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
