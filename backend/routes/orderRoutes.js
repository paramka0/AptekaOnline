import express from 'express';
import {
  newOrder,
  getSingleOrder,
  myOrders,
  allOrders,
  updateOrder,
  deleteOrder
} from '../controllers/orderController.js';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// User routes
router.post('/orders', isAuthenticatedUser, newOrder);
router.get('/orders/:id', isAuthenticatedUser, getSingleOrder);
router.get('/orders/me', isAuthenticatedUser, myOrders);

// Admin routes
router.get('/admin/orders', 
  isAuthenticatedUser, 
  authorizeRoles('admin'), 
  allOrders
);

router.put('/admin/orders/:id',
  isAuthenticatedUser,
  authorizeRoles('admin'),
  updateOrder
);

router.delete('/admin/orders/:id',
  isAuthenticatedUser,
  authorizeRoles('admin'),
  deleteOrder
);

export default router;