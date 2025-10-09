import { LightningElement, track } from 'lwc';

import { formatDate, getRelativeTime } from 'c/dateTimeUtils';
import { formatCurrency, formatPercentage } from 'c/formatUtils';
import { isValidEmail, formatPhone } from 'c/validationUtils';
import { getErrorMessage, logError } from 'c/errorUtils';
import { groupBy, sortBy } from 'c/dataUtils';

import { executeApexWithLoading } from 'c/apexUtils';
import { showSuccessToast, showErrorToast, showRecordDeletedToast } from 'c/toastUtils';

export default class ExampleComponent extends LightningElement {

    @track data = [];
    @track properties = [];
    isLoading = false;
    
    connectedCallback() {
        this.demonstrateUtils();
        this.loadProperties();
    }
    
    demonstrateUtils() {
        // Date formatting
        const today = new Date();
        console.log('Formatted Date:', formatDate(today, 'long'));
        console.log('Relative Time:', getRelativeTime(new Date('2024-01-01')));
        
        // Currency formatting
        console.log('Currency:', formatCurrency(1234.56));
        console.log('Percentage:', formatPercentage(0.75));
        
        // Validation
        console.log('Valid Email:', isValidEmail('test@example.com'));
        console.log('Formatted Phone:', formatPhone('1234567890'));
        
        // Array operations
        const items = [
            { id: 1, category: 'A', price: 100 },
            { id: 2, category: 'B', price: 50 },
            { id: 3, category: 'A', price: 75 }
        ];
        
        console.log('Grouped:', groupBy(items, 'category'));
        console.log('Sorted:', sortBy(items, 'price', 'desc'));
    }
    
    handleError(error) {
        // Use error utility
        const message = getErrorMessage(error);
        logError('ExampleComponent', error);
        
        // Show to user
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Error',
                message: message,
                variant: 'error'
            })
        );
    }

    async loadProperties() {
        try {
            this.properties = await executeApexWithLoading(
                getProperties,
                {},
                this,
                'isLoading'
            );
            showSuccessToast(this, 'Success', 'Properties loaded successfully');
        } catch (error) {
            showErrorToast(this, 'Error', 'Failed to load properties');
        }
    }

    async handleDelete(event) {
        const propertyId = event.target.dataset.id;
        
        try {
            await executeApexWithLoading(
                deleteProperty,
                { propertyId: propertyId },
                this,
                'isLoading'
            );
            showRecordDeletedToast(this, 'Property');
            await this.loadProperties();
        } catch (error) {
            showErrorToast(this, 'Error', 'Failed to delete property');
        }
    }
}