import express from 'express';
import {
  createNotice,
  getNotices,
  getNotice,
  updateNotice,
  deleteNotice,
} from '../controllers/notice.controller.js';
import verifyToken from '../middleware/verifyToken.js';
import { checkRole } from '../middleware/checkRole.js';

const router = express.Router();

// CREATE
router.post(
  '/',
  verifyToken,
  checkRole(['admin']),
  createNotice
);

// GET ALL
router.get(
  '/',
  verifyToken,
  checkRole(['resident', 'admin', 'guard']),
  getNotices
);

// GET ONE
router.get(
  '/:id',
  verifyToken,
  checkRole(['resident', 'admin', 'guard']),
  getNotice
);

// UPDATE
router.patch(
  '/:id',
  verifyToken,
  checkRole(['admin']),
  updateNotice
);

// DELETE
router.delete(
  '/:id',
  verifyToken,
  checkRole(['admin']),
  deleteNotice
);

export default router;
