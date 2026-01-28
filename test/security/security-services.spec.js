const { expect } = require('chai');
const PasswordService = require('../../src/services/PasswordService');
const TwoFactorAuthService = require('../../src/services/TwoFactorAuthService');
const EncryptionService = require('../../src/services/EncryptionService');
const FraudDetectionService = require('../../src/services/FraudDetectionService');

describe('Security Services', () => {
  describe('PasswordService', () => {
    it('should hash and verify passwords correctly', async () => {
      const password = 'SecureP@ssw0rd123';
      const hash = await PasswordService.hashPassword(password);
      
      expect(hash).to.be.a('string');
      expect(hash).to.not.equal(password);
      
      const isValid = await PasswordService.verifyPassword(hash, password);
      expect(isValid).to.be.true;
      
      const isInvalid = await PasswordService.verifyPassword(hash, 'WrongPassword');
      expect(isInvalid).to.be.false;
    });

    it('should validate password strength', () => {
      const weakPassword = 'weak';
      const strongPassword = 'Str0ng!P@ssw0rd';
      
      const weakValidation = PasswordService.validatePasswordStrength(weakPassword);
      expect(weakValidation.valid).to.be.false;
      expect(weakValidation.errors).to.have.length.greaterThan(0);
      
      const strongValidation = PasswordService.validatePasswordStrength(strongPassword);
      expect(strongValidation.valid).to.be.true;
      expect(strongValidation.strength).to.be.greaterThan(70);
    });

    it('should detect common passwords', () => {
      const commonPassword = 'password123';
      const validation = PasswordService.validatePasswordStrength(commonPassword);
      
      expect(validation.valid).to.be.false;
      expect(validation.errors).to.include('Password is too common');
    });

    it('should generate secure passwords', () => {
      const password = PasswordService.generateSecurePassword(16);
      
      expect(password).to.have.length(16);
      expect(/[A-Z]/.test(password)).to.be.true;
      expect(/[a-z]/.test(password)).to.be.true;
      expect(/[0-9]/.test(password)).to.be.true;
      expect(/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)).to.be.true;
    });
  });

  describe('TwoFactorAuthService', () => {
    it('should generate a valid secret', () => {
      const result = TwoFactorAuthService.generateSecret('test@example.com');
      
      expect(result).to.have.property('secret');
      expect(result).to.have.property('otpauthUrl');
      expect(result.secret).to.be.a('string');
      expect(result.secret.length).to.be.greaterThan(0);
    });

    it('should generate backup codes', () => {
      const codes = TwoFactorAuthService.generateBackupCodes(10);
      
      expect(codes).to.have.length(10);
      codes.forEach(code => {
        expect(code).to.match(/^[A-F0-9]{4}-[A-F0-9]{4}$/);
      });
    });

    it('should encrypt and verify backup codes', () => {
      const codes = ['ABCD-1234', 'EFGH-5678'];
      const encrypted = TwoFactorAuthService.encryptBackupCodes(codes);
      
      expect(encrypted).to.have.length(2);
      expect(encrypted[0]).to.have.property('code');
      expect(encrypted[0]).to.have.property('iv');
      expect(encrypted[0]).to.have.property('authTag');
      expect(encrypted[0]).to.have.property('used');
      expect(encrypted[0].used).to.be.false;
      
      // Verify first code
      const isValid = TwoFactorAuthService.verifyBackupCode(encrypted, 'ABCD-1234');
      expect(isValid).to.be.true;
      expect(encrypted[0].used).to.be.true;
      
      // Try to verify again (should fail as it's used)
      const isValidAgain = TwoFactorAuthService.verifyBackupCode(encrypted, 'ABCD-1234');
      expect(isValidAgain).to.be.false;
      
      // Verify second code
      const isValid2 = TwoFactorAuthService.verifyBackupCode(encrypted, 'EFGH-5678');
      expect(isValid2).to.be.true;
    });
  });

  describe('EncryptionService', () => {
    it('should encrypt and decrypt data', () => {
      const plaintext = 'Sensitive Information';
      const encrypted = EncryptionService.encrypt(plaintext);
      
      expect(encrypted).to.have.property('encryptedData');
      expect(encrypted).to.have.property('iv');
      expect(encrypted).to.have.property('authTag');
      expect(encrypted.encryptedData).to.not.equal(plaintext);
      
      const decrypted = EncryptionService.decrypt(encrypted);
      expect(decrypted).to.equal(plaintext);
    });

    it('should mask account numbers', () => {
      const accountNumber = '1234567890';
      const masked = EncryptionService.maskAccountNumber(accountNumber);
      
      expect(masked).to.equal('****7890');
    });

    it('should mask email addresses', () => {
      const email = 'john.doe@example.com';
      const masked = EncryptionService.maskEmail(email);
      
      expect(masked).to.match(/^j\*\*\*e@example\.com$/);
    });

    it('should mask phone numbers', () => {
      const phone = '1234567890';
      const masked = EncryptionService.maskPhone(phone);
      
      expect(masked).to.equal('***-***-7890');
    });

    it('should hash data', () => {
      const data = 'test data';
      const hash1 = EncryptionService.hash(data);
      const hash2 = EncryptionService.hash(data);
      
      expect(hash1).to.equal(hash2); // Same input = same hash
      expect(hash1).to.not.equal(data);
      expect(hash1).to.have.length(64); // SHA-256 produces 64 hex chars
    });
  });

  describe('FraudDetectionService', () => {
    it('should calculate risk score for transactions', () => {
      const mockReq = { ip: '127.0.0.1' };
      
      // Low amount transaction
      const lowRiskTx = { amount: 100 };
      const lowRisk = FraudDetectionService.calculateRiskScore(lowRiskTx, mockReq);
      expect(lowRisk.score).to.be.lessThan(50);
      expect(lowRisk.level).to.equal('low');
      
      // High amount transaction
      const highRiskTx = { amount: 50000 };
      const highRisk = FraudDetectionService.calculateRiskScore(highRiskTx, mockReq);
      expect(highRisk.score).to.be.greaterThan(0);
      expect(highRisk.factors).to.include('high_amount');
    });

    it('should detect velocity violations', () => {
      const mockReq = { ip: '192.168.1.100' };
      const transaction = { amount: 100 };
      
      // Make multiple rapid transactions
      for (let i = 0; i < 12; i++) {
        FraudDetectionService.calculateRiskScore(transaction, mockReq);
      }
      
      const result = FraudDetectionService.calculateRiskScore(transaction, mockReq);
      expect(result.factors).to.include('velocity_check_failed');
      expect(result.score).to.be.greaterThan(20);
    });

    it('should determine risk levels correctly', () => {
      expect(FraudDetectionService.getRiskLevel(30)).to.equal('low');
      expect(FraudDetectionService.getRiskLevel(60)).to.equal('medium');
      expect(FraudDetectionService.getRiskLevel(80)).to.equal('high');
    });

    it('should block high-risk transactions', () => {
      const mockReq = { ip: '127.0.0.1' };
      
      const highRiskAssessment = {
        score: 85,
        level: 'high',
        factors: ['high_amount', 'suspicious_ip'],
      };
      
      const decision = FraudDetectionService.handleRiskyTransaction(highRiskAssessment, mockReq);
      expect(decision.allowed).to.be.false;
      expect(decision.message).to.include('blocked');
    });

    it('should warn on medium-risk transactions', () => {
      const mockReq = { ip: '127.0.0.1' };
      
      const mediumRiskAssessment = {
        score: 60,
        level: 'medium',
        factors: ['unusual_time'],
      };
      
      const decision = FraudDetectionService.handleRiskyTransaction(mediumRiskAssessment, mockReq);
      expect(decision.allowed).to.be.true;
      expect(decision.warning).to.exist;
    });
  });
});
