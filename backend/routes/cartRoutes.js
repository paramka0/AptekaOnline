import express from 'express';
import { isAuthenticatedUser } from '../middleware/auth.js';
import CartController from '../controllers/cartController.js';

const router = express.Router();

// Маршруты корзины
router.get('/cart', isAuthenticatedUser, CartController.getCart);
router.post('/cart', isAuthenticatedUser, CartController.addToCart);
router.delete('/cart/:productId', isAuthenticatedUser, CartController.removeFromCart);
router.put('/cart/:productId', isAuthenticatedUser, CartController.updateCartItem);

export default router; 