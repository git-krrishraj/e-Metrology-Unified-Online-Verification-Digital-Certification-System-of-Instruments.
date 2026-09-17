import express from 'express';
import {
  submitApplication,
  getMyApplications,
  getAllApplications,
  getApplicationById
} from '../controllers/applicationController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = express.Router();

router.use(protect);

router.post('/', submitApplication);
router.get('/my', getMyApplications);
router.get('/', authorize('admin', 'lmo', 'gatc'), getAllApplications);
router.get('/:id', getApplicationById);

export default router;
