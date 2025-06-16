import Order from '../models/Order.js';

/**
 * Планирует автоматическое обновление статуса заказа через 20 секунд
 * @param {number} orderId - ID заказа
 * @param {string} currentStatus - Текущий статус заказа
 * @returns {Promise<void>}
 */
export const scheduleOrderStatusUpdate = (orderId, currentStatus) => {
  console.log(`Планирование обновления статуса заказа ${orderId} через 20 секунд`);
  
  // Определяем следующий статус в зависимости от текущего
  let nextStatus;
  switch (currentStatus) {
    case 'Processing':
      nextStatus = 'Shipped';
      break;
    case 'Shipped':
      nextStatus = 'Delivered';
      break;
    case 'Delivered':
      nextStatus = 'Completed';
      break;
    default:
      nextStatus = 'Shipped'; // По умолчанию переходим к "Отправлен"
  }
  
  // Устанавливаем таймер на 20 секунд
  setTimeout(async () => {
    try {
      console.log(`Обновление статуса заказа ${orderId} с "${currentStatus}" на "${nextStatus}"`);
      await Order.updateStatus(orderId, nextStatus);
      console.log(`Статус заказа ${orderId} успешно обновлен на "${nextStatus}"`);
    } catch (error) {
      console.error(`Ошибка при обновлении статуса заказа ${orderId}:`, error);
    }
  }, 20000); // 20 секунд
}; 