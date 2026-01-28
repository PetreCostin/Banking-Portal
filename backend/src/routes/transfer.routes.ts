import { Router } from 'express';
import * as transferController from '../controllers/transfer.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = Router();

router.use(authenticate);

router.post(
  '/internal',
  validate(transferController.transferValidators.internal),
  transferController.internalTransfer
);
router.get('/:id/status', transferController.getTransferStatus);

export default router;
