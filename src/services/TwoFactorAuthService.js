const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require('crypto');
const securityConfig = require('../config/security');
const EncryptionService = require('./EncryptionService');

/**
 * Two-Factor Authentication Service
 * Implements TOTP-based 2FA with backup codes
 */

class TwoFactorAuthService {
  /**
   * Generate a new 2FA secret for a user
   */
  generateSecret(userEmail) {
    const secret = speakeasy.generateSecret({
      name: `${securityConfig.twoFactor.issuer} (${userEmail})`,
      issuer: securityConfig.twoFactor.issuer,
      length: 32,
    });

    return {
      secret: secret.base32,
      otpauthUrl: secret.otpauth_url,
    };
  }

  /**
   * Generate QR code for authenticator apps
   */
  async generateQRCode(otpauthUrl) {
    try {
      const qrCodeDataURL = await QRCode.toDataURL(otpauthUrl);
      return qrCodeDataURL;
    } catch (error) {
      throw new Error('Failed to generate QR code: ' + error.message);
    }
  }

  /**
   * Verify TOTP token
   */
  verifyToken(secret, token) {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: securityConfig.twoFactor.window,
    });
  }

  /**
   * Generate backup codes
   */
  generateBackupCodes(count = securityConfig.twoFactor.backupCodesCount) {
    const codes = [];
    for (let i = 0; i < count; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      const formatted = `${code.slice(0, 4)}-${code.slice(4, 8)}`;
      codes.push(formatted);
    }
    return codes;
  }

  /**
   * Encrypt backup codes for storage
   * Returns new array of encrypted code objects without mutating input
   */
  encryptBackupCodes(codes) {
    return codes.map(code => {
      const encrypted = EncryptionService.encrypt(code);
      return {
        code: encrypted.encryptedData,
        iv: encrypted.iv,
        authTag: encrypted.authTag,
        used: false,
      };
    });
  }

  /**
   * Verify backup code
   * Note: This method marks codes as used by setting the 'used' flag.
   * The caller is responsible for persisting this change to the database.
   */
  verifyBackupCode(encryptedCodes, providedCode) {
    for (const encryptedCode of encryptedCodes) {
      if (encryptedCode.used) continue;

      try {
        const decrypted = EncryptionService.decrypt({
          encryptedData: encryptedCode.code,
          iv: encryptedCode.iv,
          authTag: encryptedCode.authTag,
        });

        if (decrypted === providedCode) {
          encryptedCode.used = true;
          return true;
        }
      } catch (error) {
        // Invalid code, continue
        continue;
      }
    }
    return false;
  }

  /**
   * Setup 2FA for a user (returns secret and QR code)
   */
  async setupTwoFactor(userEmail) {
    const { secret, otpauthUrl } = this.generateSecret(userEmail);
    const qrCode = await this.generateQRCode(otpauthUrl);
    const backupCodes = this.generateBackupCodes();
    const encryptedBackupCodes = this.encryptBackupCodes(backupCodes);

    return {
      secret,
      qrCode,
      backupCodes, // Display these once to the user
      encryptedBackupCodes, // Store these in database
    };
  }

  /**
   * Verify 2FA setup by confirming user can generate valid token
   */
  verifySetup(secret, token) {
    return this.verifyToken(secret, token);
  }
}

module.exports = new TwoFactorAuthService();
