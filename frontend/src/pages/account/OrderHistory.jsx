import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getMyOrders } from '../../api/orderService';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllOrders, setShowAllOrders] = useState(false);
  const { user } = useAuth();

  const fetchOrders = async () => {
    try {
      const response = await getMyOrders();
      console.log('Получены заказы:', response.data);
      
      // Проверяем, что response.data существует и содержит массив заказов
      if (response && response.data) {
        // Если заказы находятся в response.data.orders, используем их
        // Иначе используем весь response.data, если он является массивом
        const ordersData = Array.isArray(response.data.orders) 
          ? response.data.orders 
          : (Array.isArray(response.data) ? response.data : []);
        
        console.log('Извлеченные данные заказов:', ordersData);
        setOrders(ordersData);
      } else {
        console.warn('Данные заказов не найдены в ответе');
        setOrders([]);
      }
      
      setError(null);
    } catch (err) {
      setError('Не удалось загрузить заказы. Пожалуйста, попробуйте позже.');
      console.error('Error fetching orders:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
      const interval = setInterval(fetchOrders, 20000); // Обновляем каждые 20 секунд
      return () => clearInterval(interval);
    }
  }, [user]);

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'processing':
        return 'fa-spinner fa-spin';
      case 'shipped':
        return 'fa-truck';
      case 'delivered':
        return 'fa-box';
      case 'completed':
        return 'fa-check-circle';
      default:
        return 'fa-question-circle';
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'processing':
        return 'text-blue-500';
      case 'shipped':
        return 'text-yellow-500';
      case 'delivered':
        return 'text-green-500';
      case 'completed':
        return 'text-purple-500';
      default:
        return 'text-gray-500';
    }
  };

  // Функция для перевода статуса заказа на русский язык
  const translateStatus = (status) => {
    switch (status.toLowerCase()) {
      case 'processing':
        return 'В обработке';
      case 'shipped':
        return 'Отправлен';
      case 'delivered':
        return 'Доставлен';
      case 'completed':
        return 'Завершен';
      default:
        return status || 'Неизвестно';
    }
  };

  // Получаем отображаемые заказы в зависимости от состояния showAllOrders
  const displayedOrders = showAllOrders ? orders : orders.slice(0, 3);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <i className="fas fa-spinner fa-spin text-4xl text-blue-500"></i>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        <i className="fas fa-exclamation-circle text-2xl mb-2"></i>
        <p>{error}</p>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="text-center text-gray-500 p-4">
        <i className="fas fa-shopping-bag text-4xl mb-2"></i>
        <p>У вас пока нет заказов</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Заказы</h2>
      <div className="space-y-4">
        {displayedOrders.map((order) => (
          <div key={order._id} className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-lg font-semibold">Заказ #{order._id.slice(-6)}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                </p>
              </div>
              <div className={`flex items-center ${getStatusColor(order.status)}`}>
                <i className={`fas ${getStatusIcon(order.status)} mr-2`}></i>
                <span className="font-medium">{translateStatus(order.status)}</span>
              </div>
            </div>
            <div className="border-t pt-2">
              <p className="text-sm">
                <span className="font-medium">Товаров:</span> {order.items.length}
              </p>
              <p className="text-sm">
                <span className="font-medium">Итого:</span>{' '}
                {order.totalAmount.toLocaleString('ru-RU')} ₽
              </p>
            </div>
          </div>
        ))}
        
        {orders.length > 3 && !showAllOrders && (
          <div className="text-center mt-4">
            <button 
              onClick={() => setShowAllOrders(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Показать все заказы ({orders.length})
            </button>
          </div>
        )}
        
        {showAllOrders && orders.length > 3 && (
          <div className="text-center mt-4">
            <button 
              onClick={() => setShowAllOrders(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
            >
              Свернуть заказы
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;