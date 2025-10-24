import { LightningElement, api, track } from 'lwc';

export default class MakeOfferModal extends LightningElement {
    @api propertyId;
    @api propertyName;
    @api listingPrice;

    isSubmitting = false;

    @track formData = {
        offeredPrice: '',
        depositAmount: '',
        offerDate: '',
        expirationDate: '',
        proposedClosingDate: '',
        financingContingency: false,
        inspectionContingency: false,
        specialTerms: ''
    };

    hasInitialized = false;

    connectedCallback() {
        // Set default offer date to today
        const today = new Date().toISOString().split('T')[0];
        this.formData = {
            ...this.formData,
            offerDate: today,
            offeredPrice: this.listingPrice || ''
        };
    }

    handleInputChange(event) {
        const field = event.target.dataset.field;
        const value = event.target.value;

        this.formData = {
            ...this.formData,
            [field]: value
        };
    }

    handleCheckboxChange(event) {
        const field = event.target.dataset.field;
        const checked = event.target.checked;

        this.formData = {
            ...this.formData,
            [field]: checked
        };
    }

    handleCancel() {
        this.closeModal();
    }

    handleSubmit() {
        if (this.validateForm()) {
            this.isSubmitting = true;

            // Dispatch event with form data
            const offerData = {
                propertyId: this.propertyId,
                offeredPrice: parseFloat(this.formData.offeredPrice),
                depositAmount: this.formData.depositAmount ? parseFloat(this.formData.depositAmount) : null,
                offerDate: this.formData.offerDate,
                expirationDate: this.formData.expirationDate || null,
                proposedClosingDate: this.formData.proposedClosingDate || null,
                financingContingency: this.formData.financingContingency,
                inspectionContingency: this.formData.inspectionContingency,
                specialTerms: this.formData.specialTerms || null
            };

            this.dispatchEvent(new CustomEvent('submitoffer', {
                detail: offerData
            }));
        }
    }

    validateForm() {
        // Check required fields
        if (!this.formData.offeredPrice || !this.formData.offerDate) {
            this.dispatchEvent(new CustomEvent('showerror', {
                detail: { message: 'Please fill all required fields (Offered Price and Offer Date)' }
            }));
            return false;
        }

        // Validate offered price is positive
        const offeredPrice = parseFloat(this.formData.offeredPrice);
        if (offeredPrice <= 0) {
            this.dispatchEvent(new CustomEvent('showerror', {
                detail: { message: 'Offered price must be greater than zero' }
            }));
            return false;
        }

        // Validate deposit amount if provided
        if (this.formData.depositAmount) {
            const depositAmount = parseFloat(this.formData.depositAmount);
            if (depositAmount < 0) {
                this.dispatchEvent(new CustomEvent('showerror', {
                    detail: { message: 'Deposit amount cannot be negative' }
                }));
                return false;
            }
        }

        // Validate expiration date is after offer date
        if (this.formData.expirationDate && this.formData.offerDate) {
            if (new Date(this.formData.expirationDate) <= new Date(this.formData.offerDate)) {
                this.dispatchEvent(new CustomEvent('showerror', {
                    detail: { message: 'Expiration date must be after offer date' }
                }));
                return false;
            }
        }

        // Validate proposed closing date is after offer date
        if (this.formData.proposedClosingDate && this.formData.offerDate) {
            if (new Date(this.formData.proposedClosingDate) <= new Date(this.formData.offerDate)) {
                this.dispatchEvent(new CustomEvent('showerror', {
                    detail: { message: 'Proposed closing date must be after offer date' }
                }));
                return false;
            }
        }

        return true;
    }

    closeModal() {
        this.isSubmitting = false;

        // Reset form
        const today = new Date().toISOString().split('T')[0];
        this.formData = {
            offeredPrice: this.listingPrice || '',
            depositAmount: '',
            offerDate: today,
            expirationDate: '',
            proposedClosingDate: '',
            financingContingency: false,
            inspectionContingency: false,
            specialTerms: ''
        };

        // Dispatch close event
        this.dispatchEvent(new CustomEvent('close'));
    }

    get formattedListingPrice() {
        if (!this.listingPrice) return '$0';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0
        }).format(this.listingPrice);
    }

    get formattedOfferPrice() {
        const price = parseFloat(this.formData.offeredPrice);
        if (!price || isNaN(price)) return '$0';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0
        }).format(price);
    }

    get formattedDeposit() {
        const deposit = parseFloat(this.formData.depositAmount);
        if (!deposit || isNaN(deposit)) return '$0';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0
        }).format(deposit);
    }
}