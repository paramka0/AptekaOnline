import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./database.db');

const updateAdminPhone = () => {
  const newPhone = '+79999999999'; // Установите новый номер телефона для администратора
  const sql = `UPDATE users SET phone = ? WHERE isAdmin = 1`; // Обновляем номер телефона для администратора
  db.run(sql, [newPhone], function(err) {
    if (err) {
      return console.error(err.message);
    }
    console.log(`Admin phone number updated to: ${newPhone}`);
  });

  db.close();
};

updateAdminPhone();
