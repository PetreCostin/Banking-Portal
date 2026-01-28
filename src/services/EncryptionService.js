const crypto = require('crypto');
const securityConfig = require('../config/security');

/**
 * Encryption Service
 * Provides field-level encryption for sensitive data
 */

class EncryptionService {
  constructor() {
    // Use environment variable or generate a key (in production, always use env)
    this.encryptionKey = securityConfig.encryption.key || this.generateKey();
    this.algorithm = securityConfig.encryption.algorithm;
  }

  /**
   * Generate a random encryption key
   */
  generateKey() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Encrypt data using AES-256-GCM
   */
  encrypt(text) {
    if (!text) return text;

    const iv = crypto.randomBytes(16);
    const key = Buffer.from(this.encryptionKey.slice(0, 64), 'hex');
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);

    let encrypted = cipher.update(text.toString(), 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return {
      iv: iv.toString('hex'),
      encryptedData: encrypted,
      authTag: authTag.toString('hex'),
    };
  }

  /**
   * Decrypt data
   */
  decrypt(encryptedObj) {
    if (!encryptedObj || !encryptedObj.encryptedData) return encryptedObj;

    const key = Buffer.from(this.encryptionKey.slice(0, 64), 'hex');
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      key,
      Buffer.from(encryptedObj.iv, 'hex')
    );

    decipher.setAuthTag(Buffer.from(encryptedObj.authTag, 'hex'));

    let decrypted = decipher.update(encryptedObj.encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Hash data (one-way)
   */
  hash(text) {
    return crypto.createHash('sha256').update(text).digest('hex');
  }

  /**
   * Mask sensitive data for display
   */
  maskAccountNumber(accountNumber) {
    if (!accountNumber) return '';
    const str = accountNumber.toString();
    if (str.length <= 4) return '****';
    return '****' + str.slice(-4);
  }

  /**
   * Mask email address
   */
  maskEmail(email) {
    if (!email) return '';
    const [localPart, domain] = email.split('@');
    if (!domain) return email;
    const maskedLocal = localPart.charAt(0) + '***' + localPart.charAt(localPart.length - 1);
    return maskedLocal + '@' + domain;
  }

  /**
   * Mask phone number
   */
  maskPhone(phone) {
    if (!phone) return '';
    const str = phone.toString().replace(/\D/g, '');
    if (str.length <= 4) return '***-****';
    return '***-***-' + str.slice(-4);
  }
}

module.exports = new EncryptionService();
