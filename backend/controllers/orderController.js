import Order from '../models/Order.js';
import Product from '../models/Product.js';
import catchAsyncErrors from '../middleware/catchAsyncErrors.js';
import ErrorHandler from '../utils/errorHandler.js';

// Получить заказы текущего пользователя
export const myOrders = async (req, res) => {
  try {
    console.log('Получение заказов пользователя:', req.user.id);
    const orders = await Order.findByUser(req.user.id);
    
    console.log('Найдено заказов:', orders.length);
    res.json(orders);
  } catch (error) {
    console.error('Ошибка при получении заказов:', error);
    res.status(500).json({ message: 'Ошибка при получении заказов' });
  }
};

// Создать новый заказ
export const newOrder = catchAsyncErrors(async (req, res, next) => {
  try {
    console.log('Creating order for user:', req.user.id);
    console.log('Full order data:', JSON.stringify({
      ...req.body,
      userId: req.user.id
    }, null, 2));

    // Проверяем наличие товаров в заказе
    if (!req.body.items || req.body.items.length === 0) {
      return next(new ErrorHandler('Нельзя создать заказ без товаров', 400));
    }

    // Проверяем структуру товаров
    const invalidItems = req.body.items.filter(item => 
      !item.productId || !item.quantity || !item.price
    );
    
    if (invalidItems.length > 0) {
      return next(new ErrorHandler('Некорректные данные товаров', 400));
    }

    // Проверяем наличие товаров и обновляем их количество
    for (const item of req.body.items) {
      try {
        await Product.updateStock(item.productId, item.quantity);
      } catch (error) {
        return next(new ErrorHandler(error.message, 400));
      }
    }

    // Формируем данные заказа
    const orderData = {
      userId: req.user.id,
      orderItems: req.body.items,
      itemsPrice: req.body.itemsPrice || req.body.totalPrice,
      taxPrice: req.body.taxPrice || 0,
      shippingPrice: req.body.shippingPrice || 0,
      totalPrice: req.body.totalPrice,
      paymentInfo: {
        method: req.body.paymentMethod,
        status: 'pending'
      },
      orderStatus: 'Processing'
    };

    const order = await Order.create(orderData);
    
    console.log('Order created successfully:', order.id);
    
    res.status(201).json({
      success: true,
      order
    });
  } catch (err) {
    console.error('Order creation error:', err);
    next(new ErrorHandler('Ошибка при создании заказа', 500));
  }
});

// Получить конкретный заказ
export const getSingleOrder = catchAsyncErrors(async (req, res, next) => {
  try {
    // Специальный случай для /orders/me - возвращаем все заказы пользователя
    if (req.params.id === 'me') {
      const orders = await Order.findByUser(req.user.id);
      return res.status(200).json({
        success: true,
        orders
      });
    }

    console.log(`Fetching order ${req.params.id} for user ${req.user.id}`);
    const order = await Order.findById(req.params.id);
    if (!order) {
      console.log(`Order ${req.params.id} not found`);
      return next(new ErrorHandler('Заказ не найден', 404));
    }
    
    // Проверяем, принадлежит ли заказ текущему пользователю (если не админ)
    if (!req.user.isAdmin && order.userId !== req.user.id) {
      console.log(`User ${req.user.id} attempted to access order ${order.id} belonging to user ${order.userId}`);
      return next(new ErrorHandler('Нет доступа к этому заказу', 403));
    }
    
    console.log(`Successfully fetched order ${order.id}`);
    res.status(200).json({
      success: true,
      order
    });
  } catch (err) {
    next(new ErrorHandler(err.message.includes('not found') ? 'Заказ не найден' : 'Ошибка при получении заказа', 500));
  }
});

// Получить все заказы (для админа)
export const allOrders = catchAsyncErrors(async (req, res, next) => {
  try {
    const orders = await Order.findAll();
    res.status(200).json({
      success: true,
      orders
    });
  } catch (err) {
    next(new ErrorHandler('Ошибка при получении всех заказов', 500));
  }
});

// Обновить статус заказа (для админа)
export const updateOrder = catchAsyncErrors(async (req, res, next) => {
  try {
    const order = await Order.updateStatus(req.params.id, req.body.status);
    
    res.status(200).json({
      success: true,
      order
    });
  } catch (err) {
    next(new ErrorHandler('Ошибка при обновлении заказа', 500));
  }
});

// Удалить заказ (для админа)
export const deleteOrder = catchAsyncErrors(async (req, res, next) => {
  try {
    await Order.delete(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Заказ удален'
    });
  } catch (err) {
    next(new ErrorHandler('Ошибка при удалении заказа', 500));
  }
});