import { LightningElement, wire, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getFilteredProperties from '@salesforce/apex/PropertyController.getFilteredProperties';

import { CurrentPageReference } from 'lightning/navigation';

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

    connectedCallback() {
        console.log('=== PropertyContainer Connected ===');
        console.log('Initial Filters:', this.filters);
    }

    @wire(CurrentPageReference)
    getPageRef(currRef){
        console.log('Current Page Reference: ', JSON.stringify(currRef.state));
    }

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
    wiredProperties(result) {
        console.log('=== Wire Adapter Called ===');
        console.log('Wire Result:', result);

        this.isLoading = false;

        const { error, data } = result;

        console.log('Has Error:', !!error);
        console.log('Has Data:', !!data);

        if (data) {
            console.log('Wired Properties Raw Data (length):', data.length);
            console.log('Wired Properties Raw Data:', JSON.stringify(data));

            // Transform property data to extract first image from subquery
            this.properties = data.map(property => {
                console.log('Processing property:', property.Name);
                console.log('Property_Images__r:', property.Property_Images__r);

                // Check if Property_Images__r exists and has records
                let firstImageUrl = null;
                if (property.Property_Images__r && property.Property_Images__r.length > 0) {
                    firstImageUrl = property.Property_Images__r[0].Image_Url__c;
                    console.log('Using Property Image:', firstImageUrl);
                } else if (property.Image_URL__c) {
                    // Fallback to Image_URL__c field
                    firstImageUrl = property.Image_URL__c;
                    console.log('Using fallback Image_URL__c:', firstImageUrl);
                } else {
                    console.log('No image found for property:', property.Name);
                }

                // Return property with firstImageUrl added
                return {
                    ...property,
                    firstImageUrl: firstImageUrl
                };
            });

            console.log('Transformed Properties Count:', this.properties.length);
            console.log('First Property:', JSON.stringify(this.properties[0]));
            this.error = undefined;
        } else if (error) {
            console.error('=== ERROR IN WIRE ADAPTER ===');
            console.error('Error Object:', error);
            console.error('Error Body:', error.body);
            console.error('Error Message:', error.body?.message);
            console.error('Error Stack:', error.body?.stackTrace);

            this.error = error;
            this.properties = [];
            this.showErrorToast();
        } else {
            console.log('Wire adapter called but no data or error yet');
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