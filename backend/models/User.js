import db from '../utils/database.js';

// Создаем модель для работы с пользователями
class User {
  constructor(id, phone, password, isAdmin = false, firstName = null, lastName = null, gender = null) {
    this.id = id;
    this.phone = phone;
    this.password = password;
    this.isAdmin = isAdmin; // Добавлено поле isAdmin
    this.firstName = firstName;
    this.lastName = lastName;
    this.gender = gender;
  }

  // Метод для сохранения пользователя в базе данных
  save() {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO users (phone, password, isAdmin, firstName, lastName, gender) 
                   VALUES (?, ?, ?, ?, ?, ?)`;
      db.run(sql, [
        this.phone, 
        this.password, 
        this.isAdmin,
        this.firstName,
        this.lastName,
        this.gender
      ], function(err) {
        if (err) {
          return reject(err);
        }
        resolve(this.lastID);
      });
    });
  }

  // Метод для обновления профиля пользователя
  updateProfile() {
    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE users 
        SET firstName = ?,
            lastName = ?,
            gender = ?,
            profileUpdatedAt = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      db.run(sql, [
        this.firstName,
        this.lastName,
        this.gender,
        this.id
      ], function(err) {
        if (err) {
          return reject(err);
        }
        if (this.changes === 0) {
          return reject(new Error('Пользователь не найден'));
        }
        resolve(true);
      });
    });
  }

  // Метод для получения всех пользователей (без паролей)
  static getAll() {
    return new Promise((resolve, reject) => {
      const sql = `SELECT id, phone, isAdmin, firstName, lastName, gender, profileUpdatedAt FROM users`;
      db.all(sql, [], (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
    });
  }

  // Метод для получения пользователя по телефону (с паролем)
  static getByPhone(phone) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT id, phone, password, isAdmin, firstName, lastName, gender, profileUpdatedAt 
                   FROM users WHERE phone = ?`;
      db.get(sql, [phone], (err, row) => {
        if (err) {
          return reject(err);
        }
        resolve(row);
      });
    });
  }

  // Метод для получения пользователя по ID
  static getById(id) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT id, phone, isAdmin, firstName, lastName, gender, profileUpdatedAt 
                   FROM users WHERE id = ?`;
      db.get(sql, [id], (err, row) => {
        if (err) {
          return reject(err);
        }
        if (!row) {
          return resolve(null);
        }
        resolve(new User(
          row.id,
          row.phone,
          null, // password не возвращаем
          row.isAdmin,
          row.firstName,
          row.lastName,
          row.gender
        ));
      });
    });
  }

  // Метод для удаления пользователя
  static delete(id) {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM users WHERE id = ?`;
      db.run(sql, [id], function(err) {
        if (err) {
          return reject(err);
        }
        resolve(this.changes > 0);
      });
    });
  }
}

export default User;
