import { LightningElement, wire, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getFilteredProperties from '@salesforce/apex/PropertyController.getFilteredProperties';

/**
 * Parent component that orchestrates property display
 * Manages filter state and data fetching
 * Listens for CustomEvents from child components
 */
export default class PropertyContainer extends LightningElement {

    @api height;
    // Filter state managed by parent
    filters = {
        city: '',
        type: '',
        status: '',
        minPrice: null,
        maxPrice: null,
        minBedrooms: null
    };

    properties = [];
    error;
    isLoading = false;

    /**
     * Wire Apex method with reactive filter parameters
     * Automatically re-executes when any filter changes
     */
    @wire(getFilteredProperties, {
        cityFilter: '$filters.city',
        typeFilter: '$filters.type',
        statusFilter: '$filters.status',
        minPrice: '$filters.minPrice',
        maxPrice: '$filters.maxPrice',
        minBedrooms: '$filters.minBedrooms'
    })
    wiredProperties({ error, data }) {
        this.isLoading = false;
        
        if (data) {
            this.properties = data;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.properties = [];
            this.showErrorToast();
        }
    }

    /**
     * Check if there are properties to display
     */
    get hasProperties() {
        return !this.isLoading && this.properties && this.properties.length > 0;
    }

    /**
     * Check if no properties found
     */
    get noProperties() {
        return !this.isLoading && this.properties && this.properties.length === 0;
    }

    /**
     * Handle filter change CustomEvent from propertyFilters child component
     * Event contains filterType and filterValue in detail
     * @param {CustomEvent} event - CustomEvent dispatched from child
     */
    handleFilterChange(event) {
        this.isLoading = true;
        
        const { filterType, filterValue } = event.detail;
        
        // Handle clear all filters
        if (filterType === 'clear') {
            this.filters = {
                city: '',
                type: '',
                status: '',
                minPrice: null,
                maxPrice: null,
                minBedrooms: null
            };
            return;
        }
        
        // Update specific filter using dynamic property name
        // Creates new object reference to trigger reactivity
        this.filters = {
            ...this.filters,
            [filterType]: filterValue
        };
    }

    /**
     * Show error toast notification
     */
    showErrorToast() {
        const evt = new ShowToastEvent({
            title: 'Error loading properties',
            message: this.error?.body?.message || 'An error occurred while fetching properties',
            variant: 'error',
            mode: 'dismissable'
        });
        this.dispatchEvent(evt);
    }
}