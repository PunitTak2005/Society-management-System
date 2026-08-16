import express from 'express';
import {
  deactivateUser,
  getAllUser,
  getSingleUser,
  updateUser,
  updateProfilePhoto,
  updateSelfProfile,
  changeSelfPassword,
} from '../controllers/user.controller.js';
import verifyToken from '../middleware/verifyToken.js';
import { checkRole } from '../middleware/checkRole.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/users', verifyToken, checkRole(['admin']), getAllUser);
router.get('/users/:id', verifyToken, checkRole(['admin']), getSingleUser);
router.patch('/users/:id/deactivate', verifyToken, checkRole(['admin']), deactivateUser);
router.patch('/users/:id', verifyToken, checkRole(['admin']), updateUser);
router.patch('/users/:id/profile-photo', verifyToken, upload.single('profilePhoto'), updateProfilePhoto);
router.patch('/profile', verifyToken, updateSelfProfile);
router.patch('/profile/change-password', verifyToken, changeSelfPassword);

export default router;
