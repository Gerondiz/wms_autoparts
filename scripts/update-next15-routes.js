#!/usr/bin/env node

/**
 * Скрипт для обновления API routes для Next.js 15
 * Изменяет тип params с { params: { id: string } } на { params: Promise<{ id: string }> }
 * и добавляет await params в начале функций
 */

const fs = require('fs');
const path = require('path');

const apiDir = path.join(__dirname, '../src/app/api');

// Находим все route.ts файлы с динамическими параметрами
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
  
  // Проверяем, есть ли в файле params с типом { id: string } или подобным
  if (!content.match(/\{ params \}: \{ params: \{/)) {
    return false;
  }
  
  // Обновляем тип params на Promise
  content = content.replace(
    /\{ params \}: \{ params: (\{ [^}]+ \}) \}/g,
    '{ params }: { params: Promise<$1> }'
  );
  
  // Находим все функции, которые используют params.id или params.* и добавляем await
  // Ищем конструкции вида: const { id } = params или const id = params.id
  const awaitParamsMatch = content.match(/async function (GET|POST|PUT|DELETE|PATCH)\([^)]+\{ params \}: \{ params: Promise<[^>]+> \}\)/);
  
  if (awaitParamsMatch) {
    // Проверяем, есть ли уже await params
    if (!content.includes('await params')) {
      // Находим тело функции и добавляем await params в начале
      content = content.replace(
        /(async function (?:GET|POST|PUT|DELETE|PATCH)\([^)]+\{ params \}: \{ params: Promise<[^>]+> \}\)\s*\{)\s*(try\s*\{)?/s,
        (match, funcStart, tryBlock) => {
          if (tryBlock) {
            return `${funcStart}\n  try {\n    // Next.js 15: params теперь Promise\n    const urlParams = await params;\n`;
          }
          return match;
        }
      );
      
      // Заменяем params.id на urlParams.id и т.д.
      content = content.replace(/params\.(\w+)/g, 'urlParams.$1');
    }
  }
  
  modified = true;
  fs.writeFileSync(filePath, content, 'utf8');
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
