export const generateAccountNumber = (): string => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${timestamp}${random}`;
};

export const generateCardNumber = (): string => {
  const bin = '4000'; // Mock BIN for testing
  const account = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
  const lastDigit = Math.floor(Math.random() * 10);
  return `${bin}${account}${lastDigit}`;
};

export const generateCVV = (): string => {
  // Note: CVV should never be stored. This is for display/testing only.
  return Math.floor(Math.random() * 1000).toString().padStart(3, '0');
};

export const generateTransactionReference = (): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return `TXN${timestamp}${random}`;
};

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone);
};
