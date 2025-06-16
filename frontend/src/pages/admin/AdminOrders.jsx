import React, { useState, useEffect } from 'react';
import { getOrders, updateOrderStatus, deleteOrder } from '../../api/apiService';
import { FaSpinner, FaTruck, FaBox, FaCheckCircle, FaTimesCircle, FaTrash } from 'react-icons/fa';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

  const fetchOrders = async () => {
    try {
      const response = await getOrders();
      setOrders(response.data.orders || []);
      setError(null);
    } catch (err) {
      setError('Не удалось загрузить заказы. Пожалуйста, попробуйте позже.');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000); // Обновляем каждые 30 секунд
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      fetchOrders(); // Обновляем список заказов
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Не удалось обновить статус заказа');
    }
  };

  const handleDeleteOrder = (orderId) => {
    setOrderToDelete(orderId);
    setShowDeleteModal(true);
  };

  const confirmDeleteOrder = async () => {
    if (!orderToDelete) return;
    try {
      await deleteOrder(orderToDelete);
      setShowDeleteModal(false);
      setOrderToDelete(null);
      fetchOrders();
    } catch (err) {
      setError('Не удалось удалить заказ');
      setShowDeleteModal(false);
      setOrderToDelete(null);
    }
  };

  const cancelDeleteOrder = () => {
    setShowDeleteModal(false);
    setOrderToDelete(null);
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'processing':
        return <FaSpinner className="animate-spin text-blue-500" />;
      case 'shipped':
        return <FaTruck className="text-yellow-500" />;
      case 'delivered':
        return <FaBox className="text-green-500" />;
      case 'completed':
        return <FaCheckCircle className="text-purple-500" />;
      case 'cancelled':
        return <FaTimesCircle className="text-red-500" />;
      default:
        return <FaSpinner className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-yellow-100 text-yellow-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const translateStatus = (status) => {
    switch (status?.toLowerCase()) {
      case 'processing':
        return 'В обработке';
      case 'shipped':
        return 'Отправлен';
      case 'delivered':
        return 'Доставлен';
      case 'completed':
        return 'Завершён';
      case 'cancelled':
        return 'Отменён';
      case 'refunded':
        return 'Возвращён';
      default:
        return status || 'Неизвестно';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        <FaTimesCircle className="text-2xl mb-2 mx-auto" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Управление заказами</h1>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID заказа
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Клиент
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Сумма
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <React.Fragment key={order.id}>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.userPhone || 'Нет данных'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.totalPrice.toLocaleString('ru-RU')} ₽
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                        {getStatusIcon(order.orderStatus)}
                        <span className="ml-1">{translateStatus(order.orderStatus)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2 items-center">
                        <select
                          value={order.orderStatus}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="text-sm border rounded px-2 py-1"
                        >
                          <option value="processing">В обработке</option>
                          <option value="shipped">Отправлен</option>
                          <option value="delivered">Доставлен</option>
                          <option value="completed">Завершён</option>
                          <option value="cancelled">Отменён</option>
                        </select>
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="text-red-600 hover:text-red-900 flex items-center"
                          title="Удалить заказ"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {order.orderStatus && order.orderStatus.toLowerCase() === 'cancelled' && (
                    <tr>
                      <td colSpan="6" className="px-6 py-2 text-center text-red-600 bg-red-50 font-semibold">
                        Заказ #{order.id} был отменён
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Подтверждение удаления заказа</h3>
            <p className="text-gray-600 mb-6">
              Вы уверены, что хотите <b>удалить</b> этот заказ? Это действие нельзя будет отменить.
            </p>
            <div className="flex gap-4">
              <button
                onClick={cancelDeleteOrder}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Отмена
              </button>
              <button
                onClick={confirmDeleteOrder}
                className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Удалить заказ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders; 