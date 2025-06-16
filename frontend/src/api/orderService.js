import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const orderService = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавляем токен авторизации к каждому запросу
orderService.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const getMyOrders = async () => {
  try {
    console.log('Запрос заказов пользователя...');
    const response = await orderService.get('/orders/me');
    
    // Проверяем наличие данных в ответе
    if (!response.data) {
      console.warn('Пустой ответ от сервера');
      return { data: [] };
    }

    // Проверяем структуру данных
    const orders = Array.isArray(response.data) ? response.data : 
                  (response.data.orders && Array.isArray(response.data.orders)) ? response.data.orders : 
                  (response.data.order && Array.isArray(response.data.order)) ? response.data.order :
                  null;

    if (!orders) {
      console.warn('Неверная структура данных в ответе:', response.data);
      return { data: [] };
    }

    // Преобразуем данные в нужный формат
    const formattedOrders = orders.map(order => ({
      id: order.id || order._id,
      orderStatus: order.orderStatus || order.status,
      totalPrice: order.totalPrice || order.totalAmount,
      items: order.orderItems ? order.orderItems.map(item => ({
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })) : [],
      createdAt: order.createdAt
    }));

    console.log(`Получено ${formattedOrders.length} заказов`);
    return { data: formattedOrders };
  } catch (error) {
    console.error('Ошибка при получении заказов:', error.response?.data || error.message);
    throw error;
  }
};

export const createOrder = async (orderData) => {
  try {
    if (!orderData || typeof orderData !== 'object') {
      throw new Error('Неверные данные заказа');
    }

    console.log('Создание нового заказа:', orderData);
    const response = await orderService.post('/api/orders', orderData);
    
    if (!response.data) {
      throw new Error('Пустой ответ от сервера при создании заказа');
    }

    console.log('Заказ успешно создан:', response.data);
    return response;
  } catch (error) {
    console.error('Ошибка при создании заказа:', error.response?.data || error.message);
    throw error;
  }
};

export const getOrderById = async (orderId) => {
  try {
    if (!orderId) {
      throw new Error('ID заказа не указан');
    }

    console.log('Запрос заказа по ID:', orderId);
    const response = await orderService.get(`/orders/${orderId}`);
    
    if (!response.data) {
      throw new Error('Заказ не найден');
    }

    console.log('Получен заказ:', response.data);
    return response;
  } catch (error) {
    console.error('Ошибка при получении заказа:', error.response?.data || error.message);
    throw error;
  }
};

// Получить все заказы (для админа)
export const getAllOrders = async () => {
  try {
    const response = await orderService.get('/admin/orders');
    return response.data;
  } catch (error) {
    console.error('Error fetching all orders:', error);
    throw error;
  }
};

// Удалить заказ (для админа)
export const deleteOrder = async (orderId) => {
  try {
    const response = await orderService.delete(`/admin/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
};

export default orderService;
