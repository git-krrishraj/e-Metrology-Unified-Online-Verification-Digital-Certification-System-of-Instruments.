import express from 'express';
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  triggerManualCronSweep
} from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = express.Router();

router.use(protect);

router.get('/', getMyNotifications);
router.patch('/:id/read', markAsRead);
router.patch('/read-all', markAllAsRead);
router.post('/trigger-cron', authorize('admin'), triggerManualCronSweep);

export default router;
