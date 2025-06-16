import express from 'express';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';
import { 
  getAdminStats, 
  getAllOrders,
  updateOrderStatus,
  deleteOrder
} from '../controllers/adminController.js';

const router = express.Router();

router.get('/admin/stats', 
  isAuthenticatedUser, 
  authorizeRoles('admin'), 
  getAdminStats
);

router.get('/admin/orders', 
  isAuthenticatedUser, 
  authorizeRoles('admin'), 
  getAllOrders
);

router.put('/admin/orders/:id',
  isAuthenticatedUser,
  authorizeRoles('admin'),
  updateOrderStatus
);

router.delete('/admin/orders/:id',
  isAuthenticatedUser,
  authorizeRoles('admin'),
  deleteOrder
);

export default router;