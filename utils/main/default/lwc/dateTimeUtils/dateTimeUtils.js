/**
 * Date and Time Utility Functions
 * Provides reusable date formatting and manipulation functions
 */

/**
 * Format a date to a readable string
 * @param {Date|String} date - Date object or ISO string
 * @param {String} format - Format type: 'short', 'long', 'full'
 * @returns {String} Formatted date string
 */
export function formatDate(date, format = 'short') {
    if (!date) return '';
    
    const dateObj = date instanceof Date ? date : new Date(date);
    
    const options = {
        short: { year: 'numeric', month: '2-digit', day: '2-digit' },
        long: { year: 'numeric', month: 'long', day: 'numeric' },
        full: { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        }
    };
    
    return new Intl.DateTimeFormat('en-US', options[format]).format(dateObj);
}

/**
 * Format a date with time
 * @param {Date|String} date - Date object or ISO string
 * @returns {String} Formatted date and time string
 */
export function formatDateTime(date) {
    if (!date) return '';
    
    const dateObj = date instanceof Date ? date : new Date(date);
    
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(dateObj);
}

/**
 * Get relative time string (e.g., "2 hours ago")
 * @param {Date|String} date - Date object or ISO string
 * @returns {String} Relative time string
 */
export function getRelativeTime(date) {
    if (!date) return '';
    
    const dateObj = date instanceof Date ? date : new Date(date);
    const now = new Date();
    const diffInSeconds = Math.floor((now - dateObj) / 1000);
    
    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60,
        second: 1
    };
    
    for (const [unit, seconds] of Object.entries(intervals)) {
        const interval = Math.floor(diffInSeconds / seconds);
        if (interval >= 1) {
            return interval === 1 
                ? `1 ${unit} ago` 
                : `${interval} ${unit}s ago`;
        }
    }
    
    return 'just now';
}

/**
 * Check if a date is today
 * @param {Date|String} date - Date to check
 * @returns {Boolean} True if date is today
 */
export function isToday(date) {
    if (!date) return false;
    
    const dateObj = date instanceof Date ? date : new Date(date);
    const today = new Date();
    
    return dateObj.toDateString() === today.toDateString();
}

/**
 * Add days to a date
 * @param {Date|String} date - Starting date
 * @param {Number} days - Number of days to add
 * @returns {Date} New date object
 */
export function addDays(date, days) {
    const dateObj = date instanceof Date ? date : new Date(date);
    const result = new Date(dateObj);
    result.setDate(result.getDate() + days);
    return result;
}

/**
 * Get date range
 * @param {String} range - Range type: 'today', 'week', 'month', 'year'
 * @returns {Object} Object with startDate and endDate
 */
export function getDateRange(range) {
    const today = new Date();
    const startDate = new Date(today);
    const endDate = new Date(today);
    
    switch(range) {
        case 'today':
            break;
        case 'week':
            startDate.setDate(today.getDate() - 7);
            break;
        case 'month':
            startDate.setMonth(today.getMonth() - 1);
            break;
        case 'year':
            startDate.setFullYear(today.getFullYear() - 1);
            break;
        default:
            break;
    }
    
    return {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
    };
}

/**
 * Format ISO date to input date format (YYYY-MM-DD)
 * @param {Date|String} date - Date to format
 * @returns {String} Date in YYYY-MM-DD format
 */
export function toInputDate(date) {
    if (!date) return '';
    
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toISOString().split('T')[0];
}