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
  // Добавление новых колонок
  db.run(`ALTER TABLE products ADD COLUMN article TEXT`);
  db.run(`ALTER TABLE products ADD COLUMN manufacturer TEXT`);
  db.run(`ALTER TABLE products ADD COLUMN expirationDate TEXT`);
  db.run(`ALTER TABLE products ADD COLUMN composition TEXT`);
  db.run(`ALTER TABLE products ADD COLUMN contraindications TEXT`);
  db.run(`ALTER TABLE products ADD COLUMN storageConditions TEXT`);
  db.run(`ALTER TABLE products ADD COLUMN recommendations TEXT`);
  db.run(`ALTER TABLE products ADD COLUMN tags TEXT`);
  db.run(`ALTER TABLE products ADD COLUMN image_url TEXT`);
  db.run(`ALTER TABLE products ADD COLUMN description TEXT`);
  db.run(`ALTER TABLE products ADD COLUMN stock INTEGER DEFAULT 0`);
  db.run(`ALTER TABLE products ADD COLUMN category TEXT`);

  console.log('Database structure updated successfully');
});

// Закрытие соединения
db.close((err) => {
  if (err) {
    console.error('Error closing database:', err.message);
  }
  console.log('Database connection closed');
});
