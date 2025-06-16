import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./database.db');

db.all("SELECT * FROM users WHERE phone = 'admin'", [], (err, rows) => {
  if (err) {
    console.error('Error:', err.message);
    return;
  }
  console.log('Admin user:', rows);
  db.close();
}); 