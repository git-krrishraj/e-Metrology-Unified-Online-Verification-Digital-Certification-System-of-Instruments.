import express from 'express';
import {
  getAssignedQueue,
  recordInspection
} from '../controllers/inspectionController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import { upload } from '../config/multer.js';

const router = express.Router();

router.use(protect);
router.use(authorize('lmo', 'gatc', 'admin'));

router.get('/queue', getAssignedQueue);
router.post('/record', upload.array('inspectionPhotos', 5), recordInspection);

export default router;
