import { LightningElement, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getMyProperties from '@salesforce/apex/MyPropertiesController.getMyProperties';
import getPropertyCount from '@salesforce/apex/MyPropertiesController.getPropertyCount';

export default class MyProperties extends NavigationMixin(LightningElement) {
    properties = [];
    isLoading = true;
    error;
    propertyCount = 0;

    // Wire to get properties
    @wire(getMyProperties)
    wiredProperties({ error, data }) {
        this.isLoading = true;
        if (data) {
            this.properties = data.map(property => ({
                ...property,
                formattedListingPrice: this.formatCurrency(property.listingPrice),
                formattedPurchasePrice: this.formatCurrency(property.purchasePrice),
                formattedPurchaseDate: this.formatDate(property.purchaseDate),
                bedroomsLabel: property.bedrooms ? `${property.bedrooms} Beds` : '',
                bathroomsLabel: property.bathrooms ? `${property.bathrooms} Baths` : '',
                statusClass: this.getStatusClass(property.status)
            }));
            this.propertyCount = this.properties.length;
            this.error = undefined;
            this.isLoading = false;
        } else if (error) {
            this.error = error;
            this.properties = [];
            this.propertyCount = 0;
            this.isLoading = false;
            this.showToast('Error', 'Failed to load properties', 'error');
        }
    }

    // Getters
    get hasProperties() {
        return this.properties && this.properties.length > 0;
    }

    get propertyCountLabel() {
        if (this.propertyCount === 0) {
            return 'No properties';
        } else if (this.propertyCount === 1) {
            return '1 Property';
        } else {
            return `${this.propertyCount} Properties`;
        }
    }

    // Handle view property details
    handleViewProperty(event) {
        const propertyId = event.currentTarget.dataset.propertyId;
        this.pageReference = {
            type: 'comm__namedPage',
            attributes: {
                name: 'PropertyOverview__c'
            },
            state: {
                c__recordId: propertyId
            }
        };
        this[NavigationMixin.Navigate](this.pageReference);
    }

    // Handle view order
    handleViewOrder(event) {
        const orderNumber = event.currentTarget.dataset.orderNumber;
        // Navigate to orders page or show order details
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: 'my_profile__c'
            },
            state: {
                c__tab: 'orders',
                c__orderNumber: orderNumber
            }
        });
    }

    // Handle browse properties
    handleBrowseProperties() {
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: 'properties__c'
            }
        });
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

    // Format date
    formatDate(date) {
        if (!date) return '';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // Get status class
    getStatusClass(status) {
        switch(status) {
            case 'Available':
                return 'status-badge status-available';
            case 'Pending':
                return 'status-badge status-pending';
            case 'Sold':
                return 'status-badge status-sold';
            default:
                return 'status-badge';
        }
    }

    // Show toast notification
    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }
}