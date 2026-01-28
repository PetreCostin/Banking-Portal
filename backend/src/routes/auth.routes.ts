import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validate } from '../middleware/validation.middleware';

const router = Router();

router.post(
  '/register',
  validate(authController.authValidators.register),
  authController.register
);

router.post(
  '/login',
  validate(authController.authValidators.login),
  authController.login
);

router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);

export default router;
