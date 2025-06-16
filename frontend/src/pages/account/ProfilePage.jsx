import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getUserOrders } from '../../api/apiService';
import { getProfile, updateProfile, deleteAccount } from '../../api/profileService';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useNavigate, Link } from 'react-router-dom';
import { FaCog, FaEdit, FaSave, FaTimes, FaUser, FaPhone, FaHistory, FaTrash } from 'react-icons/fa';

const UserProfile = () => {
  const { user, isAdmin, logout, profile, updateUserProfile } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllOrders, setShowAllOrders] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    gender: ''
  });
  const [profileError, setProfileError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const navigate = useNavigate();

  const loadOrders = async () => {
    try {
      const ordersData = await getUserOrders();
      console.log('Получены заказы в профиле:', ordersData);
      
      if (Array.isArray(ordersData)) {
        setOrders(ordersData);
      } else {
        console.warn('Данные заказов не найдены в ответе профиля');
        setOrders([]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Ошибка при загрузке заказов:', error);
      setError('Не удалось загрузить заказы');
      setLoading(false);
      setOrders([]);
    }
  };

  const loadProfile = async () => {
    try {
      const response = await getProfile();
      if (response.success && response.profile) {
        setProfileData({
          firstName: response.profile.firstName || '',
          lastName: response.profile.lastName || '',
          gender: response.profile.gender || ''
        });
        updateUserProfile(response.profile);
      }
    } catch (error) {
      console.error('Ошибка при загрузке профиля:', error);
      setProfileError('Не удалось загрузить данные профиля');
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await updateProfile(profileData);
      if (response.success) {
        setIsEditing(false);
        setProfileError(null);
        updateUserProfile(response.profile);
      }
    } catch (error) {
      console.error('Ошибка при обновлении профиля:', error);
      setProfileError(error.message || 'Не удалось обновить профиль');
    }
  };

  // Универсальные функции для стиля и иконки статуса (как в админке)
  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'processing':
        return 'fa-spinner fa-spin text-blue-500';
      case 'shipped':
        return 'fa-truck text-yellow-500';
      case 'delivered':
        return 'fa-box text-green-500';
      case 'completed':
        return 'fa-check-circle text-purple-500';
      case 'cancelled':
        return 'fa-times-circle text-red-500';
      default:
        return 'fa-spinner text-gray-500';
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

  // Получаем отображаемые заказы в зависимости от состояния showAllOrders
  const displayedOrders = showAllOrders ? orders : orders.slice(0, 3);

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Ошибка при удалении аккаунта:', error);
      setProfileError('Не удалось удалить аккаунт. Пожалуйста, попробуйте позже.');
    }
  };

  useEffect(() => {
    if (user) {
      loadOrders();
      if (!profile) {
        loadProfile();
      } else {
        setProfileData({
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          gender: profile.gender || ''
        });
      }
      const interval = setInterval(loadOrders, 20000);
      return () => clearInterval(interval);
    }
  }, [user, profile]);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 text-center">
          <p>Для просмотра профиля необходимо авторизоваться</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Основная информация */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <FaUser className="text-blue-600 text-2xl" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    {profileData.firstName && profileData.lastName 
                      ? `${profileData.firstName} ${profileData.lastName}`
                      : 'Профиль пользователя'}
                  </h1>
                  <p className="text-gray-600 flex items-center mt-1">
                    <FaPhone className="mr-2" />
                    {user?.phone}
                  </p>
                </div>
              </div>
            {isAdmin && (
                <Link 
                  to="/admin" 
                  className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                >
                  <FaCog className="mr-2" />
                  Админ-панель
                </Link>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Личные данные */}
            <div className="md:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Личные данные</h2>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-blue-500 hover:text-blue-700 transition"
                    >
                      <FaEdit className="text-xl" />
                    </button>
                  ) : (
                <button 
                      onClick={() => setIsEditing(false)}
                      className="text-gray-500 hover:text-gray-700 transition"
                >
                      <FaTimes className="text-xl" />
                </button>
              )}
                </div>

                {isEditing ? (
                  <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Имя</label>
                      <input
                        type="text"
                        name="firstName"
                        value={profileData.firstName}
                        onChange={handleProfileChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Введите имя"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Фамилия</label>
                      <input
                        type="text"
                        name="lastName"
                        value={profileData.lastName}
                        onChange={handleProfileChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Введите фамилию"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Пол</label>
                      <select
                        name="gender"
                        value={profileData.gender}
                        onChange={handleProfileChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Не указан</option>
                        <option value="male">Мужской</option>
                        <option value="female">Женский</option>
                        <option value="other">Другой</option>
                      </select>
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
                      >
                        Отмена
                      </button>
              <button 
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center"
              >
                        <FaSave className="mr-2" />
                        Сохранить
              </button>
            </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Имя</label>
                      <p className="mt-1 text-gray-800">{profileData.firstName || 'Не указано'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Фамилия</label>
                      <p className="mt-1 text-gray-800">{profileData.lastName || 'Не указано'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Пол</label>
                      <p className="mt-1 text-gray-800">
                        {profileData.gender === 'male' ? 'Мужской' :
                         profileData.gender === 'female' ? 'Женский' :
                         profileData.gender === 'other' ? 'Другой' : 'Не указан'}
                      </p>
                    </div>
                  </div>
                )}
                {profileError && (
                  <p className="mt-4 text-red-500 text-sm">{profileError}</p>
                )}
              </div>
          </div>

            {/* История заказов */}
          <div className="md:col-span-2">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <FaHistory className="text-blue-600 text-xl mr-2" />
                    <h2 className="text-xl font-bold text-gray-800">История заказов</h2>
                  </div>
                  {orders.length > 3 && (
                <button 
                      onClick={() => setShowAllOrders(!showAllOrders)}
                      className="text-blue-600 hover:text-blue-800 transition"
                >
                      {showAllOrders ? 'Показать меньше' : 'Показать все'}
                </button>
                  )}
              </div>

                {loading ? (
                  <p className="text-gray-500">Загрузка заказов...</p>
                ) : error ? (
                  <p className="text-red-500">{error}</p>
            ) : orders.length === 0 ? (
                  <p className="text-gray-500">У вас пока нет заказов</p>
            ) : (
              <div className="space-y-4">
                    {displayedOrders.map((order) => {
                  // Вычисляем суммы, если их нет в заказе
                  const items = order.items || order.orderItems || [];
                  const itemsPrice = order.itemsPrice ?? order.items_price ?? items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                  const shippingPrice = order.shippingPrice ?? order.shipping_price ?? 300;
                      const taxPrice = order.taxPrice ?? order.tax_price ?? 0;
                      const totalPrice = order.totalPrice ?? order.totalAmount ?? (itemsPrice + shippingPrice + taxPrice);

                  return (
                        <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition">
                          <div className="flex justify-between items-start mb-2">
                        <div>
                              <p className="font-medium text-gray-800">Заказ #{order.id}</p>
                              <p className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                          </p>
                        </div>
                            <span className={`px-3 py-1 rounded-full text-sm inline-flex items-center ${getStatusColor(order.orderStatus)}`}>
                            <i className={`fas ${getStatusIcon(order.orderStatus)} mr-1`}></i>
                            {translateStatus(order.orderStatus)}
                          </span>
                        </div>
                          <div className="mt-2">
                            <p className="text-gray-600">
                              Сумма: {totalPrice.toLocaleString('ru-RU')} ₽
                            </p>
                      {items.length > 0 && (
                              <div className="mt-2 text-sm text-gray-500">
                                Товаров: {items.length}
                            </div>
                            )}
                          </div>
                          {(order.orderStatus && order.orderStatus.toLowerCase() === 'cancelled') && (
                            <div className="mt-2 text-red-600 font-semibold">Ваш заказ был отменён</div>
                      )}
                    </div>
                  );
                })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Кнопка удаления аккаунта */}
          <div className="mt-8">
            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <FaTrash />
              Удалить аккаунт
            </button>
          </div>

          {/* Модальное окно подтверждения удаления */}
          {showDeleteModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h3 className="text-xl font-semibold mb-4">Подтверждение удаления</h3>
                <p className="text-gray-600 mb-6">
                  Вы уверены, что хотите удалить свой аккаунт? Это действие нельзя будет отменить.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Отмена
                  </button>
                    <button 
                    onClick={handleDeleteAccount}
                    className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
                    >
                    Удалить
                    </button>
                  </div>
              </div>
              </div>
            )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UserProfile;