import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./database.db');

const getUsers = () => {
  const sql = `SELECT * FROM users`;
  db.all(sql, [], (err, rows) => {
    if (err) {
      return console.error(err.message);
    }
    console.log(rows); // Выводим всех пользователей
  });
  db.close();
};

getUsers();
