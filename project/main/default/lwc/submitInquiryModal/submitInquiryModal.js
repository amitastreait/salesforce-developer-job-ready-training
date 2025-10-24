import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class SubmitInquiryModal extends LightningElement {
    @api propertyId;
    @api propertyName;
    @api userName;
    @api userEmail;

    @track formData = {
        name: '',
        email: '',
        phone: '',
        message: ''
    };

    // Track if we've initialized the form with user data
    hasInitialized = false;

    renderedCallback() {
        // Pre-populate user data on first render
        if (!this.hasInitialized && (this.userName || this.userEmail)) {
            this.hasInitialized = true;

            // Create a new object to trigger reactivity
            this.formData = {
                name: this.userName || '',
                email: this.userEmail || '',
                phone: '',
                message: ''
            };
        }
    }

    handleInputChange(event) {
        const field = event.target.dataset.field;
        this.formData = {
            ...this.formData,
            [field]: event.target.value
        };
    }

    handleCancel() {
        this.closeModal();
    }

    handleSubmit() {
        if (this.validateForm()) {
            // Dispatch event with form data
            const inquiryData = {
                propertyId: this.propertyId,
                name: this.formData.name,
                email: this.formData.email,
                phone: this.formData.phone,
                message: this.formData.message
            };

            this.dispatchEvent(new CustomEvent('submitinquiry', {
                detail: inquiryData
            }));

            this.showToast('Success', 'Inquiry submitted successfully!', 'success');
            this.closeModal();
        }
    }

    validateForm() {
        // Check required fields
        if (!this.formData.name || !this.formData.email || !this.formData.message) {
            this.showToast('Error', 'Please fill all required fields', 'error');
            return false;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.formData.email)) {
            this.showToast('Error', 'Please enter a valid email address', 'error');
            return false;
        }

        // Validate phone format if provided
        if (this.formData.phone) {
            const phoneRegex = /^[\d\s\-\+\(\)]+$/;
            if (!phoneRegex.test(this.formData.phone)) {
                this.showToast('Error', 'Please enter a valid phone number', 'error');
                return false;
            }
        }

        // Validate message length
        if (this.formData.message.length < 10) {
            this.showToast('Error', 'Please provide a detailed message (at least 10 characters)', 'error');
            return false;
        }

        return true;
    }

    closeModal() {
        // Reset form
        this.formData = {
            name: '',
            email: '',
            phone: '',
            message: ''
        };

        // Dispatch close event
        this.dispatchEvent(new CustomEvent('close'));
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        }));
    }

    get characterCount() {
        return this.formData.message.length;
    }

    get characterCountClass() {
        return this.characterCount < 10 ? 'character-count-low' : 'character-count-ok';
    }
}