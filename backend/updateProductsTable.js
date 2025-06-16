import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./backend/database.db', sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
    process.exit(1);
  }
  console.log('Connected to SQLite database');
});

db.serialize(() => {
  db.all("PRAGMA table_info(products)", (err, columns) => {
    if (err) {
      console.error('Error getting table info:', err.message);
      db.close();
      return;
    }
    const existingColumns = columns.map(col => col.name);
    if (!existingColumns.includes('instructions')) {
      db.run("ALTER TABLE products ADD COLUMN instructions TEXT", (err) => {
        if (err) {
          console.error('Error adding instructions column:', err.message);
        } else {
          console.log('Column instructions added successfully');
        }
        db.close();
      });
    } else {
      console.log('Column instructions already exists');
      db.close();
    }
  });
}); 