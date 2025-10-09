import { LightningElement, api, wire } from 'lwc';
import getCities from '@salesforce/apex/PropertyController.getCities';

/**
 * Component to display and manage property filters
 * Dispatches CustomEvent to parent when filters change
 * Receives current filter values from parent via @api
 */
export default class PropertyFilters extends LightningElement {
    // Public properties to receive current filter values from parent
    @api cityFilter = '';
    @api typeFilter = '';
    @api statusFilter = '';
    @api minPrice;
    @api maxPrice;
    @api minBedrooms;

    availableCities = [];

    /**
     * Picklist options for Property Type
     */
    get propertyTypeOptions() {
        return [
            { label: 'All Types', value: '' },
            { label: 'House', value: 'House' },
            { label: 'Apartment', value: 'Apartment' },
            { label: 'Condo', value: 'Condo' },
            { label: 'Townhouse', value: 'Townhouse' },
            { label: 'Single Family', value: 'Single Family' }
        ];
    }

    /**
     * Picklist options for Status
     */
    get statusOptions() {
        return [
            { label: 'All Statuses', value: '' },
            { label: 'Available', value: 'Available' },
            { label: 'Pending', value: 'Pending' },
            { label: 'Sold', value: 'Sold' }
        ];
    }

    /**
     * City options with dynamic loading from Apex
     */
    get cityOptions() {
        const options = [{ label: 'All Cities', value: '' }];
        this.availableCities.forEach(city => {
            options.push({ label: city, value: city });
        });
        return options;
    }

    /**
     * Wire to load available cities from database
     */
    @wire(getCities)
    wiredCities({ error, data }) {
        if (data) {
            this.availableCities = data;
        } else if (error) {
            console.error('Error loading cities:', error);
        }
    }

    /**
     * Handle city filter change
     * Dispatches CustomEvent to parent with filter details
     */
    handleCityChange(event) {
        const value = event.detail.value;
        this.dispatchFilterChange('city', value);
    }

    /**
     * Handle property type filter change
     */
    handleTypeChange(event) {
        const value = event.detail.value;
        this.dispatchFilterChange('type', value);
    }

    /**
     * Handle status filter change
     */
    handleStatusChange(event) {
        const value = event.detail.value;
        this.dispatchFilterChange('status', value);
    }

    /**
     * Handle minimum price change
     */
    handleMinPriceChange(event) {
        const value = event.detail.value ? parseFloat(event.detail.value) : null;
        this.dispatchFilterChange('minPrice', value);
    }

    /**
     * Handle maximum price change
     */
    handleMaxPriceChange(event) {
        const value = event.detail.value ? parseFloat(event.detail.value) : null;
        this.dispatchFilterChange('maxPrice', value);
    }

    /**
     * Handle minimum bedrooms change
     */
    handleMinBedroomsChange(event) {
        const value = event.detail.value ? parseInt(event.detail.value, 10) : null;
        this.dispatchFilterChange('minBedrooms', value);
    }

    /**
     * Handle clear all filters button click
     * Dispatches clear event to parent
     */
    handleClearFilters() {
        // Dispatch clear event to parent
        this.dispatchFilterChange('clear', null);
        
        // Clear local input values
        this.clearInputFields();
    }

    /**
     * Utility method to dispatch CustomEvent to parent
     * @param {string} filterType - Type of filter (city, type, status, etc.)
     * @param {any} filterValue - New filter value
     */
    dispatchFilterChange(filterType, filterValue) {
        const filterChangeEvent = new CustomEvent('filterchange', {
            detail: {
                filterType: filterType,
                filterValue: filterValue
            },
            bubbles: true,
            composed: true
        });
        
        this.dispatchEvent(filterChangeEvent);
    }

    /**
     * Clear all input fields in the UI
     */
    clearInputFields() {
        // Clear number inputs
        this.template.querySelectorAll('lightning-input').forEach(input => {
            input.value = '';
        });
        
        // Clear comboboxes
        this.template.querySelectorAll('lightning-combobox').forEach(combo => {
            combo.value = '';
        });
    }
}