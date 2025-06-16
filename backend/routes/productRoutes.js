import express from 'express';
import ProductController from '../controllers/productController.js';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Получение всех продуктов с возможностью фильтрации (для главной страницы)
router.get('/products', ProductController.getAllProducts);

// Получение всех продуктов для админ панели
router.get('/admin/products', isAuthenticatedUser, authorizeRoles('admin'), ProductController.getAllProductsAdmin);

// Получение всех уникальных тегов
router.get('/products/tags/all', ProductController.getProductTags);

// Получение ценового диапазона
router.get('/products/price-range', ProductController.getPriceRange);

// Получение продукта по ID
router.get('/products/:id', ProductController.getProductById);

// Админские операции
router.post('/products', isAuthenticatedUser, authorizeRoles('admin'), ProductController.addProduct);
router.put('/products/:id', isAuthenticatedUser, authorizeRoles('admin'), ProductController.updateProduct);
router.delete('/products/:id', isAuthenticatedUser, authorizeRoles('admin'), ProductController.deleteProduct);

export default router;