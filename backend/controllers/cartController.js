import db from '../utils/database.js';
import ErrorHandler from '../utils/errorHandler.js';

class CartController {
  static async getCart(req, res, next) {
    try {
      const userId = req.user.id;
      
      const cartItems = await new Promise((resolve, reject) => {
        db.all(`
          SELECT ci.*, p.* 
          FROM cart_items ci 
          JOIN products p ON ci.product_id = p.id 
          WHERE ci.user_id = ?
        `, [userId], (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        });
      });

      res.status(200).json({
        success: true,
        cart: cartItems.map(item => ({
          id: item.product_id,
          title: item.title,
          price: item.price,
          image_url: item.image_url,
          quantity: item.quantity
        }))
      });
    } catch (err) {
      next(new ErrorHandler(err.message, 500));
    }
  }

  static async addToCart(req, res, next) {
    try {
      const { productId, quantity } = req.body;
      const userId = req.user.id;

      // Проверяем существование товара
      const product = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM products WHERE id = ?', [productId], (err, row) => {
          if (err) return reject(err);
          resolve(row);
        });
      });

      if (!product) {
        return next(new ErrorHandler('Товар не найден', 404));
      }

      // Проверяем, есть ли уже такой товар в корзине
      const existingItem = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?', 
          [userId, productId], (err, row) => {
            if (err) return reject(err);
            resolve(row);
          });
      });

      if (existingItem) {
        // Обновляем количество
        await new Promise((resolve, reject) => {
          db.run('UPDATE cart_items SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?',
            [quantity, userId, productId], (err) => {
              if (err) return reject(err);
              resolve();
            });
        });
      } else {
        // Добавляем новый товар
        await new Promise((resolve, reject) => {
          db.run('INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
            [userId, productId, quantity], (err) => {
              if (err) return reject(err);
              resolve();
            });
        });
      }

      res.status(200).json({
        success: true,
        message: 'Товар добавлен в корзину'
      });
    } catch (err) {
      next(new ErrorHandler(err.message, 500));
    }
  }

  static async removeFromCart(req, res, next) {
    try {
      const { productId } = req.params;
      const userId = req.user.id;

      await new Promise((resolve, reject) => {
        db.run('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?',
          [userId, productId], (err) => {
            if (err) return reject(err);
            resolve();
          });
      });

      res.status(200).json({
        success: true,
        message: 'Товар удален из корзины'
      });
    } catch (err) {
      next(new ErrorHandler(err.message, 500));
    }
  }

  static async updateCartItem(req, res, next) {
    try {
      const { productId } = req.params;
      const { quantity } = req.body;
      const userId = req.user.id;

      if (quantity <= 0) {
        return this.removeFromCart(req, res, next);
      }

      await new Promise((resolve, reject) => {
        db.run('UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?',
          [quantity, userId, productId], (err) => {
            if (err) return reject(err);
            resolve();
          });
      });

      res.status(200).json({
        success: true,
        message: 'Количество товара обновлено'
      });
    } catch (err) {
      next(new ErrorHandler(err.message, 500));
    }
  }
}

export default CartController; 