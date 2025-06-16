import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new sqlite3.Database(join(__dirname, '../database.db'), (err) => {
  if (err) {
    console.error('Ошибка при подключении к базе данных:', err);
  } else {
    console.log('Успешное подключение к базе данных');
    createTables();
    updateUsersTable();
  }
});

// Функция для обновления структуры таблицы users
function updateUsersTable() {
  console.log('Проверка и обновление структуры таблицы users...');
  
  // Проверяем наличие колонок
  db.get("PRAGMA table_info(users)", (err, rows) => {
    if (err) {
      console.error('Ошибка при получении информации о таблице users:', err);
      return;
    }

    // Добавляем новые колонки последовательно
    const addColumns = async () => {
      try {
        // Добавляем колонки по одной
        await new Promise((resolve, reject) => {
          db.run(`ALTER TABLE users ADD COLUMN firstName TEXT`, (err) => {
            if (err && !err.message.includes('duplicate column name')) {
              console.error('Ошибка при добавлении колонки firstName:', err);
            }
            resolve();
          });
        });

        await new Promise((resolve, reject) => {
          db.run(`ALTER TABLE users ADD COLUMN lastName TEXT`, (err) => {
            if (err && !err.message.includes('duplicate column name')) {
              console.error('Ошибка при добавлении колонки lastName:', err);
            }
            resolve();
          });
        });

        await new Promise((resolve, reject) => {
          db.run(`ALTER TABLE users ADD COLUMN gender TEXT`, (err) => {
            if (err && !err.message.includes('duplicate column name')) {
              console.error('Ошибка при добавлении колонки gender:', err);
            }
            resolve();
          });
        });

        await new Promise((resolve, reject) => {
          db.run(`ALTER TABLE users ADD COLUMN profileUpdatedAt DATETIME`, (err) => {
            if (err && !err.message.includes('duplicate column name')) {
              console.error('Ошибка при добавлении колонки profileUpdatedAt:', err);
            }
            resolve();
          });
        });

        // После добавления всех колонок обновляем timestamp
        await new Promise((resolve, reject) => {
          db.run(`UPDATE users SET profileUpdatedAt = CURRENT_TIMESTAMP WHERE profileUpdatedAt IS NULL`, (err) => {
            if (err) {
              console.error('Ошибка при обновлении timestamp:', err);
            }
            resolve();
          });
        });

        console.log('Структура таблицы users успешно обновлена');
      } catch (error) {
        console.error('Ошибка при обновлении структуры таблицы:', error);
      }
    };

    addColumns();
  });
}

export function createTables() {
  console.log('Проверка и создание таблиц...');
  
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    price REAL NOT NULL,
    article TEXT,
    manufacturer TEXT,
    expirationDate TEXT,
    composition TEXT,
    contraindications TEXT,
    storageConditions TEXT,
    recommendations TEXT,
    tags TEXT,
    image_url TEXT,
    description TEXT,
    stock INTEGER DEFAULT 0,
    category TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Ошибка при создании таблицы products:', err);
    } else {
      console.log('Таблица products успешно создана или уже существует');
    }
  });

  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    isAdmin INTEGER DEFAULT 0,
    firstName TEXT,
    lastName TEXT,
    gender TEXT,
    profileUpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Ошибка при создании таблицы users:', err);
    } else {
      console.log('Таблица users успешно создана или уже существует');
    }
  });

  db.run(`CREATE TABLE IF NOT EXISTS cart_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    product_id INTEGER,
    quantity INTEGER DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (product_id) REFERENCES products (id)
  )`, (err) => {
    if (err) {
      console.error('Ошибка при создании таблицы cart_items:', err);
    } else {
      console.log('Таблица cart_items успешно создана или уже существует');
    }
  });

  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    paymentInfo TEXT,
    itemsPrice REAL NOT NULL,
    taxPrice REAL NOT NULL,
    shippingPrice REAL NOT NULL,
    totalPrice REAL NOT NULL,
    orderStatus TEXT DEFAULT 'Processing',
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users (id)
  )`, (err) => {
    if (err) {
      console.error('Ошибка при создании таблицы orders:', err);
    } else {
      console.log('Таблица orders успешно создана или уже существует');
    }
  });

  db.run(`CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    orderId INTEGER NOT NULL,
    productId INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY (orderId) REFERENCES orders (id),
    FOREIGN KEY (productId) REFERENCES products (id)
  )`, (err) => {
    if (err) {
      console.error('Ошибка при создании таблицы order_items:', err);
    } else {
      console.log('Таблица order_items успешно создана или уже существует');
    }
  });

  db.run(`CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    productId INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
  )`, (err) => {
    if (err) {
      console.error('Ошибка при создании таблицы reviews:', err);
    } else {
      console.log('Таблица reviews успешно создана или уже существует');
    }
  });
}

export default db; 