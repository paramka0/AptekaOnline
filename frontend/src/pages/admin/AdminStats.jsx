import { useEffect } from 'react';
import { FaUsers, FaBox, FaMoneyBillWave, FaShoppingCart } from 'react-icons/fa';
import { useStats } from '../../context/StatsContext';

const AdminStats = () => {
  const { stats, fetchStats } = useStats();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center">
          <FaUsers className="text-blue-500 text-2xl mr-4" />
          <div>
            <h3 className="text-gray-500">Пользователи</h3>
            <p className="text-2xl font-bold">{stats.usersCount}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center">
          <FaBox className="text-green-500 text-2xl mr-4" />
          <div>
            <h3 className="text-gray-500">Товары</h3>
            <p className="text-2xl font-bold">{stats.productsCount}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center">
          <FaShoppingCart className="text-purple-500 text-2xl mr-4" />
          <div>
            <h3 className="text-gray-500">Заказы</h3>
            <p className="text-2xl font-bold">{stats.totalOrders}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center">
          <FaMoneyBillWave className="text-yellow-500 text-2xl mr-4" />
          <div>
            <h3 className="text-gray-500">Доход</h3>
            <p className="text-2xl font-bold">{stats.totalRevenue.toLocaleString('ru-RU')} ₽</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStats; 