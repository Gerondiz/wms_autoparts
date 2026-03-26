export const appConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'WMS Autoparts',
  defaultLocale: process.env.NEXT_PUBLIC_DEFAULT_LOCALE || 'ru',
  uploadDir: process.env.UPLOAD_DIR || './public/uploads',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10),
};
