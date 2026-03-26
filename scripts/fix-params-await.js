#!/usr/bin/env node

/**
 * Скрипт для обновления API routes для Next.js 15
 * Заменяет params.id на (await params).id во всех функциях
 */

const fs = require('fs');
const path = require('path');

const apiDir = path.join(__dirname, '../src/app/api');

function findRouteFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory() && !entry.name.startsWith('.')) {
      findRouteFiles(fullPath, files);
    } else if (entry.isFile() && entry.name === 'route.ts') {
      files.push(fullPath);
    }
  }
  
  return files;
}

function updateRouteFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Проверяем, есть ли в файле params с типом Promise
  if (!content.match(/params: Promise</)) {
    return false;
  }
  
  // Заменяем params.xxx на (await params).xxx только если это не уже await params
  // Ищем конструкции вида parseInt(params.xxx
  const oldContent = content;
  content = content.replace(
    /parseInt\(params\.(\w+)/g,
    'parseInt((await params).$1'
  );
  
  // Заменяем params.xxx в других контекстах (например, params.id в template strings)
  content = content.replace(
    /params\.(\w+)(?!\s*:)/g,
    '(await params).$1'
  );
  
  if (content !== oldContent) {
    modified = true;
    fs.writeFileSync(filePath, content, 'utf8');
  }
  
  return modified;
}

const routeFiles = findRouteFiles(apiDir);
console.log(`Найдено ${routeFiles.length} route.ts файлов`);

let updatedCount = 0;
for (const file of routeFiles) {
  try {
    if (updateRouteFile(file)) {
      updatedCount++;
      console.log(`✓ Обновлен: ${path.relative(process.cwd(), file)}`);
    }
  } catch (error) {
    console.error(`✗ Ошибка при обновлении ${file}:`, error.message);
  }
}

console.log(`\nОбновлено файлов: ${updatedCount}`);
