import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./database.db');

const checkTableStructure = () => {
  const sql = `PRAGMA table_info(users)`;
  db.all(sql, [], (err, rows) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Table structure for users:', rows); // Выводим структуру таблицы
  });
  db.close();
};

checkTableStructure();
