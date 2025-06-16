import sqlite3 from 'sqlite3';
import db from '../utils/database.js';

export const getAdminStats = async (req, res) => {
  try {
    // Получаем количество пользователей
    const usersCount = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
        if (err) reject(err);
        resolve(row.count);
      });
    });

    // Получаем количество продуктов
    const productsCount = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
        if (err) reject(err);
        resolve(row.count);
      });
    });

    // Получаем количество заказов и общий доход
    const ordersStats = await new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          COUNT(*) as totalOrders,
          COALESCE(SUM(totalPrice), 0) as totalRevenue
        FROM orders
      `, (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });

    res.status(200).json({
      success: true,
      stats: {
        usersCount,
        productsCount,
        totalOrders: ordersStats.totalOrders,
        totalRevenue: ordersStats.totalRevenue
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admin statistics'
    });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await new Promise((resolve, reject) => {
      db.all(
        `SELECT o.*, u.phone as userPhone
         FROM orders o
         JOIN users u ON o.userId = u.id
         ORDER BY o.createdAt DESC`,
        (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        }
      );
    });

    res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders'
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const result = await new Promise((resolve, reject) => {
      db.run(
        'UPDATE orders SET orderStatus = ? WHERE id = ?',
        [status, id],
        function(err) {
          if (err) reject(err);
          resolve(this.changes);
        }
      );
    });

    if (result === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Получаем обновлённый заказ
    const updatedOrder = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM orders WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });

    res.status(200).json({
      success: true,
      message: 'Order status updated',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order status'
    });
  }
};

export const deleteOrder = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM orders WHERE id = ?',
        [id],
        function(err) {
          if (err) reject(err);
          resolve(this.changes);
        }
      );
    });

    if (result === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting order'
    });
  }
};