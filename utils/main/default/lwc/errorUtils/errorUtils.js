/**
 * Error Handling Utility Functions
 * Provides reusable error handling functions
 */

/**
 * Extract error message from various error formats
 * @param {*} error - Error object
 * @returns {String} User-friendly error message
 */
export function getErrorMessage(error) {
    // Handle null/undefined
    if (!error) {
        return 'An unknown error occurred';
    }
    
    // Handle string errors
    if (typeof error === 'string') {
        return error;
    }
    
    // Handle Apex errors
    if (error.body) {
        // Handle fieldErrors
        if (error.body.fieldErrors) {
            const fieldErrors = Object.values(error.body.fieldErrors).flat();
            if (fieldErrors.length > 0) {
                return fieldErrors.map(e => e.message).join(', ');
            }
        }
        
        // Handle pageErrors
        if (error.body.pageErrors && error.body.pageErrors.length > 0) {
            return error.body.pageErrors.map(e => e.message).join(', ');
        }
        
        // Handle duplicateResults
        if (error.body.duplicateResults && error.body.duplicateResults.length > 0) {
            return 'Duplicate records found';
        }
        
        // Handle standard error message
        if (error.body.message) {
            return error.body.message;
        }
    }
    
    // Handle DML errors
    if (Array.isArray(error.body)) {
        return error.body.map(e => e.message).join(', ');
    }
    
    // Handle standard Error object
    if (error.message) {
        return error.message;
    }
    
    // Handle statusText
    if (error.statusText) {
        return error.statusText;
    }
    
    // Last resort
    return 'An unknown error occurred';
}

/**
 * Get error stack trace
 * @param {Error} error - Error object
 * @returns {String} Stack trace
 */
export function getErrorStack(error) {
    if (!error) return '';
    return error.stack || '';
}

/**
 * Log error to console with formatting
 * @param {String} context - Context where error occurred
 * @param {*} error - Error object
 */
export function logError(context, error) {
    console.group(`❌ Error in ${context}`);
    console.error('Error Message:', getErrorMessage(error));
    console.error('Full Error:', error);
    console.error('Stack Trace:', getErrorStack(error));
    console.groupEnd();
}

/**
 * Check if error is a specific type
 * @param {*} error - Error object
 * @param {String} errorType - Type to check (e.g., 'FIELD_CUSTOM_VALIDATION_EXCEPTION')
 * @returns {Boolean} True if error matches type
 */
export function isErrorType(error, errorType) {
    if (!error || !error.body) return false;
    
    if (error.body.exceptionType === errorType) return true;
    
    if (error.body.pageErrors) {
        return error.body.pageErrors.some(e => e.statusCode === errorType);
    }
    
    return false;
}

/**
 * Create user-friendly error object
 * @param {*} error - Original error
 * @param {String} defaultMessage - Default message if extraction fails
 * @returns {Object} Formatted error object
 */
export function createErrorObject(error, defaultMessage = 'An error occurred') {
    return {
        message: getErrorMessage(error) || defaultMessage,
        isError: true,
        timestamp: new Date().toISOString(),
        originalError: error
    };
}