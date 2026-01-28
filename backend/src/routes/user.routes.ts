import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = Router();

router.use(authenticate);

router.get('/profile', userController.getProfile);
router.put(
  '/profile',
  validate(userController.userValidators.updateProfile),
  userController.updateProfile
);
router.put(
  '/change-password',
  validate(userController.userValidators.changePassword),
  userController.changePassword
);

export default router;
