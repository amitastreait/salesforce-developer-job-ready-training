/**
 * Formatting Utility Functions
 * Provides reusable formatting functions
 */

/**
 * Format currency
 * @param {Number} value - Amount to format
 * @param {String} currency - Currency code (default: USD)
 * @returns {String} Formatted currency string
 */
export function formatCurrency(value, currency = 'USD') {
    if (value === null || value === undefined) return '$0.00';
    
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(value);
}

/**
 * Format number with thousand separators
 * @param {Number} value - Number to format
 * @param {Number} decimals - Number of decimal places
 * @returns {String} Formatted number string
 */
export function formatNumber(value, decimals = 0) {
    if (value === null || value === undefined) return '0';
    
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(value);
}

/**
 * Format percentage
 * @param {Number} value - Value to format (e.g., 0.25 for 25%)
 * @param {Number} decimals - Number of decimal places
 * @returns {String} Formatted percentage string
 */
export function formatPercentage(value, decimals = 0) {
    if (value === null || value === undefined) return '0%';
    
    return new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(value);
}

/**
 * Format file size
 * @param {Number} bytes - File size in bytes
 * @returns {String} Formatted file size
 */
export function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Truncate text with ellipsis
 * @param {String} text - Text to truncate
 * @param {Number} maxLength - Maximum length
 * @returns {String} Truncated text
 */
export function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    
    return text.substring(0, maxLength - 3) + '...';
}

/**
 * Capitalize first letter of each word
 * @param {String} text - Text to capitalize
 * @returns {String} Capitalized text
 */
export function capitalizeWords(text) {
    if (!text) return '';
    
    return text.replace(/\b\w/g, char => char.toUpperCase());
}

/**
 * Convert to title case
 * @param {String} text - Text to convert
 * @returns {String} Title case text
 */
export function toTitleCase(text) {
    if (!text) return '';
    
    return text.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
}

/**
 * Format name (First Last)
 * @param {String} firstName - First name
 * @param {String} lastName - Last name
 * @returns {String} Full name
 */
export function formatFullName(firstName, lastName) {
    const parts = [firstName, lastName].filter(Boolean);
    return parts.join(' ');
}

/**
 * Format initials
 * @param {String} firstName - First name
 * @param {String} lastName - Last name
 * @returns {String} Initials
 */
export function getInitials(firstName, lastName) {
    const first = firstName ? firstName.charAt(0).toUpperCase() : '';
    const last = lastName ? lastName.charAt(0).toUpperCase() : '';
    return first + last;
}

/**
 * Format address
 * @param {Object} address - Address object
 * @returns {String} Formatted address
 */
export function formatAddress(address) {
    if (!address) return '';
    
    const parts = [
        address.street,
        address.city,
        [address.state, address.zipCode].filter(Boolean).join(' '),
        address.country
    ].filter(Boolean);
    
    return parts.join(', ');
}

/**
 * Convert string to slug (URL-friendly)
 * @param {String} text - Text to convert
 * @returns {String} Slug
 */
export function toSlug(text) {
    if (!text) return '';
    
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/**
 * Mask sensitive data (e.g., credit card, SSN)
 * @param {String} value - Value to mask
 * @param {Number} visibleChars - Number of visible characters at end
 * @returns {String} Masked value
 */
export function maskSensitiveData(value, visibleChars = 4) {
    if (!value) return '';
    if (value.length <= visibleChars) return value;
    
    const masked = '*'.repeat(value.length - visibleChars);
    const visible = value.slice(-visibleChars);
    
    return masked + visible;
}