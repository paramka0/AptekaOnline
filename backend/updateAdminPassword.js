import sqlite3 from 'sqlite3';
import bcrypt from 'bcrypt';

const db = new sqlite3.Database('./database.db');

const updateAdminPassword = async () => {
  const newPassword = '123456'; // Установите новый пароль для администратора
  const hashedPassword = await bcrypt.hash(newPassword, 10); // Хешируем новый пароль

  const sql = `UPDATE users SET password = ? WHERE isAdmin = 1`; // Обновляем пароль для администратора
  db.run(sql, [hashedPassword], function(err) {
    if (err) {
      return console.error(err.message);
    }
    console.log(`Admin password updated.`);
  });

  db.close();
};

updateAdminPassword();
