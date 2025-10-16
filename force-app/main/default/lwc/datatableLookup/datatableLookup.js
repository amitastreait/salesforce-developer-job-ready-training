import { LightningElement, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';

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
    @api context;
    @api displayValue; // This will hold the current display value (record name)
    @api nameField; // The field to fetch for the record name (e.g., 'Name')

    _value;
    _required = false;
    recordId; // Reactive property for @wire

    @api
    get value() {
        return this._value;
    }

    set value(val) {
        this._value = val;
        this.recordId = val; // Update recordId for @wire
    }

    // Wire adapter to fetch record when recordId changes
    @wire(getRecord, {
        recordId: '$recordId',
        fields: '$fieldsToFetch'
    })
    wiredRecord({ error, data }) {
        if (data) {
            const fieldApiName = this.nameField || 'Name';
            const recordName = data.fields[fieldApiName]?.value || '';
            // console.log('Wire fetched record name:', recordName);

            // Dispatch event with the fetched record name
            if (this.recordId) {
                this.dispatchEvent(
                    new CustomEvent('lookupselected', {
                        bubbles: true,
                        composed: true,
                        detail: {
                            recordId: this.recordId,
                            recordName: recordName,
                            context: this.context,
                            objectApiName: this.objectApiName
                        }
                    })
                );
            }
        } else if (error) {
            console.error('Wire error fetching record:', error);

            // Dispatch event with fallback
            if (this.recordId) {
                this.dispatchEvent(
                    new CustomEvent('lookupselected', {
                        bubbles: true,
                        composed: true,
                        detail: {
                            recordId: this.recordId,
                            recordName: this.recordId,
                            context: this.context,
                            objectApiName: this.objectApiName
                        }
                    })
                );
            }
        }
    }

    // Computed property for fields to fetch
    get fieldsToFetch() {
        if (!this.objectApiName || !this.recordId) {
            return undefined;
        }
        const fieldApiName = this.nameField || 'Name';
        return [`${this.objectApiName}.${fieldApiName}`];
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
        this.recordId = this._value; // Update recordId to trigger @wire

        // console.log('Lookup changed - recordId:', this._value);

        if (!this._value) {
            // Handle record being cleared
            this.dispatchEvent(
                new CustomEvent('lookupselected', {
                    bubbles: true,
                    composed: true,
                    detail: {
                        recordId: null,
                        recordName: '',
                        context: this.context,
                        objectApiName: this.objectApiName
                    }
                })
            );
        }
    }
}