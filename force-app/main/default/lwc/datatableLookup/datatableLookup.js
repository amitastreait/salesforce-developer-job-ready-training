import { LightningElement, api } from 'lwc';

/**
 * Wrapper component for lightning-record-picker to work with datatable inline editing
 */
export default class DatatableLookup extends LightningElement {
    @api label;
    @api placeholder;
    @api objectApiName;
    @api filter;
    @api displayInfo;
    @api matchingInfo;

    _value;
    _required = false;

    @api
    get value() {
        return this._value;
    }

    set value(val) {
        this._value = val;
    }

    @api
    get required() {
        return this._required;
    }

    set required(val) {
        this._required = val;
    }

    @api
    get validity() {
        if (this._required && !this._value) {
            return { valid: false };
        }
        return { valid: true };
    }

    @api
    checkValidity() {
        if (this._required && !this._value) {
            return false;
        }
        return true;
    }

    @api
    reportValidity() {
        return this.checkValidity();
    }

    @api
    setCustomValidity() {
        // Not implemented for record picker
    }

    @api
    showHelpMessageIfInvalid() {
        // Not implemented for record picker
    }

    @api
    focus() {
        const picker = this.template.querySelector('lightning-record-picker');
        if (picker) {
            picker.focus();
        }
    }

    handleChange(event) {
        this._value = event.detail.recordId;

        // Get record info which contains the record name
        const recordInfo = event.detail.recordInfo;
        console.log('Lookup changed - ID:', this._value);
        console.log('Record Info:', recordInfo);

        // this will not work
        if (recordInfo) {
            this.dispatchEvent(
                new CustomEvent('lookupselected', {
                    bubbles: true,
                    composed: true,
                    detail: {
                        recordId: this._value,
                        recordName: recordInfo.nameFields[0]?.value || recordInfo.primaryField || '',
                        recordInfo: recordInfo
                    }
                })
            );
        }
    }
}
