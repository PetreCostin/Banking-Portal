const geoip = require('geoip-lite');
const securityConfig = require('../config/security');
const { logSecurityEvent } = require('../middleware/auditLogMiddleware');

/**
 * Fraud Detection Service
 * Implements risk scoring and transaction monitoring
 */

class FraudDetectionService {
  constructor() {
    this.transactionHistory = new Map(); // In production, use Redis or database
    this.suspiciousIPs = new Set();
    
    // Warn if in production mode about in-memory storage
    if (process.env.NODE_ENV === 'production') {
      console.warn('WARNING: FraudDetectionService is using in-memory storage. For production, configure Redis or database backend for persistence across restarts and multi-instance deployments.');
    }
  }

  /**
   * Calculate risk score for a transaction
   */
  calculateRiskScore(transaction, req) {
    let riskScore = 0;
    const factors = [];

    // Factor 1: Transaction amount
    const amount = parseFloat(transaction.amount);
    if (amount > securityConfig.fraudDetection.transactionAmountThreshold) {
      riskScore += 30;
      factors.push('high_amount');
    } else if (amount > 5000) {
      riskScore += 15;
      factors.push('medium_amount');
    }

    // Factor 2: Velocity check (number of transactions in time window)
    const velocityRisk = this.checkVelocity(req.ip);
    riskScore += velocityRisk.score;
    if (velocityRisk.score > 0) {
      factors.push('velocity_check_failed');
    }

    // Factor 3: Geolocation analysis
    const geoRisk = this.checkGeolocation(req.ip);
    riskScore += geoRisk.score;
    if (geoRisk.score > 0) {
      factors.push(geoRisk.reason);
    }

    // Factor 4: Suspicious IP
    if (this.suspiciousIPs.has(req.ip)) {
      riskScore += 40;
      factors.push('suspicious_ip');
    }

    // Factor 5: Time-based pattern (late night transactions are riskier)
    const hour = new Date().getHours();
    if (hour >= 2 && hour <= 5) {
      riskScore += 10;
      factors.push('unusual_time');
    }

    return {
      score: Math.min(riskScore, 100),
      level: this.getRiskLevel(riskScore),
      factors,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Check transaction velocity (number of transactions in time window)
   */
  checkVelocity(ip) {
    const now = Date.now();
    const window = securityConfig.fraudDetection.velocityCheckWindow;
    
    if (!this.transactionHistory.has(ip)) {
      this.transactionHistory.set(ip, []);
    }

    const transactions = this.transactionHistory.get(ip);
    
    // Remove old transactions outside the window
    const recentTransactions = transactions.filter(t => now - t < window);
    this.transactionHistory.set(ip, recentTransactions);

    // Add current transaction
    recentTransactions.push(now);

    const count = recentTransactions.length;
    const maxTransactions = securityConfig.fraudDetection.maxTransactionsPerHour;

    if (count > maxTransactions) {
      return { score: 25, count };
    } else if (count > maxTransactions * 0.7) {
      return { score: 10, count };
    }

    return { score: 0, count };
  }

  /**
   * Check geolocation for suspicious activity
   */
  checkGeolocation(ip) {
    const geo = geoip.lookup(ip);
    
    if (!geo) {
      return { score: 5, reason: 'unknown_location' };
    }

    // Check if country is in blocked list
    if (securityConfig.geolocation.blockedCountries.includes(geo.country)) {
      return { score: 50, reason: 'blocked_country' };
    }

    // Check for known VPN/proxy ranges (simplified check)
    // In production, use a dedicated service like IPQualityScore
    if (this.isKnownVPN(ip)) {
      return { score: 20, reason: 'vpn_detected' };
    }

    return { score: 0, reason: 'normal' };
  }

  /**
   * Simple VPN detection (placeholder for production service)
   */
  isKnownVPN(ip) {
    // In production, integrate with a VPN detection service
    // For now, just return false
    return false;
  }

  /**
   * Determine risk level from score
   */
  getRiskLevel(score) {
    if (score >= securityConfig.fraudDetection.highRiskThreshold) {
      return 'high';
    } else if (score >= securityConfig.fraudDetection.mediumRiskThreshold) {
      return 'medium';
    }
    return 'low';
  }

  /**
   * Flag suspicious IP
   */
  flagSuspiciousIP(ip, reason) {
    this.suspiciousIPs.add(ip);
    logSecurityEvent('suspicious_ip_flagged', 'warn', { ip, reason });
  }

  /**
   * Handle risky transaction
   */
  handleRiskyTransaction(riskAssessment, req) {
    if (riskAssessment.level === 'high') {
      logSecurityEvent('high_risk_transaction_blocked', 'error', {
        ip: req.ip,
        score: riskAssessment.score,
        factors: riskAssessment.factors,
      });
      return {
        allowed: false,
        message: 'Transaction blocked due to security concerns. Please contact support.',
      };
    } else if (riskAssessment.level === 'medium') {
      logSecurityEvent('medium_risk_transaction', 'warn', {
        ip: req.ip,
        score: riskAssessment.score,
        factors: riskAssessment.factors,
      });
      return {
        allowed: true,
        warning: 'Transaction flagged for review.',
      };
    }

    return {
      allowed: true,
    };
  }
}

module.exports = new FraudDetectionService();
