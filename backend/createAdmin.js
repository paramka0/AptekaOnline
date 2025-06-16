import sqlite3 from 'sqlite3';
import bcrypt from 'bcrypt';

const db = new sqlite3.Database('./database.db');

const createAdmin = async () => {
  const phone = 'admin';
  const password = 'admin'; // Установите пароль для администратора
  const hashedPassword = await bcrypt.hash(password, 10);

  const sql = `INSERT INTO users (phone, password, isAdmin) VALUES (?, ?, ?)`;
  db.run(sql, [phone, hashedPassword, 1], function(err) {
    if (err) {
      return console.error(err.message);
    }
    console.log(`Admin user created with ID: ${this.lastID}`);
  });

  db.close();
};

createAdmin();
