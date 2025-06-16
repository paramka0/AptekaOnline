import Review from '../models/Review.js';
import ErrorHandler from '../utils/errorHandler.js';
import User from '../models/User.js';

class ReviewController {
  // Получение отзывов для товара
  static async getProductReviews(req, res, next) {
    try {
      const { productId } = req.params;
      const reviews = await Review.getByProductId(productId);
      
      res.status(200).json({
        success: true,
        reviews: reviews.map(review => ({
          id: review.id,
          userId: review.userId,
          productId: review.productId,
          rating: review.rating,
          comment: review.comment,
          createdAt: review.createdAt,
          userName: `${review.firstName || ''} ${review.lastName || ''}`.trim() || 'Анонимный пользователь'
        }))
      });
    } catch (err) {
      console.error('Error getting reviews:', err);
      res.status(500).json({
        success: false,
        message: 'Ошибка при получении отзывов'
      });
    }
  }

  // Создание отзыва
  static async createReview(req, res, next) {
    try {
      const { productId } = req.params;
      const { rating, comment } = req.body;
      const userId = req.user.id;
      
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Рейтинг должен быть от 1 до 5'
        });
      }

      // Проверяем, не оставлял ли пользователь уже отзыв
      const existingReview = await Review.getByUserAndProduct(userId, productId);
      if (existingReview) {
        return res.status(400).json({
          success: false,
          message: 'Вы уже оставили отзыв на этот товар'
        });
      }

      const review = new Review({
        userId,
        productId,
        rating,
        comment
      });

      const savedReview = await review.save();
      
      // Получаем данные пользователя для отображения имени
      const user = await User.getById(userId);
      const userName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Анонимный пользователь';

      // Получаем обновленный список отзывов
      const reviews = await Review.getByProductId(productId);
      
      res.status(201).json({
        success: true,
        message: 'Отзыв успешно добавлен',
        reviews: reviews.map(review => ({
          id: review.id,
          userId: review.userId,
          productId: review.productId,
          rating: review.rating,
          comment: review.comment,
          createdAt: review.createdAt,
          userName: `${review.firstName || ''} ${review.lastName || ''}`.trim() || 'Анонимный пользователь'
        }))
      });
    } catch (err) {
      console.error('Error creating review:', err);
      res.status(500).json({
        success: false,
        message: 'Ошибка при создании отзыва'
      });
    }
  }

  // Удаление отзыва
  static async deleteReview(req, res, next) {
    try {
      const { reviewId } = req.params;
      const userId = req.user.id;
      const isAdmin = req.user.isAdmin;

      console.log('Deleting review:', { reviewId, userId, isAdmin });

      const review = await Review.getById(reviewId);
      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Отзыв не найден'
        });
      }

      // Проверяем права на удаление
      if (!isAdmin && review.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Нет прав на удаление этого отзыва'
        });
      }

      const deleted = await Review.delete(reviewId);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Отзыв не найден'
        });
      }

      res.json({
        success: true,
        message: 'Отзыв успешно удален'
      });
    } catch (err) {
      console.error('Error deleting review:', err);
      res.status(500).json({
        success: false,
        message: 'Ошибка при удалении отзыва'
      });
    }
  }
}

export default ReviewController; 