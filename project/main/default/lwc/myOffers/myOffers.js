import { LightningElement, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getUserOffers from '@salesforce/apex/PropertyController.getUserOffers';

export default class MyOffers extends NavigationMixin(LightningElement) {
    offers = [];
    error;
    isLoading = true;
    selectedFilter = 'All';

    // Wire adapter to fetch user offers
    @wire(getUserOffers)
    wiredOffers({ error, data }) {
        this.isLoading = true;
        if (data) {
            this.offers = this.processOffers(data);
            this.error = undefined;
            this.isLoading = false;
        } else if (error) {
            this.error = error;
            this.offers = [];
            this.isLoading = false;
            this.showToast('Error', 'Failed to load offers', 'error');
        }
    }

    // Process offers to add formatted fields
    processOffers(data) {
        return data.map(item => {
            return {
                ...item,
                formattedOfferPrice: this.formatCurrency(item.offer.Offered_purchase_price__c),
                formattedPropertyPrice: this.formatCurrency(item.propertyPrice),
                formattedDeposit: this.formatCurrency(item.offer.Deposit_Amount__c),
                formattedCounterOffer: this.formatCurrency(item.offer.Counter_Offer_Amount__c),
                formattedOfferDate: this.formatDate(item.offer.Offer_Date__c),
                formattedExpirationDate: this.formatDate(item.offer.Expiration_date__c),
                formattedClosingDate: this.formatDate(item.offer.Proposed_date_for_closing__c),
                statusClass: this.getStatusClass(item.offer.Status__c),
                hasCounterOffer: item.offer.Counter_Offer_Amount__c != null && item.offer.Counter_Offer_Amount__c > 0,
                hasContingencies: item.offer.Financing_contingency_included__c || item.offer.Inspection_contingency_included__c
            };
        });
    }

    // Filter options
    get filterOptions() {
        return [
            { label: 'All', value: 'All' },
            { label: 'Draft', value: 'Draft' },
            { label: 'Pending', value: 'Pending' },
            { label: 'Under Review', value: 'Under Review' },
            { label: 'Accepted', value: 'Accepted' },
            { label: 'Rejected', value: 'Rejected' },
            { label: 'Withdrawn', value: 'Withdrawn' }
        ];
    }

    // Filtered offers based on selected filter
    get filteredOffers() {
        if (!this.offers || this.offers.length === 0) {
            return [];
        }

        if (this.selectedFilter === 'All') {
            return this.offers;
        }

        return this.offers.filter(item => {
            return item.offer.Status__c === this.selectedFilter;
        });
    }

    // Check if there are no offers
    get hasNoOffers() {
        return !this.isLoading && (!this.offers || this.offers.length === 0);
    }

    // Check if filtered list is empty
    get hasNoFilteredOffers() {
        return !this.isLoading && this.filteredOffers.length === 0 && this.offers.length > 0;
    }

    // Get offer count by status
    get offerStats() {
        if (!this.offers || this.offers.length === 0) {
            return {
                total: 0,
                draft: 0,
                pending: 0,
                accepted: 0
            };
        }

        const stats = {
            total: this.offers.length,
            draft: 0,
            pending: 0,
            accepted: 0
        };

        this.offers.forEach(item => {
            const status = item.offer.Status__c;
            if (status === 'Draft') stats.draft++;
            else if (status === 'Pending') stats.pending++;
            else if (status === 'Accepted') stats.accepted++;
        });

        return stats;
    }

    // Handle filter change
    handleFilterChange(event) {
        this.selectedFilter = event.detail.value;
    }

    // Navigate to property details
    handleViewProperty(event) {
        const propertyId = event.currentTarget.dataset.propertyId;
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: 'PropertyDetails__c'
            },
            state: {
                c__recordId: propertyId
            }
        });
    }

    // Format date
    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // Format currency
    formatCurrency(value) {
        if (!value || value === 0) return '$0';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    }

    // Get status badge class
    getStatusClass(status) {
        const baseClass = 'status-badge';
        switch(status) {
            case 'Draft':
                return `${baseClass} status-draft`;
            case 'Pending':
                return `${baseClass} status-pending`;
            case 'Under Review':
                return `${baseClass} status-review`;
            case 'Accepted':
                return `${baseClass} status-accepted`;
            case 'Rejected':
                return `${baseClass} status-rejected`;
            case 'Withdrawn':
                return `${baseClass} status-withdrawn`;
            default:
                return baseClass;
        }
    }

    // Show toast message
    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        }));
    }
}