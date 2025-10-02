import { LightningElement, track } from 'lwc';

/**
 * Property Listing Page (PLP) Component
 * Main container for displaying property listings with filters and search
 * Manages property data, filtering, pagination, and user interactions
 */
export default class PropertyListingPage extends LightningElement {
    
    /**
     * @track properties - Master list of all properties
     * This would typically come from Apex or API call
     */
    @track properties = [
        {
            id: '1',
            title: 'Modern Downtown Loft',
            address: '123 Main Street',
            city: 'San Francisco',
            state: 'CA',
            zipCode: '94102',
            price: 850000,
            bedrooms: 2,
            bathrooms: 2,
            sqft: 1200,
            propertyType: 'Apartment',
            status: 'For Sale',
            yearBuilt: 2020,
            imageUrl: 'https://via.placeholder.com/400x300/667eea/ffffff?text=Modern+Loft',
            isFeatured: true
        },
        {
            id: '2',
            title: 'Luxury Family Home',
            address: '456 Oak Avenue',
            city: 'Los Angeles',
            state: 'CA',
            zipCode: '90001',
            price: 1250000,
            bedrooms: 4,
            bathrooms: 3,
            sqft: 2800,
            propertyType: 'House',
            status: 'For Sale',
            yearBuilt: 2018,
            imageUrl: 'https://via.placeholder.com/400x300/10b981/ffffff?text=Luxury+Home',
            isFeatured: true
        },
        {
            id: '3',
            title: 'Cozy Studio Apartment',
            address: '789 Park Lane',
            city: 'Seattle',
            state: 'WA',
            zipCode: '98101',
            price: 2500,
            bedrooms: 1,
            bathrooms: 1,
            sqft: 650,
            propertyType: 'Apartment',
            status: 'For Rent',
            yearBuilt: 2019,
            imageUrl: 'https://via.placeholder.com/400x300/3b82f6/ffffff?text=Studio',
            isFeatured: false
        },
        {
            id: '4',
            title: 'Beachfront Condo',
            address: '321 Ocean Drive',
            city: 'Miami',
            state: 'FL',
            zipCode: '33139',
            price: 975000,
            bedrooms: 3,
            bathrooms: 2,
            sqft: 1800,
            propertyType: 'Condo',
            status: 'For Sale',
            yearBuilt: 2021,
            imageUrl: 'https://via.placeholder.com/400x300/06b6d4/ffffff?text=Beachfront',
            isFeatured: true
        },
        {
            id: '5',
            title: 'Suburban Dream House',
            address: '555 Maple Street',
            city: 'Austin',
            state: 'TX',
            zipCode: '78701',
            price: 650000,
            bedrooms: 3,
            bathrooms: 2,
            sqft: 2100,
            propertyType: 'House',
            status: 'Pending',
            yearBuilt: 2017,
            imageUrl: 'https://via.placeholder.com/400x300/f59e0b/ffffff?text=Suburban',
            isFeatured: false
        },
        {
            id: '6',
            title: 'Urban Townhouse',
            address: '888 City Plaza',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            price: 3200,
            bedrooms: 2,
            bathrooms: 2,
            sqft: 1400,
            propertyType: 'Townhouse',
            status: 'For Rent',
            yearBuilt: 2022,
            imageUrl: 'https://via.placeholder.com/400x300/8b5cf6/ffffff?text=Townhouse',
            isFeatured: false
        }
    ];
    
    // ========================================
    // FILTER STATES
    // ========================================
    
    @track searchTerm = '';
    @track selectedPropertyType = '';
    @track selectedStatus = '';
    @track selectedPriceRange = '';
    @track selectedBedrooms = '';
    
    // ========================================
    // VIEW & PAGINATION STATES
    // ========================================
    
    @track viewMode = 'grid'; // 'grid' or 'list'
    @track isLoading = false;
    @track currentPage = 1;
    itemsPerPage = 6;
    
    // ========================================
    // FILTER OPTIONS
    // ========================================
    
    /**
     * Property Type filter options
     */
    propertyTypeOptions = [
        { label: 'All Types', value: '' },
        { label: 'House', value: 'House' },
        { label: 'Apartment', value: 'Apartment' },
        { label: 'Condo', value: 'Condo' },
        { label: 'Townhouse', value: 'Townhouse' }
    ];
    
    /**
     * Status filter options
     */
    statusOptions = [
        { label: 'All Status', value: '' },
        { label: 'For Sale', value: 'For Sale' },
        { label: 'For Rent', value: 'For Rent' },
        { label: 'Sold', value: 'Sold' },
        { label: 'Pending', value: 'Pending' }
    ];
    
    /**
     * Price Range filter options
     */
    priceRangeOptions = [
        { label: 'Any Price', value: '' },
        { label: 'Under $500K', value: '0-500000' },
        { label: '$500K - $1M', value: '500000-1000000' },
        { label: '$1M - $2M', value: '1000000-2000000' },
        { label: 'Above $2M', value: '2000000-999999999' }
    ];
    
    /**
     * Bedroom filter options
     */
    bedroomOptions = [
        { label: 'Any', value: '' },
        { label: '1+', value: '1' },
        { label: '2+', value: '2' },
        { label: '3+', value: '3' },
        { label: '4+', value: '4' }
    ];
    
    // ========================================
    // COMPUTED PROPERTIES
    // ========================================
    
    /**
     * Get filtered properties based on active filters
     * @returns {Array} Filtered property list
     */
    get filteredProperties() {
        let filtered = [...this.properties];
        
        // Apply search filter
        if (this.searchTerm) {
            const searchLower = this.searchTerm.toLowerCase();
            filtered = filtered.filter(property => 
                property.title.toLowerCase().includes(searchLower) ||
                property.address.toLowerCase().includes(searchLower) ||
                property.city.toLowerCase().includes(searchLower) ||
                property.state.toLowerCase().includes(searchLower)
            );
        }
        
        // Apply property type filter
        if (this.selectedPropertyType) {
            filtered = filtered.filter(property => 
                property.propertyType === this.selectedPropertyType
            );
        }
        
        // Apply status filter
        if (this.selectedStatus) {
            filtered = filtered.filter(property => 
                property.status === this.selectedStatus
            );
        }
        
        // Apply price range filter
        if (this.selectedPriceRange) {
            const [min, max] = this.selectedPriceRange.split('-').map(Number);
            filtered = filtered.filter(property => 
                property.price >= min && property.price <= max
            );
        }
        
        // Apply bedroom filter
        if (this.selectedBedrooms) {
            const minBeds = parseInt(this.selectedBedrooms);
            filtered = filtered.filter(property => 
                property.bedrooms >= minBeds
            );
        }
        
        // Apply pagination
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        
        return filtered.slice(startIndex, endIndex);
    }
    
    /**
     * Get total count of filtered properties (before pagination)
     * @returns {Number} Total filtered properties count
     */
    get totalProperties() {
        let filtered = [...this.properties];
        
        if (this.searchTerm) {
            const searchLower = this.searchTerm.toLowerCase();
            filtered = filtered.filter(property => 
                property.title.toLowerCase().includes(searchLower) ||
                property.address.toLowerCase().includes(searchLower) ||
                property.city.toLowerCase().includes(searchLower)
            );
        }
        
        if (this.selectedPropertyType) {
            filtered = filtered.filter(p => p.propertyType === this.selectedPropertyType);
        }
        
        if (this.selectedStatus) {
            filtered = filtered.filter(p => p.status === this.selectedStatus);
        }
        
        if (this.selectedPriceRange) {
            const [min, max] = this.selectedPriceRange.split('-').map(Number);
            filtered = filtered.filter(p => p.price >= min && p.price <= max);
        }
        
        if (this.selectedBedrooms) {
            const minBeds = parseInt(this.selectedBedrooms);
            filtered = filtered.filter(p => p.bedrooms >= minBeds);
        }
        
        return filtered.length;
    }
    
    /**
     * Check if there are properties to display
     * @returns {Boolean} True if filtered properties exist
     */
    get hasProperties() {
        return this.filteredProperties.length > 0;
    }
    
    /**
     * Dynamic CSS class for grid container based on view mode
     * @returns {String} CSS class for grid/list layout
     */
    get gridClass() {
        return this.viewMode === 'grid' ? 'property-grid' : 'property-list';
    }
    
    /**
     * Variant for grid view button
     * @returns {String} Button variant
     */
    get gridViewVariant() {
        return this.viewMode === 'grid' ? 'brand' : 'neutral';
    }
    
    /**
     * Variant for list view button
     * @returns {String} Button variant
     */
    get listViewVariant() {
        return this.viewMode === 'list' ? 'brand' : 'neutral';
    }
    
    // ========================================
    // PAGINATION COMPUTED PROPERTIES
    // ========================================
    
    /**
     * Calculate total number of pages
     * @returns {Number} Total pages
     */
    get totalPages() {
        return Math.ceil(this.totalProperties / this.itemsPerPage);
    }
    
    /**
     * Check if current page is the first page
     * @returns {Boolean} True if first page
     */
    get isFirstPage() {
        return this.currentPage === 1;
    }
    
    /**
     * Check if current page is the last page
     * @returns {Boolean} True if last page
     */
    get isLastPage() {
        return this.currentPage === this.totalPages;
    }
    
    /**
     * Show pagination controls if there are multiple pages
     * @returns {Boolean} True if pagination should be shown
     */
    get showPagination() {
        return this.totalPages > 1;
    }
    
    // ========================================
    // EVENT HANDLERS - FILTERS
    // ========================================
    
    /**
     * Handle search input change
     * @param {Event} event - Input change event
     */
    handleSearch(event) {
        this.searchTerm = event.target.value;
        this.currentPage = 1; // Reset to first page on filter change
    }
    
    /**
     * Handle property type filter change
     * @param {Event} event - Combobox change event
     */
    handlePropertyTypeChange(event) {
        this.selectedPropertyType = event.target.value;
        this.currentPage = 1;
    }
    
    /**
     * Handle status filter change
     * @param {Event} event - Combobox change event
     */
    handleStatusChange(event) {
        this.selectedStatus = event.target.value;
        this.currentPage = 1;
    }
    
    /**
     * Handle price range filter change
     * @param {Event} event - Combobox change event
     */
    handlePriceRangeChange(event) {
        this.selectedPriceRange = event.target.value;
        this.currentPage = 1;
    }
    
    /**
     * Handle bedrooms filter change
     * @param {Event} event - Combobox change event
     */
    handleBedroomsChange(event) {
        this.selectedBedrooms = event.target.value;
        this.currentPage = 1;
    }
    
    /**
     * Clear all active filters
     */
    handleClearFilters() {
        this.searchTerm = '';
        this.selectedPropertyType = '';
        this.selectedStatus = '';
        this.selectedPriceRange = '';
        this.selectedBedrooms = '';
        this.currentPage = 1;
    }
    
    // ========================================
    // EVENT HANDLERS - VIEW MODE
    // ========================================
    
    /**
     * Switch to grid view
     */
    handleGridView() {
        this.viewMode = 'grid';
    }
    
    /**
     * Switch to list view
     */
    handleListView() {
        this.viewMode = 'list';
    }
    
    // ========================================
    // EVENT HANDLERS - PAGINATION
    // ========================================
    
    /**
     * Navigate to previous page
     */
    handlePrevious() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.scrollToTop();
        }
    }
    
    /**
     * Navigate to next page
     */
    handleNext() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.scrollToTop();
        }
    }
    
    /**
     * Scroll page to top
     */
    scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // ========================================
    // EVENT HANDLERS - PROPERTY CARD EVENTS
    // ========================================
    
    /**
     * Handle property card selection
     * @param {Event} event - Custom event from property card
     */
    handlePropertySelect(event) {
        const { propertyId, property } = event.detail;
        console.log('Property selected:', propertyId, property);
        
        // Navigate to property detail page
        // In real implementation, use Lightning Navigation Service
        // Example: Navigate to record page
    }
    
    /**
     * Handle view details button click
     * @param {Event} event - Custom event from property card
     */
    handleViewDetails(event) {
        const { propertyId } = event.detail;
        console.log('View details for property:', propertyId);
        
        // Navigate to property detail page
        // Example: this.navigateToPropertyDetails(propertyId);
    }
    
    /**
     * Handle add to favorites action
     * @param {Event} event - Custom event from property card
     */
    handleAddToFavorites(event) {
        const { propertyId, propertyTitle } = event.detail;
        console.log('Add to favorites:', propertyId, propertyTitle);
        
        // Call Apex to save favorite
        // Show success toast
        this.showSuccessToast('Success', `${propertyTitle} added to favorites!`);
    }
    
    /**
     * Handle share property action
     * @param {Event} event - Custom event from property card
     */
    handleShareProperty(event) {
        const { propertyId, propertyTitle } = event.detail;
        console.log('Share property:', propertyId, propertyTitle);
        
        // Open share dialog or copy link
        // Show success toast
        this.showSuccessToast('Success', 'Property link copied to clipboard!');
    }
    
    // ========================================
    // HELPER METHODS
    // ========================================
    
    /**
     * Show success toast notification
     * @param {String} title - Toast title
     * @param {String} message - Toast message
     */
    showSuccessToast(title, message) {
        // In real Salesforce implementation, use ShowToastEvent
        console.log(`${title}: ${message}`);
    }
}