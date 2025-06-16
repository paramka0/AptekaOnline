import express from 'express';
import ProfileController from '../controllers/profileController.js';
import { isAuthenticatedUser } from '../middleware/auth.js';

const router = express.Router();

// Получение профиля
router.get('/', isAuthenticatedUser, ProfileController.getProfile);

// Обновление профиля
router.put('/', isAuthenticatedUser, ProfileController.updateProfile);

// Удаление аккаунта
router.delete('/', isAuthenticatedUser, ProfileController.deleteAccount);

export default router; 