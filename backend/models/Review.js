import db from '../utils/database.js';

class Review {
  constructor(data) {
    this.id = data.id;
    this.userId = data.userId;
    this.productId = data.productId;
    this.rating = data.rating;
    this.comment = data.comment;
    this.createdAt = data.createdAt;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
  }

  static getByProductId(productId) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT r.*, u.firstName, u.lastName 
        FROM reviews r
        JOIN users u ON r.userId = u.id
        WHERE r.productId = ?
        ORDER BY r.createdAt DESC
      `;
      db.all(sql, [productId], (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows.map(row => new Review(row)));
      });
    });
  }

  static getByUserAndProduct(userId, productId) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM reviews WHERE userId = ? AND productId = ?';
      db.get(sql, [userId, productId], (err, row) => {
        if (err) {
          return reject(err);
        }
        resolve(row ? new Review(row) : null);
      });
    });
  }

  static getById(id) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM reviews WHERE id = ?';
      db.get(sql, [id], (err, row) => {
        if (err) {
          return reject(err);
        }
        resolve(row ? new Review(row) : null);
      });
    });
  }

  save() {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO reviews (userId, productId, rating, comment, createdAt)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      `;
      db.run(sql, [
        this.userId,
        this.productId,
        this.rating,
        this.comment
      ], function(err) {
        if (err) {
          return reject(err);
        }
        this.id = this.lastID;
        resolve(new Review({ ...this, id: this.lastID }));
      });
    });
  }

  static delete(id) {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM reviews WHERE id = ?';
      db.run(sql, [id], function(err) {
        if (err) {
          return reject(err);
        }
        resolve(this.changes > 0);
      });
    });
  }
}

export default Review; 