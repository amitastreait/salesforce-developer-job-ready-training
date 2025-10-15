import { LightningElement, api } from 'lwc';

/**
 * Wrapper component for lightning-record-picker to work with datatable inline editing
 *
 * This component bridges the gap between lightning-record-picker and the datatable's
 * data-inputable interface by implementing the required methods and event handling.
 */
export default class DatatableLookup extends LightningElement {
    @api label;
    @api placeholder;
    @api objectApiName;
    @api filter;
    @api displayInfo;
    @api matchingInfo;
    @api context;

    // Private property to store value
    _value;

    /**
     * Required by datatable for inline editing
     * Returns the current value
     */
    @api
    get value() {
        return this._value;
    }

    set value(val) {
        this._value = val;
    }

    /**
     * Required by datatable for inline editing
     * This method is called when the datatable needs the current value
     */
    @api
    get validity() {
        const picker = this.template.querySelector('lightning-record-picker');
        return picker ? picker.validity : { valid: true };
    }

    /**
     * Required by datatable for inline editing
     * Called to check if the component is valid
     */
    @api
    checkValidity() {
        const picker = this.template.querySelector('lightning-record-picker');
        return picker ? picker.checkValidity() : true;
    }

    /**
     * Required by datatable for inline editing
     * Called to show validation errors
     */
    @api
    reportValidity() {
        const picker = this.template.querySelector('lightning-record-picker');
        return picker ? picker.reportValidity() : true;
    }

    /**
     * Required by datatable for inline editing
     * Called to set a custom validity message
     */
    @api
    setCustomValidity(message) {
        const picker = this.template.querySelector('lightning-record-picker');
        if (picker) {
            picker.setCustomValidity(message);
        }
    }

    /**
     * Required by datatable for inline editing
     * Called to show the help message for errors
     */
    @api
    showHelpMessageIfInvalid() {
        const picker = this.template.querySelector('lightning-record-picker');
        if (picker) {
            picker.reportValidity();
        }
    }

    /**
     * Required by datatable for inline editing
     * Called to set focus on the component
     */
    @api
    focus() {
        const picker = this.template.querySelector('lightning-record-picker');
        if (picker) {
            picker.focus();
        }
    }

    /**
     * Handle change event from lightning-record-picker
     * Update the internal value and dispatch a change event for the datatable
     */
    handleChange(event) {
        // Get the selected record ID from the event
        this._value = event.detail.recordId;

        // Note: We don't need to dispatch a custom event here
        // The datatable will automatically detect the value change
        // because this component implements the data-inputable interface
    }
}
