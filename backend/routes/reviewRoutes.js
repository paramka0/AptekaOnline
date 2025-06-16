import express from 'express';
import ReviewController from '../controllers/reviewController.js';
import { isAuthenticatedUser } from '../middleware/auth.js';

const router = express.Router();

// Получение отзывов для товара (публичный доступ)
router.get('/product/:productId', ReviewController.getProductReviews);

// Создание отзыва (требуется авторизация)
router.post('/product/:productId', isAuthenticatedUser, ReviewController.createReview);

// Удаление отзыва (требуется авторизация)
router.delete('/:reviewId', isAuthenticatedUser, ReviewController.deleteReview);

export default router; 