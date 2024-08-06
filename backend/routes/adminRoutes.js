import express from 'express';
import { authMiddleware, checkAdminPermission } from '../middlewares/authMiddleware.js';
import cloudinaryUploader from '../middlewares/cloudinaryUploader.js';
import * as groupController from '../controllers/group.js';

const router = express.Router();

router.use(authMiddleware);
router.use(checkAdminPermission);

router.post('/groups', cloudinaryUploader.single('coverImage'), groupController.createGroup);
router.put('/groups/:id', cloudinaryUploader.single('coverImage'), groupController.updateGroup);
router.delete('/groups/:id', groupController.deleteGroup);

export default router;