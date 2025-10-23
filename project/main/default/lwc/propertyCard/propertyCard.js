import { LightningElement, api } from 'lwc';

/**
 * Enhanced component to display a single property card
 * Receives property data from parent via @api
 * Displays image, details, and action buttons
 * Dispatches CustomEvents for user actions
 */
export default class PropertyCard extends LightningElement {
    // Public property to receive property data from parent
    @api property;

    // Default placeholder image if no image URL provided
    defaultImage = 'https://www.dialurbanodisha.com/storage/no-property.jpg';

    /**
     * Get property image URL or default placeholder
     * Priority: 1. firstImageUrl (from Property_Image__c), 2. Image_URL__c field, 3. Default
     * @returns {string} Image URL
     */
    get propertyImage() {
        if (this.property) {
            // First priority: Image from Property_Image__c related records
            if (this.property.firstImageUrl) {
                return this.property.firstImageUrl;
            }
            // Second priority: Image_URL__c field on Property__c
            if (this.property.Image_URL__c) {
                return this.property.Image_URL__c;
            }
        }
        return this.defaultImage;
    }

    /**
     * Get CSS class for status badge based on property status
     * @returns {string} CSS class name
     */
    get statusClass() {
        if (!this.property || !this.property.Status__c) {
            return 'status-badge';
        }
        
        switch(this.property.Status__c) {
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

    /**
     * Check if property data is available
     * @returns {boolean}
     */
    get hasProperty() {
        return this.property != null;
    }

    /**
     * Get formatted location string
     * @returns {string}
     */
    get location() {
        if (this.property) {
            return `${this.property.Location_Site__r?.City__c}, ${this.property.Location_Site__r?.State__c}`;
        }
        return '';
    }

    /**
     * Check if property is available for purchase
     * @returns {boolean}
     */
    get isAvailable() {
        return this.property && this.property.Status__c === 'Available';
    }

    /**
     * Handle View Details button click
     * Dispatches CustomEvent to parent with property ID
     */
    handleViewDetails() {
        const viewDetailsEvent = new CustomEvent('viewdetails', {
            detail: {
                propertyId: this.property.Id,
                propertyName: this.property.Name
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(viewDetailsEvent);
    }

    /**
     * Handle Contact Agent button click
     * Dispatches CustomEvent to parent
     */
    handleContactAgent() {
        const contactEvent = new CustomEvent('contactagent', {
            detail: {
                propertyId: this.property.Id,
                propertyName: this.property.Name,
                city: this.property.Location_Site__r.City__c
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(contactEvent);
    }

    /**
     * Handle Schedule Tour button click
     * Dispatches CustomEvent to parent
     */
    handleScheduleTour() {
        const tourEvent = new CustomEvent('scheduletour', {
            detail: {
                propertyId: this.property.Id,
                propertyName: this.property.Name,
                address: this.location
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(tourEvent);
    }

    /**
     * Handle Save/Favorite button click
     * Dispatches CustomEvent to parent
     */
    handleSaveProperty() {
        const saveEvent = new CustomEvent('saveproperty', {
            detail: {
                propertyId: this.property.Id,
                propertyName: this.property.Name
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(saveEvent);
    }

    /**
     * Handle Share button click
     * Dispatches CustomEvent to parent
     */
    handleShareProperty() {
        const shareEvent = new CustomEvent('shareproperty', {
            detail: {
                propertyId: this.property.Id,
                propertyName: this.property.Name,
                propertyUrl: window.location.href
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(shareEvent);
    }

    /**
     * Handle image error - fallback to default image
     */
    handleImageError(event) {
        event.target.src = this.defaultImage;
    }
}