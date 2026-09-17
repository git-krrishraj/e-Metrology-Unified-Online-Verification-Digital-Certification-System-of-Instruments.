import express from 'express';
import { verifyCertificatePublic, searchPublicRegistry } from '../controllers/publicController.js';

const router = express.Router();

// Public routes - no authentication required
router.get('/verify/:certId', verifyCertificatePublic);
router.get('/search', searchPublicRegistry);

export default router;
