/**
 * Security Improvements for Login
 * 
 * This file contains security enhancements that should be implemented.
 * Some require backend changes, others can be implemented immediately.
 */

// 1. Clear sensitive data from memory after use
function clearSensitiveData(formData) {
  if (formData.password) {
    formData.password = null;
    delete formData.password;
  }
}

// 2. Sanitize input to prevent XSS
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

// 3. Validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// 4. Check password strength (client-side validation)
function checkPasswordStrength(password) {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const strength = {
    length: password.length >= minLength,
    hasUpperCase,
    hasLowerCase,
    hasNumbers,
    hasSpecialChar
  };
  
  const score = Object.values(strength).filter(Boolean).length;
  const levels = ['weak', 'fair', 'good', 'strong', 'very-strong'];
  
  return {
    ...strength,
    score,
    level: levels[Math.min(score - 1, levels.length - 1)] || 'weak',
    isValid: score >= 3 && strength.length
  };
}

// 5. Rate limiting helper (client-side - backend should also implement)
let loginAttempts = 0;
let lastAttemptTime = 0;
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

function checkRateLimit() {
  const now = Date.now();
  
  // Reset attempts if lockout period has passed
  if (now - lastAttemptTime > LOCKOUT_DURATION) {
    loginAttempts = 0;
  }
  
  if (loginAttempts >= MAX_ATTEMPTS) {
    const remainingTime = Math.ceil((LOCKOUT_DURATION - (now - lastAttemptTime)) / 1000 / 60);
    throw new Error(`Too many login attempts. Please try again in ${remainingTime} minutes.`);
  }
  
  loginAttempts++;
  lastAttemptTime = now;
}

function resetRateLimit() {
  loginAttempts = 0;
  lastAttemptTime = 0;
}

// 6. Secure token storage with expiration check
function storeTokenSecurely(token, rememberMe = false) {
  const storage = rememberMe ? localStorage : sessionStorage;
  const tokenData = {
    token: token,
    expiresAt: Date.now() + (60 * 60 * 1000) // 1 hour default
  };
  storage.setItem('authToken', JSON.stringify(tokenData));
}

function getTokenSecurely() {
  const tokenData = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
  if (!tokenData) return null;
  
  try {
    const parsed = JSON.parse(tokenData);
    // Check if token is expired
    if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
      clearAuthData();
      return null;
    }
    return parsed.token;
  } catch (e) {
    // Fallback for old format
    return tokenData;
  }
}

function clearAuthData() {
  sessionStorage.removeItem('authToken');
  sessionStorage.removeItem('userEmail');
  sessionStorage.removeItem('userType');
  sessionStorage.removeItem('userProducts');
  localStorage.removeItem('authToken');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userType');
  localStorage.removeItem('userProducts');
}

// 7. Validate HTTPS connection
function ensureHTTPS(url) {
  if (url.startsWith('http://') && !url.includes('localhost') && !url.includes('127.0.0.1')) {
    console.warn('SECURITY WARNING: Using HTTP instead of HTTPS for API calls. This is insecure!');
    // In production, you might want to throw an error:
    // throw new Error('HTTPS required for API calls');
  }
  return url;
}

// 8. Add request ID for tracking (without exposing sensitive data)
function generateRequestId() {
  return 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Export functions for use in other files
if (typeof window !== 'undefined') {
  window.SecurityHelpers = {
    clearSensitiveData,
    sanitizeInput,
    isValidEmail,
    checkPasswordStrength,
    checkRateLimit,
    resetRateLimit,
    storeTokenSecurely,
    getTokenSecurely,
    clearAuthData,
    ensureHTTPS,
    generateRequestId
  };
}

