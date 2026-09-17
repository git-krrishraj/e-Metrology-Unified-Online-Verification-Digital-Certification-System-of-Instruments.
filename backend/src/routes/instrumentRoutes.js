import express from 'express';
import {
  createInstrument,
  getMyInstruments,
  getInstrumentById,
  getAllInstruments
} from '../controllers/instrumentController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import { upload } from '../config/multer.js';

const router = express.Router();

router.use(protect);

router.post('/', upload.array('photos', 5), createInstrument);
router.get('/my', getMyInstruments);
router.get('/', authorize('admin', 'lmo', 'gatc'), getAllInstruments);
router.get('/:id', getInstrumentById);

export default router;
