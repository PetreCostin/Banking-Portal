const express = require('express');
const router = express.Router();
const SecurityController = require('../controllers/SecurityController');
const { authLimiter } = require('../middleware/rateLimitMiddleware');

/**
 * Security Routes
 * Handles 2FA, password management, and security settings
 */

// 2FA Routes
router.post('/2fa/setup', authLimiter, (req, res) => SecurityController.setup2FA(req, res));
router.post('/2fa/verify-setup', authLimiter, (req, res) => SecurityController.verifySetup(req, res));
router.post('/2fa/verify', authLimiter, (req, res) => SecurityController.verify2FA(req, res));
router.post('/2fa/disable', authLimiter, (req, res) => SecurityController.disable2FA(req, res));

// Password Routes
router.post('/change-password', authLimiter, (req, res) => SecurityController.changePassword(req, res));
router.post('/validate-password', (req, res) => SecurityController.validatePassword(req, res));

// Security Settings Routes
router.get('/settings', (req, res) => SecurityController.getSecuritySettings(req, res));

module.exports = router;
