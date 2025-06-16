import Order from './models/Order.js';

// Тестовые данные заказа
const testOrder = {
  userId: 1, // Укажите существующий ID пользователя
  items: [
    {
      productId: 1, // Укажите существующий ID товара
      quantity: 2,
      price: 100
    }
  ],
  itemsPrice: 200,
  taxPrice: 20,
  shippingPrice: 50,
  totalPrice: 270,
  orderStatus: 'Processing'
};

// Создаем тестовый заказ
async function testOrderCreation() {
  try {
    console.log('Пытаемся создать тестовый заказ...');
    const order = await Order.create(testOrder);
    console.log('Заказ успешно создан:', order);
    
    // Проверяем получение заказов пользователя
    const userOrders = await Order.findByUser(testOrder.userId);
    console.log('Заказы пользователя:', userOrders);
  } catch (error) {
    console.error('Ошибка при создании заказа:', error);
  }
}

testOrderCreation();
