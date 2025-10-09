/**
 * Apex Utility Functions
 * Reusable functions for calling Apex methods
 */

import { ShowToastEvent } from 'lightning/platformShowToastEvent';

/**
 * Execute Apex method with error handling
 * @param {Function} apexMethod - Imported Apex method
 * @param {Object} params - Parameters for the Apex method
 * @param {Object} options - Options for error handling
 * @returns {Promise} Result from Apex
 */
export async function executeApex(apexMethod, params = {}, options = {}) {
    const {
        showErrorToast = true,
        errorTitle = 'Error',
        logError = true
    } = options;

    try {
        const result = await apexMethod(params);
        return result;
    } catch (error) {
        if (logError) {
            console.error('Apex Error:', error);
        }
        if (showErrorToast) {
            const errorMessage = getApexErrorMessage(error);
            dispatchToast(errorTitle, errorMessage, 'error');
        }
        
        throw error;
    }
}

/**
 * Execute Apex method with loading state management
 * @param {Function} apexMethod - Imported Apex method
 * @param {Object} params - Parameters for the Apex method
 * @param {Object} component - Component instance (this)
 * @param {String} loadingProperty - Name of the loading property
 * @returns {Promise} Result from Apex
 */
export async function executeApexWithLoading(apexMethod, params, component, loadingProperty = 'isLoading') {
    component[loadingProperty] = true;
    
    try {
        const result = await apexMethod(params);
        return result;
    } catch (error) {
        const errorMessage = getApexErrorMessage(error);
        dispatchToast('Error', errorMessage, 'error', component);
        throw error;
    } finally {
        component[loadingProperty] = false;
    }
}

/**
 * Execute multiple Apex calls in parallel
 * @param {Array} apexCalls - Array of {method, params} objects
 * @returns {Promise<Array>} Array of results
 */
export async function executeApexBatch(apexCalls) {
    const promises = apexCalls.map(({ method, params }) => 
        executeApex(method, params, { showErrorToast: false })
    );
    try {
        const results = await Promise.all(promises);
        return results;
    } catch (error) {
        console.error('Batch Apex Error:', error);
        throw error;
    }
}

/**
 * Execute Apex with retry logic
 * @param {Function} apexMethod - Imported Apex method
 * @param {Object} params - Parameters
 * @param {Number} maxRetries - Maximum retry attempts
 * @returns {Promise} Result from Apex
 */
export async function executeApexWithRetry(apexMethod, params, maxRetries = 3) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const result = await apexMethod(params);
            return result;
        } catch (error) {
            lastError = error;
            console.warn(`Apex call attempt ${attempt} failed:`, error);
            
            if (attempt < maxRetries) {
                // Wait before retrying (exponential backoff)
                await new Promise(resolve => 
                    setTimeout(resolve, Math.pow(2, attempt) * 1000)
                );
            }
        }
    }
    
    throw lastError;
}

/**
 * Extract user-friendly error message from Apex error
 * @param {Object} error - Error object from Apex
 * @returns {String} Error message
 */
export function getApexErrorMessage(error) {
    if (!error) {
        return 'An unknown error occurred';
    }
    
    // Handle string errors
    if (typeof error === 'string') {
        return error;
    }
    
    // Handle Apex errors
    if (error.body) {
        // Handle field errors
        if (error.body.fieldErrors) {
            const fieldErrors = Object.values(error.body.fieldErrors).flat();
            if (fieldErrors.length > 0) {
                return fieldErrors.map(e => e.message).join(', ');
            }
        }
        
        // Handle page errors
        if (error.body.pageErrors && error.body.pageErrors.length > 0) {
            return error.body.pageErrors.map(e => e.message).join(', ');
        }
        
        // Handle duplicate results
        if (error.body.duplicateResults && error.body.duplicateResults.length > 0) {
            return 'Duplicate records found';
        }
        
        // Handle standard message
        if (error.body.message) {
            return error.body.message;
        }
        
        // Handle enhanced errors
        if (error.body.enhancedErrorType) {
            return error.body.output?.errors?.[0]?.message || error.body.message || 'An error occurred';
        }
    }
    
    // Handle array errors
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
    
    return 'An unknown error occurred';
}

/**
 * Check if error is a specific type
 * @param {Object} error - Error object
 * @param {String} errorType - Error type to check
 * @returns {Boolean} True if error matches type
 */
export function isApexErrorType(error, errorType) {
    if (!error || !error.body) {
        return false;
    }
    
    if (error.body.exceptionType === errorType) {
        return true;
    }
    
    if (error.body.pageErrors) {
        return error.body.pageErrors.some(e => e.statusCode === errorType);
    }
    
    return false;
}

/**
 * Dispatch toast event
 * @param {String} title - Toast title
 * @param {String} message - Toast message
 * @param {String} variant - Toast variant (success, error, warning, info)
 * @param {Object} component - Component instance (optional)
 */
export function dispatchToast(title, message, variant, component = null) {
    const event = new ShowToastEvent({
        title: title,
        message: message,
        variant: variant
    });
    
    if (component) {
        component.dispatchEvent(event);
    } else {
        // For use in utility functions without component context
        const toastEvent = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        
        if (typeof window !== 'undefined') {
            window.dispatchEvent(toastEvent);
        }
    }
}

/**
 * Create cacheable Apex call wrapper
 * @param {Function} apexMethod - Apex method to cache
 * @param {Object} params - Parameters
 * @param {Number} cacheDuration - Cache duration in milliseconds
 * @returns {Promise} Result from Apex or cache
 */
const apexCache = new Map();

export async function executeApexCached(apexMethod, params, cacheDuration = 300000) {
    const cacheKey = JSON.stringify({ method: apexMethod.name, params });
    const cachedResult = apexCache.get(cacheKey);
    
    if (cachedResult && Date.now() - cachedResult.timestamp < cacheDuration) {
        return cachedResult.data;
    }
    
    try {
        const result = await apexMethod(params);
        apexCache.set(cacheKey, {
            data: result,
            timestamp: Date.now()
        });
        return result;
    } catch (error) {
        throw error;
    }
}

/**
 * Clear Apex cache
 * @param {String} methodName - Optional method name to clear specific cache
 */
export function clearApexCache(methodName = null) {
    if (methodName) {
        for (const key of apexCache.keys()) {
            if (key.includes(methodName)) {
                apexCache.delete(key);
            }
        }
    } else {
        apexCache.clear();
    }
}