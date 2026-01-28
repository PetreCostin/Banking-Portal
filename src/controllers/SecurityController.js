const TwoFactorAuthService = require('../services/TwoFactorAuthService');
const PasswordService = require('../services/PasswordService');
const { logSecurityEvent } = require('../middleware/auditLogMiddleware');

/**
 * Security Controller
 * Handles 2FA, password changes, and security settings
 */

class SecurityController {
  /**
   * Setup 2FA - Generate secret and QR code
   * POST /api/security/2fa/setup
   */
  async setup2FA(req, res) {
    try {
      const userEmail = req.body.email || 'user@example.com'; // In production, get from session

      const setup = await TwoFactorAuthService.setupTwoFactor(userEmail);

      logSecurityEvent('2fa_setup_initiated', 'info', {
        email: userEmail,
        ip: req.ip,
      });

      // In production, store setup.secret and setup.encryptedBackupCodes in database
      res.json({
        success: true,
        qrCode: setup.qrCode,
        secret: setup.secret, // Send this once, user should scan QR code
        backupCodes: setup.backupCodes, // Display once, user should save
      });
    } catch (error) {
      logSecurityEvent('2fa_setup_failed', 'error', {
        error: error.message,
        ip: req.ip,
      });

      res.status(500).json({
        success: false,
        message: 'Failed to setup 2FA',
      });
    }
  }

  /**
   * Verify 2FA setup
   * POST /api/security/2fa/verify-setup
   */
  verifySetup(req, res) {
    try {
      const { secret, token } = req.body;

      if (!secret || !token) {
        return res.status(400).json({
          success: false,
          message: 'Secret and token are required',
        });
      }

      const isValid = TwoFactorAuthService.verifySetup(secret, token);

      if (isValid) {
        logSecurityEvent('2fa_enabled', 'info', {
          ip: req.ip,
        });

        // In production, update user record to enable 2FA
        res.json({
          success: true,
          message: '2FA enabled successfully',
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Invalid verification code',
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Verification failed',
      });
    }
  }

  /**
   * Verify 2FA token during login
   * POST /api/security/2fa/verify
   */
  verify2FA(req, res) {
    try {
      const { secret, token } = req.body;

      if (!secret || !token) {
        return res.status(400).json({
          success: false,
          message: 'Secret and token are required',
        });
      }

      const isValid = TwoFactorAuthService.verifyToken(secret, token);

      if (isValid) {
        logSecurityEvent('2fa_verification_success', 'info', {
          ip: req.ip,
        });

        res.json({
          success: true,
          message: 'Verification successful',
        });
      } else {
        logSecurityEvent('2fa_verification_failed', 'warn', {
          ip: req.ip,
        });

        res.status(400).json({
          success: false,
          message: 'Invalid verification code',
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Verification failed',
      });
    }
  }

  /**
   * Disable 2FA
   * POST /api/security/2fa/disable
   */
  disable2FA(req, res) {
    try {
      const { password } = req.body;

      // In production, verify password before disabling
      // For now, just disable

      logSecurityEvent('2fa_disabled', 'warn', {
        ip: req.ip,
      });

      res.json({
        success: true,
        message: '2FA disabled successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to disable 2FA',
      });
    }
  }

  /**
   * Change password
   * POST /api/security/change-password
   */
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current and new password are required',
        });
      }

      // Validate password strength
      const validation = PasswordService.validatePasswordStrength(newPassword);

      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: 'Password does not meet requirements',
          errors: validation.errors,
        });
      }

      // In production:
      // 1. Verify currentPassword against stored hash
      // 2. Check if newPassword is in password history
      // 3. Hash newPassword and store
      // 4. Update password history

      const hashedPassword = await PasswordService.hashPassword(newPassword);

      logSecurityEvent('password_changed', 'info', {
        ip: req.ip,
        strength: validation.strength,
      });

      res.json({
        success: true,
        message: 'Password changed successfully',
        strength: validation.strength,
      });
    } catch (error) {
      logSecurityEvent('password_change_failed', 'error', {
        error: error.message,
        ip: req.ip,
      });

      res.status(500).json({
        success: false,
        message: 'Failed to change password',
      });
    }
  }

  /**
   * Validate password strength
   * POST /api/security/validate-password
   */
  validatePassword(req, res) {
    try {
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({
          success: false,
          message: 'Password is required',
        });
      }

      const validation = PasswordService.validatePasswordStrength(password);

      res.json({
        success: validation.valid,
        strength: validation.strength,
        errors: validation.errors,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Validation failed',
      });
    }
  }

  /**
   * Get security settings
   * GET /api/security/settings
   */
  getSecuritySettings(req, res) {
    try {
      // In production, get from database for the logged-in user
      const settings = {
        twoFactorEnabled: false,
        passwordLastChanged: new Date().toISOString(),
        sessionTimeout: 900000, // 15 minutes
        loginAttempts: 0,
        accountLocked: false,
      };

      res.json({
        success: true,
        settings,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve settings',
      });
    }
  }
}

module.exports = new SecurityController();
