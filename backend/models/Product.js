import db from '../utils/database.js';

// Создаем модель для работы с продуктами
class Product {
  constructor(id, title, price, article, manufacturer, expirationDate, composition, 
              contraindications, storageConditions, recommendations, tags, image_url, 
              description, stock, category, instructions) {
    this.id = id;
    this.title = title;
    this.price = price;
    this.article = article;
    this.manufacturer = manufacturer;
    this.expirationDate = expirationDate;
    this.composition = composition;
    this.contraindications = contraindications;
    this.storageConditions = storageConditions;
    this.recommendations = recommendations;
    this.tags = tags;
    this.image_url = image_url;
    this.description = description;
    this.stock = stock;
    this.category = category;
    this.instructions = instructions;
  }

  // Метод для сохранения продукта в базе данных
  save() {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO products (
          title, price, article, manufacturer, expirationDate, 
          composition, contraindications, storageConditions, 
          recommendations, tags, image_url, description, 
          stock, category, instructions
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      db.run(sql, [
        this.title, this.price, this.article, this.manufacturer, 
        this.expirationDate, this.composition, this.contraindications, 
        this.storageConditions, this.recommendations, this.tags, 
        this.image_url, this.description, this.stock, this.category, this.instructions
      ], function(err) {
        if (err) {
          return reject(err);
        }
        this.id = this.lastID;
        resolve(this);
      });
    });
  }

  // Метод для получения всех продуктов
  static getAll() {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM products`;
      db.all(sql, [], (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
    });
  }

  // Метод для получения продукта по ID
  static getById(id) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM products WHERE id = ?`;
      db.get(sql, [id], (err, row) => {
        if (err) {
          return reject(err);
        }
        resolve(row);
      });
    });
  }

  static getByTags(tags) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM products WHERE tags LIKE ?`;
      const tagPattern = `%${tags}%`;
      db.all(sql, [tagPattern], (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
    });
  }

  static getByPriceRange(minPrice, maxPrice) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM products WHERE price BETWEEN ? AND ?`;
      db.all(sql, [minPrice, maxPrice], (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
    });
  }

  static getByCategory(category) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM products WHERE category = ?`;
      db.all(sql, [category], (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
    });
  }

  update() {
    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE products SET 
          title = ?, price = ?, article = ?, manufacturer = ?, 
          expirationDate = ?, composition = ?, contraindications = ?, 
          storageConditions = ?, recommendations = ?, tags = ?, 
          image_url = ?, description = ?, stock = ?, category = ?, instructions = ?
        WHERE id = ?
      `;
      
      db.run(sql, [
        this.title, this.price, this.article, this.manufacturer, 
        this.expirationDate, this.composition, this.contraindications, 
        this.storageConditions, this.recommendations, this.tags, 
        this.image_url, this.description, this.stock, this.category, this.instructions, this.id
      ], function(err) {
        if (err) {
          return reject(err);
        }
        if (this.changes === 0) {
          return reject(new Error('Товар не найден'));
        }
        resolve();
      });
    });
  }

  static delete(id) {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM products WHERE id = ?`;
      db.run(sql, [id], function(err) {
        if (err) {
          return reject(err);
        }
        if (this.changes === 0) {
          return reject(new Error('Товар не найден'));
        }
        resolve();
      });
    });
  }

  static getTags() {
    return new Promise((resolve, reject) => {
      const sql = `SELECT DISTINCT tags FROM products WHERE tags IS NOT NULL AND tags != ''`;
      db.all(sql, [], (err, rows) => {
        if (err) {
          console.error('Database error in getTags:', err);
          return reject(err);
        }
        try {
          const tags = rows
            .filter(row => row.tags)
            .map(row => row.tags.split(','))
            .flat()
            .map(tag => tag.trim())
            .filter(tag => tag)
            .filter((tag, index, self) => self.indexOf(tag) === index);
          resolve(tags);
        } catch (error) {
          console.error('Error processing tags:', error);
          reject(error);
        }
      });
    });
  }

  static getPriceRange() {
    return new Promise((resolve, reject) => {
      const sql = `SELECT MIN(price) as minPrice, MAX(price) as maxPrice FROM products WHERE price IS NOT NULL`;
      db.get(sql, [], (err, row) => {
        if (err) {
          console.error('Database error in getPriceRange:', err);
          return reject(err);
        }
        try {
          if (!row || row.minPrice === null || row.maxPrice === null) {
            return resolve({ minPrice: 0, maxPrice: 1000 });
          }
          resolve(row);
        } catch (error) {
          console.error('Error processing price range:', error);
          reject(error);
        }
      });
    });
  }

  // Метод для создания нового продукта
  static create(productData) {
    return new Promise((resolve, reject) => {
      console.log('Создание товара в БД:', productData);
      const sql = `INSERT INTO products (
        title, price, article, manufacturer, expirationDate,
        composition, contraindications, storageConditions,
        recommendations, tags, image_url, description, stock, category, instructions
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      const params = [
        productData.title,
        productData.price,
        productData.article || null,
        productData.manufacturer || null,
        productData.expirationDate || null,
        productData.composition || null,
        productData.contraindications || null,
        productData.storageConditions || null,
        productData.recommendations || null,
        productData.tags || null,
        productData.image_url || null,
        productData.description || null,
        productData.stock || 0,
        productData.category || null,
        productData.instructions || null
      ];

      db.run(sql, params, function(err) {
        if (err) {
          console.error('Ошибка SQL при создании товара:', err);
          return reject(err);
        }
        console.log('Товар успешно создан в БД, ID:', this.lastID);
        resolve({ id: this.lastID, ...productData });
      });
    });
  }

  // Метод для обновления продукта
  static update(id, productData) {
    return new Promise((resolve, reject) => {
      console.log('Обновление товара в БД, ID:', id);
      const sql = `UPDATE products SET
        title = ?,
        price = ?,
        article = ?,
        manufacturer = ?,
        expirationDate = ?,
        composition = ?,
        contraindications = ?,
        storageConditions = ?,
        recommendations = ?,
        tags = ?,
        image_url = ?,
        description = ?,
        stock = ?,
        category = ?,
        instructions = ?
      WHERE id = ?`;

      const params = [
        productData.title,
        productData.price,
        productData.article || null,
        productData.manufacturer || null,
        productData.expirationDate || null,
        productData.composition || null,
        productData.contraindications || null,
        productData.storageConditions || null,
        productData.recommendations || null,
        productData.tags || null,
        productData.image_url || null,
        productData.description || null,
        productData.stock || 0,
        productData.category || null,
        productData.instructions || null,
        id
      ];

      db.run(sql, params, function(err) {
        if (err) {
          console.error('Ошибка SQL при обновлении товара:', err);
          return reject(err);
        }
        if (this.changes === 0) {
          console.error('Товар не найден, ID:', id);
          return reject(new Error('Товар не найден'));
        }
        console.log('Товар успешно обновлен в БД, ID:', id);
        resolve();
      });
    });
  }

  static async updateStock(productId, quantity) {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        // Получаем текущее количество товара
        db.get('SELECT stock FROM products WHERE id = ?', [productId], (err, row) => {
          if (err) {
            db.run('ROLLBACK');
            return reject(err);
          }

          if (!row) {
            db.run('ROLLBACK');
            return reject(new Error('Товар не найден'));
          }

          const newStock = row.stock - quantity;
          
          if (newStock < 0) {
            db.run('ROLLBACK');
            return reject(new Error('Недостаточно товара на складе'));
          }

          // Обновляем количество
          db.run('UPDATE products SET stock = ? WHERE id = ?', [newStock, productId], (err) => {
            if (err) {
              db.run('ROLLBACK');
              return reject(err);
            }

            db.run('COMMIT');
            resolve({ id: productId, newStock });
          });
        });
      });
    });
  }
}

export default Product;
