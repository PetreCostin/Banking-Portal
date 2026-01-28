const argon2 = require('argon2');
const securityConfig = require('../config/security');

/**
 * Password Security Service
 * Implements Argon2 password hashing and validation
 */

class PasswordService {
  /**
   * Hash a password using Argon2id
   */
  async hashPassword(password) {
    try {
      const hash = await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 65536, // 64 MB
        timeCost: 3,
        parallelism: 4,
      });
      return hash;
    } catch (error) {
      throw new Error('Failed to hash password: ' + error.message);
    }
  }

  /**
   * Verify a password against a hash
   */
  async verifyPassword(hash, password) {
    try {
      return await argon2.verify(hash, password);
    } catch (error) {
      return false;
    }
  }

  /**
   * Validate password strength
   */
  validatePasswordStrength(password) {
    const errors = [];
    const config = securityConfig.password;

    if (password.length < config.minLength) {
      errors.push(`Password must be at least ${config.minLength} characters long`);
    }

    if (config.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (config.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (config.requireNumbers && !/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (config.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    // Check for common weak passwords
    const commonPasswords = [
      'password', 'password123', '12345678', 'qwerty', 'abc123',
      'letmein', 'welcome', 'admin', 'admin123', 'password1'
    ];

    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push('Password is too common');
    }

    return {
      valid: errors.length === 0,
      errors,
      strength: this.calculatePasswordStrength(password),
    };
  }

  /**
   * Calculate password strength score (0-100)
   */
  calculatePasswordStrength(password) {
    let score = 0;

    // Length bonus
    score += Math.min(password.length * 4, 40);

    // Character variety bonus
    if (/[a-z]/.test(password)) score += 10;
    if (/[A-Z]/.test(password)) score += 10;
    if (/[0-9]/.test(password)) score += 10;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 15;

    // Complexity bonus
    const uniqueChars = new Set(password).size;
    score += Math.min(uniqueChars * 2, 15);

    return Math.min(score, 100);
  }

  /**
   * Check if password has expired
   */
  isPasswordExpired(passwordLastChanged) {
    if (!securityConfig.password.expiryDays) return false;

    const expiryDate = new Date(passwordLastChanged);
    expiryDate.setDate(expiryDate.getDate() + securityConfig.password.expiryDays);

    return new Date() > expiryDate;
  }

  /**
   * Generate a secure random password
   */
  generateSecurePassword(length = 16) {
    const crypto = require('crypto');
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const all = uppercase + lowercase + numbers + special;

    let password = '';
    
    // Ensure at least one of each required type (using crypto.randomInt)
    password += uppercase[crypto.randomInt(0, uppercase.length)];
    password += lowercase[crypto.randomInt(0, lowercase.length)];
    password += numbers[crypto.randomInt(0, numbers.length)];
    password += special[crypto.randomInt(0, special.length)];

    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      password += all[crypto.randomInt(0, all.length)];
    }

    // Fisher-Yates shuffle with cryptographically secure random
    const passwordArray = password.split('');
    for (let i = passwordArray.length - 1; i > 0; i--) {
      const j = crypto.randomInt(0, i + 1);
      [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
    }

    return passwordArray.join('');
  }

  /**
   * Check if new password is in password history
   */
  async isPasswordInHistory(newPassword, passwordHistory) {
    for (const oldHash of passwordHistory) {
      if (await this.verifyPassword(oldHash, newPassword)) {
        return true;
      }
    }
    return false;
  }
}

module.exports = new PasswordService();
