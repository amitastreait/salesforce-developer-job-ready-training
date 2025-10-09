/**
 * Toast Notification Utility Functions
 * Reusable functions for showing toast messages
 */

import { ShowToastEvent } from 'lightning/platformShowToastEvent';

/**
 * Show success toast
 * @param {Object} component - Component instance
 * @param {String} title - Toast title
 * @param {String} message - Toast message
 * @param {String} mode - Toast mode (dismissable, pester, sticky)
 */
export function showSuccessToast(component, title, message, mode = 'dismissable') {
    showToast(component, title, message, 'success', mode);
}

/**
 * Show error toast
 * @param {Object} component - Component instance
 * @param {String} title - Toast title
 * @param {String} message - Toast message
 * @param {String} mode - Toast mode
 */
export function showErrorToast(component, title, message, mode = 'sticky') {
    showToast(component, title, message, 'error', mode);
}

/**
 * Show warning toast
 * @param {Object} component - Component instance
 * @param {String} title - Toast title
 * @param {String} message - Toast message
 * @param {String} mode - Toast mode
 */
export function showWarningToast(component, title, message, mode = 'dismissable') {
    showToast(component, title, message, 'warning', mode);
}

/**
 * Show info toast
 * @param {Object} component - Component instance
 * @param {String} title - Toast title
 * @param {String} message - Toast message
 * @param {String} mode - Toast mode
 */
export function showInfoToast(component, title, message, mode = 'dismissable') {
    showToast(component, title, message, 'info', mode);
}

/**
 * Generic toast function
 * @param {Object} component - Component instance
 * @param {String} title - Toast title
 * @param {String} message - Toast message
 * @param {String} variant - Toast variant (success, error, warning, info)
 * @param {String} mode - Toast mode (dismissable, pester, sticky)
 */
export function showToast(component, title, message, variant, mode = 'dismissable') {
    const event = new ShowToastEvent({
        title: title,
        message: message,
        variant: variant,
        mode: mode
    });
    component.dispatchEvent(event);
}

/**
 * Show toast with link
 * @param {Object} component - Component instance
 * @param {String} title - Toast title
 * @param {String} message - Toast message
 * @param {String} variant - Toast variant
 * @param {String} linkLabel - Link label
 * @param {String} linkUrl - Link URL or recordId
 */
export function showToastWithLink(component, title, message, variant, linkLabel, linkUrl) {
    const event = new ShowToastEvent({
        title: title,
        message: message,
        variant: variant,
        mode: 'dismissable',
        messageData: [
            {
                url: linkUrl.startsWith('/') ? linkUrl : `/${linkUrl}`,
                label: linkLabel
            }
        ]
    });
    component.dispatchEvent(event);
}

/**
 * Show record saved toast with link to record
 * @param {Object} component - Component instance
 * @param {String} recordId - Record Id
 * @param {String} objectLabel - Object label (e.g., 'Property', 'Contact')
 */
export function showRecordSavedToast(component, recordId, objectLabel = 'Record') {
    showToastWithLink(
        component,
        'Success',
        `${objectLabel} saved successfully. {0}`,
        'success',
        'View Record',
        recordId
    );
}

/**
 * Show record created toast with navigation
 * @param {Object} component - Component instance
 * @param {String} recordId - Record Id
 * @param {String} objectLabel - Object label
 */
export function showRecordCreatedToast(component, recordId, objectLabel = 'Record') {
    showToastWithLink(
        component,
        'Success',
        `${objectLabel} created successfully. {0}`,
        'success',
        'View Record',
        recordId
    );
}

/**
 * Show record deleted toast
 * @param {Object} component - Component instance
 * @param {String} objectLabel - Object label
 */
export function showRecordDeletedToast(component, objectLabel = 'Record') {
    showSuccessToast(
        component,
        'Success',
        `${objectLabel} deleted successfully`
    );
}

/**
 * Show validation error toast
 * @param {Object} component - Component instance
 * @param {String} message - Error message
 */
export function showValidationErrorToast(component, message = 'Please complete all required fields') {
    showErrorToast(
        component,
        'Validation Error',
        message
    );
}

/**
 * Show loading toast (info variant, auto-dismissable)
 * @param {Object} component - Component instance
 * @param {String} message - Loading message
 */
export function showLoadingToast(component, message = 'Processing...') {
    showToast(
        component,
        'Please Wait',
        message,
        'info',
        'dismissable'
    );
}

/**
 * Show custom toast with all options
 * @param {Object} component - Component instance
 * @param {Object} options - Toast options
 */
export function showCustomToast(component, options) {
    const {
        title = '',
        message = '',
        variant = 'info',
        mode = 'dismissable',
        messageData = null
    } = options;
    
    const toastOptions = {
        title: title,
        message: message,
        variant: variant,
        mode: mode
    };
    
    if (messageData) {
        toastOptions.messageData = messageData;
    }
    
    const event = new ShowToastEvent(toastOptions);
    component.dispatchEvent(event);
}

/**
 * Show multiple errors as toast
 * @param {Object} component - Component instance
 * @param {Array} errors - Array of error messages
 */
export function showMultipleErrorsToast(component, errors) {
    const errorMessage = errors.join('\n• ');
    showErrorToast(
        component,
        'Multiple Errors Occurred',
        '• ' + errorMessage
    );
}