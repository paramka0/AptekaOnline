import sqlite3 from 'sqlite3';
import dotenv from 'dotenv';

dotenv.config();

const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
    process.exit(1);
  }
  console.log('Connected to SQLite database');
});

// Создание таблицы products
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
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
    )
  `, (err) => {
    if (err) {
      console.error('Error creating products table:', err.message);
    } else {
      console.log('Products table created or already exists');
    }
  });

  // Добавляем тестовые данные, если таблица пуста
  db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
    if (err) {
      console.error('Error checking products count:', err.message);
      return;
    }

    if (row.count === 0) {
      const testProducts = [
        {
          title: 'Аспирин',
          price: 199.99,
          article: 'ASP001',
          manufacturer: 'Байер',
          expirationDate: '2025-12-31',
          composition: 'Ацетилсалициловая кислота',
          contraindications: 'Индивидуальная непереносимость',
          storageConditions: 'Хранить при температуре до 25°C',
          recommendations: 'Принимать после еды',
          tags: 'жаропонижающее,обезболивающее',
          image_url: 'https://example.com/aspirin.jpg',
          description: 'Противовоспалительное средство',
          stock: 100,
          category: 'Обезболивающие'
        },
        {
          title: 'Парацетамол',
          price: 99.99,
          article: 'PAR001',
          manufacturer: 'Фармстандарт',
          expirationDate: '2024-12-31',
          composition: 'Парацетамол',
          contraindications: 'Повышенная чувствительность',
          storageConditions: 'Хранить при температуре до 25°C',
          recommendations: 'Принимать по 1 таблетке',
          tags: 'жаропонижающее,обезболивающее',
          image_url: 'https://example.com/paracetamol.jpg',
          description: 'Жаропонижающее средство',
          stock: 150,
          category: 'Обезболивающие'
        }
      ];

      const insertSql = `
        INSERT INTO products (
          title, price, article, manufacturer, expirationDate,
          composition, contraindications, storageConditions,
          recommendations, tags, image_url, description,
          stock, category
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      testProducts.forEach(product => {
        db.run(insertSql, [
          product.title,
          product.price,
          product.article,
          product.manufacturer,
          product.expirationDate,
          product.composition,
          product.contraindications,
          product.storageConditions,
          product.recommendations,
          product.tags,
          product.image_url,
          product.description,
          product.stock,
          product.category
        ], function(err) {
          if (err) {
            console.error('Error inserting test product:', err.message);
          } else {
            console.log('Test product inserted with ID:', this.lastID);
          }
        });
      });
    }
  });
});

// Закрываем соединение
setTimeout(() => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed');
    }
  });
}, 1000); 