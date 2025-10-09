/**
 * Validation Utility Functions
 * Provides reusable validation functions
 */

/**
 * Validate email address
 * @param {String} email - Email to validate
 * @returns {Boolean} True if valid
 */
export function isValidEmail(email) {
    if (!email) return false;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate phone number (US format)
 * @param {String} phone - Phone number to validate
 * @returns {Boolean} True if valid
 */
export function isValidPhone(phone) {
    if (!phone) return false;
    
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Check if it's 10 digits (US format)
    return cleaned.length === 10;
}

/**
 * Format phone number to US format
 * @param {String} phone - Phone number to format
 * @returns {String} Formatted phone number
 */
export function formatPhone(phone) {
    if (!phone) return '';
    
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    
    return phone;
}

/**
 * Validate URL
 * @param {String} url - URL to validate
 * @returns {Boolean} True if valid
 */
export function isValidUrl(url) {
    if (!url) return false;
    
    try {
        new URL(url);
        return true;
    } catch (_) {
        return false;
    }
}

/**
 * Validate required field
 * @param {*} value - Value to check
 * @returns {Boolean} True if not empty
 */
export function isRequired(value) {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return true;
}

/**
 * Validate minimum length
 * @param {String} value - String to check
 * @param {Number} minLength - Minimum length
 * @returns {Boolean} True if meets minimum
 */
export function hasMinLength(value, minLength) {
    if (!value) return false;
    return value.length >= minLength;
}

/**
 * Validate maximum length
 * @param {String} value - String to check
 * @param {Number} maxLength - Maximum length
 * @returns {Boolean} True if within maximum
 */
export function hasMaxLength(value, maxLength) {
    if (!value) return true;
    return value.length <= maxLength;
}

/**
 * Validate number range
 * @param {Number} value - Number to check
 * @param {Number} min - Minimum value
 * @param {Number} max - Maximum value
 * @returns {Boolean} True if within range
 */
export function isInRange(value, min, max) {
    if (value === null || value === undefined) return false;
    return value >= min && value <= max;
}

/**
 * Validate that value is a positive number
 * @param {Number} value - Number to check
 * @returns {Boolean} True if positive
 */
export function isPositive(value) {
    return value > 0;
}

/**
 * Validate ZIP code (US format)
 * @param {String} zip - ZIP code to validate
 * @returns {Boolean} True if valid
 */
export function isValidZipCode(zip) {
    if (!zip) return false;
    
    // Accepts 5 digits or 5+4 format
    const zipRegex = /^\d{5}(-\d{4})?$/;
    return zipRegex.test(zip);
}

/**
 * Validate credit card number (basic Luhn algorithm)
 * @param {String} cardNumber - Card number to validate
 * @returns {Boolean} True if valid
 */
export function isValidCreditCard(cardNumber) {
    if (!cardNumber) return false;
    
    const cleaned = cardNumber.replace(/\D/g, '');
    
    if (cleaned.length < 13 || cleaned.length > 19) {
        return false;
    }
    
    let sum = 0;
    let isEven = false;
    
    for (let i = cleaned.length - 1; i >= 0; i--) {
        let digit = parseInt(cleaned.charAt(i), 10);
        
        if (isEven) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }
        
        sum += digit;
        isEven = !isEven;
    }
    
    return sum % 10 === 0;
}

/**
 * Validate password strength
 * @param {String} password - Password to validate
 * @returns {Object} Object with isValid and strength properties
 */
export function validatePassword(password) {
    if (!password) {
        return { isValid: false, strength: 'weak', message: 'Password is required' };
    }
    
    const hasLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const score = [hasLength, hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar]
        .filter(Boolean).length;
    
    let strength = 'weak';
    let message = '';
    
    if (score >= 4) {
        strength = 'strong';
        message = 'Strong password';
    } else if (score === 3) {
        strength = 'medium';
        message = 'Medium strength password';
    } else {
        message = 'Password must be at least 8 characters with upper, lower, number, and special character';
    }
    
    return {
        isValid: score >= 3,
        strength: strength,
        message: message
    };
}