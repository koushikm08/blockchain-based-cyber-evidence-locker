// Enterprise-level validation utilities

// List of blocked free email domains
const BLOCKED_DOMAINS = [
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
  'aol.com', 'mail.com', 'protonmail.com', 'icloud.com',
  'yandex.com', '163.com', 'qq.com', 'foxmail.com',
  'test.com', 'example.com', 'temp-mail.org', 'guerrillamail.com'
];

// Allowed enterprise domains (whitelisted)
const ALLOWED_DOMAINS = [
  '.gov', '.edu', '.mil', '.ac.uk', '.org'
];

/**
 * Validate email - must be valid format (accepts any email domain)
 * @param {string} email
 * @returns {object} { valid: boolean, message: string }
 */
exports.validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { valid: false, message: 'Email is required' };
  }

  const trimmedEmail = email.trim().toLowerCase();

  // Check for @ symbol
  if (!trimmedEmail.includes('@')) {
    return { valid: false, message: 'Email must contain @ symbol' };
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return { valid: false, message: 'Invalid email format' };
  }

  const parts = trimmedEmail.split('@');
  if (parts.length !== 2) {
    return { valid: false, message: 'Invalid email format' };
  }

  const [username, domain] = parts;

  // Check username and domain parts
  if (!username || username.length < 1) {
    return { valid: false, message: 'Email username is required' };
  }

  if (!domain || domain.length < 1) {
    return { valid: false, message: 'Email domain is required' };
  }

  return { valid: true, message: '' };
};

/**
 * Validate full name
 * @param {string} fullName
 * @returns {object} { valid: boolean, message: string }
 */
exports.validateFullName = (fullName) => {
  if (!fullName || typeof fullName !== 'string') {
    return { valid: false, message: 'Full name is required' };
  }

  const trimmedName = fullName.trim();

  if (trimmedName.length < 3) {
    return { valid: false, message: 'Full name must be at least 3 characters' };
  }

  if (trimmedName.length > 100) {
    return { valid: false, message: 'Full name must not exceed 100 characters' };
  }

  // Only allow letters, spaces, hyphens, and apostrophes
  const nameRegex = /^[a-zA-Z\s\-']+$/;
  if (!nameRegex.test(trimmedName)) {
    return { 
      valid: false, 
      message: 'Full name can only contain letters, spaces, hyphens, and apostrophes' 
    };
  }

  // Check for at least two parts (first and last name)
  const nameParts = trimmedName.trim().split(/\s+/);
  if (nameParts.length < 2) {
    return { valid: false, message: 'Please provide both first and last name' };
  }

  return { valid: true, message: '' };
};

/**
 * Validate organization name
 * @param {string} organization
 * @returns {object} { valid: boolean, message: string }
 */
exports.validateOrganization = (organization) => {
  if (!organization || typeof organization !== 'string') {
    return { valid: false, message: 'Organization is required' };
  }

  const trimmedOrg = organization.trim();

  if (trimmedOrg.length < 3) {
    return { valid: false, message: 'Organization name must be at least 3 characters' };
  }

  if (trimmedOrg.length > 100) {
    return { valid: false, message: 'Organization name must not exceed 100 characters' };
  }

  // Allow letters, numbers, spaces, hyphens, and common special chars
  const orgRegex = /^[a-zA-Z0-9\s\-.,&()]+$/;
  if (!orgRegex.test(trimmedOrg)) {
    return { 
      valid: false, 
      message: 'Organization name contains invalid characters' 
    };
  }

  // Should not be generic/placeholder
  const genericNames = ['test', 'random', 'abc', 'xyz', 'demo', 'sample'];
  if (genericNames.includes(trimmedOrg.toLowerCase())) {
    return { 
      valid: false, 
      message: 'Please provide a valid organization name' 
    };
  }

  return { valid: true, message: '' };
};

/**
 * Validate password strength (enterprise level)
 * @param {string} password
 * @returns {object} { valid: boolean, message: string, strength: string }
 */
exports.validatePasswordStrength = (password) => {
  if (!password) {
    return { valid: false, message: 'Password is required', strength: 'none' };
  }

  let strength = 'weak';
  const errors = [];

  // Check length
  if (password.length < 8) {
    errors.push('At least 8 characters');
  } else if (password.length >= 12) {
    strength = 'strong';
  }

  // Check for lowercase
  if (!/[a-z]/.test(password)) {
    errors.push('At least one lowercase letter');
  }

  // Check for uppercase
  if (!/[A-Z]/.test(password)) {
    errors.push('At least one uppercase letter');
  }

  // Check for numbers
  if (!/[0-9]/.test(password)) {
    errors.push('At least one number');
  }

  // Check for special characters
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('At least one special character (!@#$%^&*...)');
  }

  if (password.length >= 12 && errors.length === 0) {
    strength = 'strong';
  } else if (errors.length === 0) {
    strength = 'medium';
  }

  if (errors.length > 0) {
    return { 
      valid: false, 
      message: 'Password must contain: ' + errors.join(', '),
      strength: strength,
      errors: errors
    };
  }

  return { valid: true, message: '', strength: strength };
};

/**
 * Validate that password doesn't contain email or name
 * @param {string} password
 * @param {string} email
 * @param {string} fullName
 * @returns {object} { valid: boolean, message: string }
 */
exports.validatePasswordContent = (password, email, fullName) => {
  const emailUsername = email.split('@')[0].toLowerCase();
  const passwordLower = password.toLowerCase();

  if (passwordLower.includes(emailUsername)) {
    return { 
      valid: false, 
      message: 'Password cannot contain your email username' 
    };
  }

  const nameParts = fullName.toLowerCase().split(/\s+/);
  for (let part of nameParts) {
    if (part.length > 2 && passwordLower.includes(part)) {
      return { 
        valid: false, 
        message: 'Password cannot contain parts of your name' 
      };
    }
  }

  return { valid: true, message: '' };
};

/**
 * Get password strength score (0-100)
 * @param {string} password
 * @returns {number}
 */
exports.getPasswordStrengthScore = (password) => {
  let score = 0;

  if (!password) return score;

  // Length scoring
  if (password.length >= 8) score += 10;
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;

  // Character variety scoring
  if (/[a-z]/.test(password)) score += 15;
  if (/[A-Z]/.test(password)) score += 15;
  if (/[0-9]/.test(password)) score += 15;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 20;

  return Math.min(score, 100);
};

module.exports = exports;
