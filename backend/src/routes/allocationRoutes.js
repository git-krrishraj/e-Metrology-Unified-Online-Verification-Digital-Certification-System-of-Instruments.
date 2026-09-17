import express from 'express';
import {
  getOfficersList,
  assignApplication,
  autoAssignApplication
} from '../controllers/allocationController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/officers', getOfficersList);
router.post('/assign', assignApplication);
router.post('/auto-assign/:id', autoAssignApplication);

export default router;
