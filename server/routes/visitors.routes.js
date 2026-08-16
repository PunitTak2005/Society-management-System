import express from 'express';
import {
  registerVisitor,
  updateVisitorStatus,
  generatePreAuthPasscode,
  verifyPasscode,
  emailActionHandler,
  getVisitors,
} from '../controllers/visitors.controller.js';
import verifyToken from '../middleware/verifyToken.js';
import { checkRole } from '../middleware/checkRole.js';

const router = express.Router();

// Public link endpoint for email actions (signed token validation)
router.get('/visitors/email-action', emailActionHandler);

// Walk-in visitor logs check
router.get(
  '/visitors',
  verifyToken,
  checkRole(['admin', 'security_guard', 'staff']),
  getVisitors
);

// Register a walk-in visitor (Guard only)
router.post(
  '/visitors',
  verifyToken,
  checkRole(['security_guard', 'admin']),
  registerVisitor
);

// Accept/Reject visitor (Resident/Admin)
router.post(
  '/visitors/status',
  verifyToken,
  checkRole(['resident', 'admin']),
  updateVisitorStatus
);

// Pre-authorize guest passcode (Resident/Admin)
router.post(
  '/visitors/preauth',
  verifyToken,
  checkRole(['resident', 'admin']),
  generatePreAuthPasscode
);

// Verify passcode at gate (Guard/Admin)
router.post(
  '/visitors/verify',
  verifyToken,
  checkRole(['security_guard', 'admin']),
  verifyPasscode
);

export default router;