import { LightningElement, api, wire } from 'lwc';
import { NavigationMixin, CurrentPageReference } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getPropertyOverview from '@salesforce/apex/PropertyOverviewController.getPropertyOverview';

export default class PropertyOverview extends NavigationMixin(LightningElement) {
    @api recordId;

    propertyData = {};
    isLoading = true;
    error;
    currentPageReference;

    @wire(CurrentPageReference)
    getStateParameters(currentPageReference) {
        console.log('getStateParameters wire triggered', JSON.stringify(currentPageReference));
        this.currentPageReference = currentPageReference;
        if (currentPageReference) {
            console.log('Page state:', JSON.stringify(currentPageReference.state));
            this.recordId = currentPageReference?.state?.c__recordId;
        }
    }

    connectedCallback() {
        console.log('PropertyOverview connectedCallback - recordId:', this.recordId);
        console.log('PropertyOverview connectedCallback - currentPageReference:', JSON.stringify(this.currentPageReference));
    }
    // Wire to get property overview
    @wire(getPropertyOverview, { propertyId: '$recordId' })
    wiredProperty({ error, data }) {
        this.isLoading = true;
        if (data) {
            console.log('PropertyOverview wiredProperty - data: ', JSON.stringify(data));
            this.propertyData = {
                ...data,
                formattedPrice: this.formatCurrency(data.listingPrice),
                formattedSqFt: this.formatNumber(data.sqFt),
                fullAddress: this.buildFullAddress(data)
            };
            this.error = undefined;
            this.isLoading = false;
        } else if (error) {
            this.error = error;
            this.propertyData = {};
            this.isLoading = false;
            this.showToast('Error', 'Failed to load property details', 'error');
        }
    }

    // Getters
    get hasPropertyData() {
        return this.propertyData && this.propertyData.propertyId;
    }

    get hasImages() {
        return this.propertyData.propertyImages && this.propertyData.propertyImages.length > 0;
    }

    get primaryImage() {
        if (this.hasImages) {
            return this.propertyData.propertyImages[0].imageUrl;
        }
        return this.propertyData.imageUrl || '';
    }

    get hasDocuments() {
        return this.propertyData.propertyDocuments && this.propertyData.propertyDocuments.length > 0;
    }

    get documentsCount() {
        return this.propertyData.propertyDocuments ? this.propertyData.propertyDocuments.length : 0;
    }

    get hasOffers() {
        return this.propertyData.offers && this.propertyData.offers.length > 0;
    }

    get offersCount() {
        return this.propertyData.offers ? this.propertyData.offers.length : 0;
    }

    get formattedDocuments() {
        if (!this.hasDocuments) return [];
        return this.propertyData.propertyDocuments.map(doc => ({
            ...doc,
            formattedUploadDate: this.formatDate(doc.uploadDate),
            formattedExpirationDate: this.formatDate(doc.expirationDate),
            statusClass: this.getDocumentStatusClass(doc.status),
            fileId: doc.fileId
        }));
    }

    get formattedOffers() {
        if (!this.hasOffers) return [];
        return this.propertyData.offers.map(offer => ({
            ...offer,
            formattedOfferedPrice: this.formatCurrency(offer.offeredPrice),
            formattedCounterOffer: this.formatCurrency(offer.counterOfferAmount),
            formattedDepositAmount: this.formatCurrency(offer.depositAmount),
            formattedOfferDate: this.formatDate(offer.offerDate),
            formattedClosingDate: this.formatDate(offer.proposedClosingDate),
            statusClass: this.getOfferStatusClass(offer.status)
        }));
    }

    // Handle view all information
    handleViewAllInformation() {
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: 'PropertyDetails__c'
            },
            state: {
                c__recordId: this.recordId
            }
        });
    }

    // Handle view location
    handleViewLocation() {
        if (this.propertyData.locationId) {
            this[NavigationMixin.Navigate]({
                type: 'standard__recordPage',
                attributes: {
                    recordId: this.propertyData.locationId,
                    objectApiName: 'LocationSite__c',
                    actionName: 'view'
                }
            });
        }
    }

    // Format currency
    formatCurrency(amount) {
        if (!amount) return '$0';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0
        }).format(amount);
    }

    // Format number
    formatNumber(num) {
        if (!num) return '0';
        return new Intl.NumberFormat('en-US').format(num);
    }

    // Format date
    formatDate(date) {
        if (!date) return '';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // Build full address
    buildFullAddress(data) {
        let address = '';
        if (data.street) address += data.street;
        if (data.city) address += (address ? ', ' : '') + data.city;
        if (data.state) address += (address ? ', ' : '') + data.state;
        if (data.zipCode) address += (address ? ' ' : '') + data.zipCode;
        return address || data.address || 'Address not available';
    }

    // Get document status class
    getDocumentStatusClass(status) {
        switch(status) {
            case 'Approved':
                return 'status-badge status-approved';
            case 'Pending':
                return 'status-badge status-pending';
            case 'Rejected':
                return 'status-badge status-rejected';
            default:
                return 'status-badge';
        }
    }

    // Get offer status class
    getOfferStatusClass(status) {
        switch(status) {
            case 'Accepted':
                return 'status-badge status-accepted';
            case 'Pending':
                return 'status-badge status-pending';
            case 'Rejected':
                return 'status-badge status-rejected';
            case 'Countered':
                return 'status-badge status-countered';
            default:
                return 'status-badge';
        }
    }

    // Show toast
    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }
}