import { LightningElement, api } from 'lwc';

/**
 * Property Card Component
 * Displays individual property information in a modern card layout
 * Used in property listing pages, search results, and featured properties sections
 */
export default class PropertyCard extends LightningElement {
    
    /**
     * @api property - Property object containing all property details
     * Expected structure:
     * {
     *   id: String - Unique property identifier
     *   title: String - Property title/name
     *   address: String - Street address
     *   city: String - City name
     *   state: String - State code
     *   zipCode: String - ZIP code
     *   price: Number - Property price
     *   bedrooms: Number - Number of bedrooms
     *   bathrooms: Number - Number of bathrooms
     *   sqft: Number - Square footage
     *   propertyType: String - Type (House, Apartment, Condo, etc.)
     *   status: String - Status (For Sale, For Rent, Sold, etc.)
     *   yearBuilt: Number - Year property was built
     *   imageUrl: String - Main property image URL
     *   isFeatured: Boolean - Whether property is featured
     * }
     */
    @api property;
    
    /**
     * Computed property: Format price with currency symbol and commas
     * @returns {String} Formatted price (e.g., "$450,000")
     */
    get formattedPrice() {
        if (!this.property || !this.property.price) {
            return '$0';
        }
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(this.property.price);
    }
    
    /**
     * Computed property: Format square footage with commas
     * @returns {String} Formatted sqft (e.g., "2,500")
     */
    get formattedSqft() {
        if (!this.property || !this.property.sqft) {
            return '0';
        }
        return new Intl.NumberFormat('en-US').format(this.property.sqft);
    }
    
    /**
     * Computed property: Check if property is for rent
     * @returns {Boolean} True if property status is "For Rent"
     */
    get isRental() {
        return this.property && this.property.status === 'For Rent';
    }
    
    /**
     * Computed property: Dynamic CSS class for status badge
     * @returns {String} CSS class based on property status
     */
    get statusBadgeClass() {
        const baseClass = 'status-badge';
        if (!this.property) return baseClass;
        
        const statusMap = {
            'For Sale': `${baseClass} status-sale`,
            'For Rent': `${baseClass} status-rent`,
            'Sold': `${baseClass} status-sold`,
            'Pending': `${baseClass} status-pending`
        };
        
        return statusMap[this.property.status] || baseClass;
    }
    
    /**
     * Event Handler: Card click - Navigate to property details
     * @param {Event} event - Click event
     */
    handleCardClick(event) {
        // Prevent navigation if clicking on action buttons
        if (event.target.closest('.property-actions')) {
            return;
        }
        
        // Dispatch custom event to parent component
        const selectEvent = new CustomEvent('propertyselect', {
            detail: {
                propertyId: this.property.id,
                property: this.property
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(selectEvent);
    }
    
    /**
     * Event Handler: View Details button click
     * @param {Event} event - Click event
     */
    handleViewDetails(event) {
        event.stopPropagation(); // Prevent card click event
        
        // Dispatch view details event
        const viewEvent = new CustomEvent('viewdetails', {
            detail: {
                propertyId: this.property.id
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(viewEvent);
    }
    
    /**
     * Event Handler: Add to favorites button click
     * @param {Event} event - Click event
     */
    handleAddToFavorites(event) {
        event.stopPropagation(); // Prevent card click event
        
        // Dispatch favorite event
        const favoriteEvent = new CustomEvent('addtofavorites', {
            detail: {
                propertyId: this.property.id,
                propertyTitle: this.property.title
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(favoriteEvent);
        
        // Show success toast (optional)
        console.log('Property added to favorites:', this.property.title);
    }
    
    /**
     * Event Handler: Share button click
     * @param {Event} event - Click event
     */
    handleShare(event) {
        event.stopPropagation(); // Prevent card click event
        
        // Dispatch share event
        const shareEvent = new CustomEvent('shareproperty', {
            detail: {
                propertyId: this.property.id,
                propertyTitle: this.property.title,
                propertyUrl: window.location.href
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(shareEvent);
    }
}