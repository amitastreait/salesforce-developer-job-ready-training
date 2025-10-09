import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ScheduleViewingModal extends LightningElement {
    @api propertyId;
    @api propertyName;
    
    @track formData = {
        date: '',
        time: '',
        name: '',
        phone: ''
    };

    handleInputChange(event) {
        const field = event.target.dataset.field;
        this.formData[field] = event.target.value;
    }

    handleCancel() {
        this.closeModal();
    }

    handleSubmit() {
        if (this.validateForm()) {
            // Dispatch event with form data
            const viewingData = {
                propertyId: this.propertyId,
                date: this.formData.date,
                time: this.formData.time,
                name: this.formData.name,
                phone: this.formData.phone
            };

            this.dispatchEvent(new CustomEvent('scheduleviewing', {
                detail: viewingData
            }));

            this.showToast('Success', 'Viewing scheduled successfully!', 'success');
            this.closeModal();
        }
    }

    validateForm() {
        // Check required fields
        if (!this.formData.date || !this.formData.time || 
            !this.formData.name || !this.formData.phone) {
            this.showToast('Error', 'Please fill all required fields', 'error');
            return false;
        }

        // Validate date is not in the past
        const selectedDate = new Date(this.formData.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            this.showToast('Error', 'Please select a future date', 'error');
            return false;
        }

        // Validate phone format (basic)
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        if (!phoneRegex.test(this.formData.phone)) {
            this.showToast('Error', 'Please enter a valid phone number', 'error');
            return false;
        }

        return true;
    }

    closeModal() {
        // Reset form
        this.formData = {
            date: '',
            time: '',
            name: '',
            phone: ''
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
}