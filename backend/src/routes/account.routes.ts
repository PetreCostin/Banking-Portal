import { Router } from 'express';
import * as accountController from '../controllers/account.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', accountController.getAccounts);
router.get('/:id', accountController.getAccountById);
router.post(
  '/',
  validate(accountController.accountValidators.create),
  accountController.createAccount
);
router.get('/:id/balance', accountController.getAccountBalance);

export default router;
