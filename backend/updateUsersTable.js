import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./database.db');

const updateUsersTable = () => {
  const sql = `ALTER TABLE users ADD COLUMN isAdmin INTEGER DEFAULT 0`; // Добавляем столбец isAdmin
  db.run(sql, function(err) {
    if (err) {
      return console.error(err.message);
    }
    console.log(`Column 'isAdmin' added to 'users' table.`);
  });

  db.close();
};

updateUsersTable();
