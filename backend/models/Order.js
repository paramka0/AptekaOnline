import db from '../utils/database.js';

class Order {
  static async create(orderData) {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        db.run(
          `INSERT INTO orders (userId, paymentInfo, itemsPrice, taxPrice, shippingPrice, totalPrice, orderStatus)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            orderData.userId,
            JSON.stringify(orderData.paymentInfo),
            orderData.itemsPrice,
            orderData.taxPrice,
            orderData.shippingPrice,
            orderData.totalPrice,
            orderData.orderStatus || 'Processing'
          ],
          function(err) {
            if (err) {
              db.run('ROLLBACK');
              return reject(err);
            }

            const orderId = this.lastID;
            const items = orderData.orderItems || [];

            let completed = 0;
            items.forEach(item => {
              db.run(
                'INSERT INTO order_items (orderId, productId, quantity, price) VALUES (?, ?, ?, ?)',
                [orderId, item.productId, item.quantity, item.price],
                (err) => {
                  if (err) {
                    db.run('ROLLBACK');
                    return reject(err);
                  }
                  completed++;
                  if (completed === items.length) {
                    db.run('COMMIT');
                    resolve({ id: orderId, ...orderData });
                  }
                }
              );
            });

            if (items.length === 0) {
              db.run('COMMIT');
              resolve({ id: orderId, ...orderData });
            }
          }
        );
      });
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM orders WHERE id = ?',
        [id],
        async (err, order) => {
          if (err) return reject(err);
          if (!order) return resolve(null);

          db.all(
            'SELECT * FROM order_items WHERE orderId = ?',
            [id],
            (err, items) => {
              if (err) return reject(err);
              order.orderItems = items;
              resolve(order);
            }
          );
        }
      );
    });
  }

  static async findByUser(userId) {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC',
        [userId],
        async (err, orders) => {
          if (err) return reject(err);
          
          const ordersWithItems = await Promise.all(
            orders.map(order => 
              new Promise((resolve, reject) => {
                db.all(
                  'SELECT * FROM order_items WHERE orderId = ?',
                  [order.id],
                  (err, items) => {
                    if (err) return reject(err);
                    order.orderItems = items;
                    resolve(order);
                  }
                );
              })
            )
          );
          
          resolve(ordersWithItems);
        }
      );
    });
  }

  static async updateStatus(id, status) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE orders SET orderStatus = ? WHERE id = ?',
        [status, id],
        function(err) {
          if (err) return reject(err);
          resolve({ id, status });
        }
      );
    });
  }

  static async findAll() {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM orders ORDER BY createdAt DESC',
        async (err, orders) => {
          if (err) return reject(err);
          
          const ordersWithItems = await Promise.all(
            orders.map(order => 
              new Promise((resolve, reject) => {
                db.all(
                  'SELECT * FROM order_items WHERE orderId = ?',
                  [order.id],
                  (err, items) => {
                    if (err) return reject(err);
                    order.orderItems = items;
                    resolve(order);
                  }
                );
              })
            )
          );
          
          resolve(ordersWithItems);
        }
      );
    });
  }

  static async delete(id) {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        db.run('DELETE FROM order_items WHERE orderId = ?', [id], (err) => {
          if (err) {
            db.run('ROLLBACK');
            return reject(err);
          }

          db.run('DELETE FROM orders WHERE id = ?', [id], (err) => {
            if (err) {
              db.run('ROLLBACK');
              return reject(err);
            }

            db.run('COMMIT');
            resolve(true);
          });
        });
      });
    });
  }
}

export default Order;
