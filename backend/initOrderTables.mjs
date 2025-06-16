import sqlite3 from 'sqlite3';
const db = new sqlite3.Database('./database.db');

// Создаем таблицы для заказов
db.serialize(() => {
  // Таблица заказов
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
    FOREIGN KEY(userId) REFERENCES users(id)
  )`, (err) => {
    if (err) console.error('Error creating orders table:', err);
    else console.log('Orders table created');
  });

  // Таблица элементов заказа
  db.run(`CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    orderId INTEGER NOT NULL,
    productId INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY(orderId) REFERENCES orders(id),
    FOREIGN KEY(productId) REFERENCES products(id)
  )`, (err) => {
    if (err) console.error('Error creating order_items table:', err);
    else console.log('Order_items table created');
  });
});

db.close();
