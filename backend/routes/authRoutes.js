import express from 'express';
import AuthController from '../controllers/authController.js';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Маршрут для регистрации нового пользователя
router.post('/register', AuthController.register);

// Маршрут для входа в аккаунт
router.post('/login', AuthController.login);

// Маршрут для выхода из аккаунта
router.post('/logout', AuthController.logout);

// Админские маршруты для управления пользователями
router.get('/admin/users', isAuthenticatedUser, authorizeRoles('admin'), AuthController.getAllUsers);
router.delete('/admin/users/:id', isAuthenticatedUser, authorizeRoles('admin'), AuthController.deleteUser);

export default router;
