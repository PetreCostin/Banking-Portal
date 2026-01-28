import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All admin routes require authentication and ADMIN role
router.use(authenticate);
router.use(authorize('ADMIN', 'MANAGER'));

router.get('/users', (req, res) => {
  res.json({ users: [] });
});

router.get('/transactions', (req, res) => {
  res.json({ transactions: [] });
});

router.get('/analytics', (req, res) => {
  res.json({ analytics: {} });
});

export default router;
