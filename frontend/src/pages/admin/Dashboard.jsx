import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getAdminStats } from '../../api/apiService';
import { FaBox, FaUsers, FaMoneyBillWave, FaChartLine } from 'react-icons/fa';

const Dashboard = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (auth.user?.role !== 'admin') {
      navigate('/');
    }

    const fetchStats = async () => {
      try {
        const { data } = await getAdminStats();
        setStats(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Error loading dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [auth, navigate]);

  if (loading) return <div className="flex justify-center py-8">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <FaUsers className="text-blue-500 text-2xl mr-4" />
            <div>
              <h3 className="text-gray-500">Total Users</h3>
              <p className="text-2xl font-bold">{stats?.usersCount || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <FaBox className="text-green-500 text-2xl mr-4" />
            <div>
              <h3 className="text-gray-500">Total Products</h3>
              <p className="text-2xl font-bold">{stats?.productsCount || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <FaMoneyBillWave className="text-yellow-500 text-2xl mr-4" />
            <div>
              <h3 className="text-gray-500">Total Orders</h3>
              <p className="text-2xl font-bold">{stats?.ordersCount || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <FaChartLine className="text-purple-500 text-2xl mr-4" />
            <div>
              <h3 className="text-gray-500">Total Revenue</h3>
              <p className="text-2xl font-bold">${stats?.totalRevenue?.toFixed(2) || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Link 
            to="/admin/products" 
            className="bg-blue-50 p-4 rounded-lg hover:bg-blue-100 transition"
          >
            <h3 className="font-medium text-blue-700">Product Management</h3>
            <p className="text-sm text-gray-600">Manage inventory and listings</p>
          </Link>
          <Link 
            to="/admin/orders" 
            className="bg-green-50 p-4 rounded-lg hover:bg-green-100 transition"
          >
            <h3 className="font-medium text-green-700">Order Management</h3>
            <p className="text-sm text-gray-600">View and process orders</p>
          </Link>
          <Link 
            to="/admin/users" 
            className="bg-purple-50 p-4 rounded-lg hover:bg-purple-100 transition"
          >
            <h3 className="font-medium text-purple-700">User Management</h3>
            <p className="text-sm text-gray-600">Manage customer accounts</p>
          </Link>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
        {/* Order table would go here */}
      </div>
    </div>
  );
};

export default Dashboard;