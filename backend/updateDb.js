import sqlite3 from 'sqlite3';
import dotenv from 'dotenv';

dotenv.config();

const db = new sqlite3.Database('./database.db', sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
    process.exit(1);
  }
  console.log('Connected to SQLite database');
});

// Обновление таблицы products
db.serialize(() => {
  // Получаем информацию о структуре таблицы
  db.all("PRAGMA table_info(products)", (err, columns) => {
    if (err) {
      console.error('Error getting table info:', err.message);
      return;
    }

    // Создаем массив существующих колонок
    const existingColumns = columns.map(col => col.name);
    console.log('Existing columns:', existingColumns);

    // Добавляем новые колонки, если они не существуют
    const newColumns = [
      { name: 'article', type: 'TEXT' },
      { name: 'manufacturer', type: 'TEXT' },
      { name: 'expirationDate', type: 'TEXT' },
      { name: 'composition', type: 'TEXT' },
      { name: 'contraindications', type: 'TEXT' },
      { name: 'storageConditions', type: 'TEXT' },
      { name: 'recommendations', type: 'TEXT' },
      { name: 'tags', type: 'TEXT' },
      { name: 'image_url', type: 'TEXT' },
      { name: 'description', type: 'TEXT' },
      { name: 'stock', type: 'INTEGER DEFAULT 0' },
      { name: 'category', type: 'TEXT' }
    ];

    newColumns.forEach(column => {
      if (!existingColumns.includes(column.name)) {
        db.run(`ALTER TABLE products ADD COLUMN ${column.name} ${column.type}`, (err) => {
          if (err) {
            console.error(`Error adding column ${column.name}:`, err.message);
          } else {
            console.log(`Added column ${column.name}`);
          }
        });
      } else {
        console.log(`Column ${column.name} already exists`);
      }
    });
  });

  console.log('Database structure update completed');
});

// Закрытие соединения
setTimeout(() => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    }
    console.log('Database connection closed');
  });
}, 1000); 