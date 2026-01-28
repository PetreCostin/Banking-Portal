import { Router } from 'express';
import * as transactionController from '../controllers/transaction.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', transactionController.getTransactions);
router.get('/:id', transactionController.getTransactionById);

export default router;
