import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error('Database connection error:', err);
    return;
  }
  console.log('Connected to database');

  // Добавляем тестовый заказ
  db.serialize(() => {
    // 1. Добавляем основной заказ
    db.run(`INSERT INTO orders (
      userId, itemsPrice, taxPrice, shippingPrice, totalPrice, orderStatus
    ) VALUES (?, ?, ?, ?, ?, ?)`, 
    [1, 4500, 450, 500, 5450, 'Processing'], function(err) {
      if (err) {
        console.error('Order insert error:', err);
        return db.close();
      }

      const orderId = this.lastID;
      console.log('Order added with ID:', orderId);

      // 2. Добавляем товары в заказ
      const items = [
        {productId: 1, quantity: 2, price: 1500},
        {productId: 2, quantity: 1, price: 1500}
      ];

      let itemsProcessed = 0;
      items.forEach(item => {
        db.run(`INSERT INTO order_items (orderId, productId, quantity, price)
                VALUES (?, ?, ?, ?)`, 
                [orderId, item.productId, item.quantity, item.price], 
                (err) => {
                  if (err) console.error('Error adding item:', err);
                  itemsProcessed++;
                  
                  if (itemsProcessed === items.length) {
                    db.close();
                    console.log('Test data successfully added');
                  }
                });
      });
    });
  });
});
