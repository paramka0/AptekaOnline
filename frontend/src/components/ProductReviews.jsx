import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaStar, FaTrash } from 'react-icons/fa';
import api from '../api/axiosConfig';

const ProductReviews = ({ productId }) => {
  const { user, isAdmin } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userReview, setUserReview] = useState(null);

  // Загрузка отзывов
  const loadReviews = async () => {
    try {
      const response = await api.get(`/reviews/product/${productId}`);
      if (response.data.success) {
        setReviews(response.data.reviews);
        // Находим отзыв текущего пользователя
        if (user) {
          const currentUserReview = response.data.reviews.find(
            review => review.userId === user.id
          );
          setUserReview(currentUserReview);
        }
      } else {
        setError(response.data.message || 'Не удалось загрузить отзывы');
      }
    } catch (error) {
      console.error('Ошибка при загрузке отзывов:', error);
      setError(error.response?.data?.message || 'Не удалось загрузить отзывы');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [productId, user]);

  // Обработка отправки отзыва
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('Для оставления отзыва необходимо авторизоваться');
      return;
    }

    if (userReview) {
      setError('Вы уже оставили отзыв на этот товар');
      return;
    }

    try {
      const response = await api.post(`/reviews/product/${productId}`, newReview);
      if (response.data.success) {
        // Перезагружаем все отзывы после добавления нового
        await loadReviews();
        setNewReview({ rating: 5, comment: '' });
        setError(null);
      } else {
        setError(response.data.message || 'Не удалось отправить отзыв');
      }
    } catch (error) {
      console.error('Ошибка при отправке отзыва:', error);
      setError(error.response?.data?.message || 'Не удалось отправить отзыв');
    }
  };

  // Обработка удаления отзыва
  const handleDeleteReview = async (reviewId) => {
    try {
      const response = await api.delete(`/reviews/${reviewId}`);
      if (response.data.success) {
        // Перезагружаем все отзывы после удаления
        await loadReviews();
        setError(null);
      } else {
        setError(response.data.message || 'Не удалось удалить отзыв');
      }
    } catch (error) {
      console.error('Ошибка при удалении отзыва:', error);
      setError(error.response?.data?.message || 'Не удалось удалить отзыв');
    }
  };

  // Форматирование даты
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Ошибка при форматировании даты:', error);
      return 'Дата не указана';
    }
  };

  // Отрисовка звезд рейтинга
  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <FaStar
        key={index}
        className={`text-xl ${
          index < rating ? 'text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  // Расчет средней оценки
  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  if (loading) {
    return <div className="text-center py-4">Загрузка отзывов...</div>;
  }

  const averageRating = calculateAverageRating();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Отзывы</h2>
        {reviews.length > 0 && (
          <div className="flex items-center">
            <div className="flex mr-2">
              {renderStars(Math.round(averageRating))}
            </div>
            <span className="text-lg font-semibold text-gray-700">
              {averageRating} из 5
            </span>
            <span className="text-sm text-gray-500 ml-2">
              ({reviews.length} {reviews.length === 1 ? 'отзыв' : 'отзывов'})
            </span>
          </div>
        )}
      </div>

      {/* Форма добавления отзыва */}
      {user && !userReview && (
        <form onSubmit={handleSubmitReview} className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Оставить отзыв</h3>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Оценка:</label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setNewReview(prev => ({ ...prev, rating }))}
                  className="focus:outline-none"
                >
                  <FaStar
                    className={`text-2xl ${
                      rating <= newReview.rating ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Выбранная оценка: {newReview.rating} из 5
            </p>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Комментарий:</label>
            <textarea
              value={newReview.comment}
              onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Отправить отзыв
          </button>
        </form>
      )}

      {/* Список отзывов */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-gray-500">Пока нет отзывов</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-semibold text-gray-800">{review.userName}</h4>
                  <p className="text-sm text-gray-500">
                    {formatDate(review.createdAt)}
                  </p>
                </div>
                {(isAdmin || (user && user.id === review.userId)) && (
                  <button
                    onClick={() => handleDeleteReview(review.id)}
                    className="text-red-500 hover:text-red-700 transition"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
              <div className="flex items-center mb-2">
                <div className="flex mr-2">
                  {renderStars(review.rating)}
                </div>
                <span className="text-sm text-gray-500">
                  {review.rating} из 5
                </span>
              </div>
              <p className="text-gray-700">{review.comment}</p>
            </div>
          ))
        )}
      </div>

      {error && (
        <div className="text-red-500 text-center">{error}</div>
      )}
    </div>
  );
};

export default ProductReviews; 