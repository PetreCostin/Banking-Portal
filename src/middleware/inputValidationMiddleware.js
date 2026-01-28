const { body, validationResult } = require('express-validator');
const validator = require('validator');

/**
 * Input Validation Middleware
 * Sanitizes and validates user inputs to prevent injection attacks
 */

// Validation rules for transfer
const validateTransfer = [
  body('from')
    .trim()
    .notEmpty()
    .withMessage('From account is required')
    .isIn(['savings', 'checking'])
    .withMessage('Invalid from account'),
  body('to')
    .trim()
    .notEmpty()
    .withMessage('To account is required')
    .isIn(['savings', 'checking'])
    .withMessage('Invalid to account'),
  body('amount')
    .trim()
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0.01, max: 1000000 })
    .withMessage('Amount must be a positive number and less than 1,000,000'),
  body('from').custom((value, { req }) => {
    if (value === req.body.to) {
      throw new Error('Cannot transfer to the same account');
    }
    return true;
  }),
];

// Validation rules for payment
const validatePayment = [
  body('amount')
    .trim()
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0.01, max: 100000 })
    .withMessage('Amount must be a positive number and less than 100,000'),
];

// Generic validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render('error', {
      errors: errors.array(),
      message: 'Validation failed'
    });
  }
  next();
};

// Sanitize inputs for display/storage (NOT for password verification)
// Note: This should be applied selectively, not to password fields
const sanitizeInputs = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      // Skip password fields to avoid breaking authentication
      if (key.toLowerCase().includes('password')) {
        return;
      }
      if (typeof req.body[key] === 'string') {
        req.body[key] = validator.escape(req.body[key]);
      }
    });
  }
  next();
};

module.exports = {
  validateTransfer,
  validatePayment,
  handleValidationErrors,
  sanitizeInputs,
};
