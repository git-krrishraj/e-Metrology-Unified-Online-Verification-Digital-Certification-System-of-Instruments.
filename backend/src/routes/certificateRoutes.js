import express from 'express';
import {
  getMyCertificates,
  getAllCertificates,
  getCertificateById,
  downloadCertificatePDF
} from '../controllers/certificateController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = express.Router();

// Publicly accessible PDF download (verified by ID)
router.get('/:id/pdf', downloadCertificatePDF);

// Protected routes
router.use(protect);
router.get('/my', getMyCertificates);
router.get('/', authorize('admin', 'lmo', 'gatc'), getAllCertificates);
router.get('/:id', getCertificateById);

export default router;
