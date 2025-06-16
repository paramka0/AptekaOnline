import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaTrash } from 'react-icons/fa';
import axios from '../../utils/axios';

const UserManagement = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/');
      return;
    }
    fetchUsers();
  }, [isAuthenticated, isAdmin, navigate]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/admin/users');
      if (response.data && response.data.success) {
        setUsers(response.data.users);
      } else {
        throw new Error('Неверный формат данных');
      }
      setLoading(false);
    } catch (err) {
      console.error('Ошибка при загрузке пользователей:', err);
      setError(err.response?.data?.message || 'Ошибка при загрузке пользователей');
      setLoading(false);
    }
  };

  const handleDeleteClick = (userId) => {
    setUserToDelete(userId);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`/api/admin/users/${userToDelete}`);
      setShowModal(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (err) {
      console.error('Ошибка при удалении пользователя:', err);
      setError(err.response?.data?.message || 'Ошибка при удалении пользователя');
      setShowModal(false);
      setUserToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowModal(false);
    setUserToDelete(null);
  };

  if (loading) return <div className="text-center py-8">Загрузка...</div>;
  if (error) return <div className="text-center py-8 text-red-600">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Управление пользователями</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Телефон
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
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.phone}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.isAdmin ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.isAdmin ? 'Администратор' : 'Пользователь'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    onClick={() => handleDeleteClick(user.id)}
                    className="text-red-600 hover:text-red-900"
                    disabled={user.isAdmin}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Модальное окно подтверждения удаления */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4">Подтвердите удаление</h2>
            <p className="mb-6">Вы уверены, что хотите удалить этого пользователя?</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
              >
                Отмена
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement; 