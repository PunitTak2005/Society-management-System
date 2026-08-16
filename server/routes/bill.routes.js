import express from 'express';
import { createBill, getBills, payBill, getBillStats } from '../controllers/bill.controller.js';
import verifyToken from '../middleware/verifyToken.js';
import { checkRole } from '../middleware/checkRole.js';

const router = express.Router();

router.use(verifyToken);

router.post('/', checkRole(['admin']), createBill);
router.get('/stats', checkRole(['admin']), getBillStats);
router.get('/', getBills);
router.patch('/:id/pay', payBill);

export default router;
