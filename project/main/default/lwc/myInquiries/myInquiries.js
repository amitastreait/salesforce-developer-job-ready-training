import { LightningElement, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getUserInquiries from '@salesforce/apex/PropertyController.getUserInquiries';

export default class MyInquiries extends NavigationMixin(LightningElement) {
    inquiries = [];
    error;
    isLoading = true;
    selectedFilter = 'All';

    // Wire adapter to fetch user inquiries
    @wire(getUserInquiries)
    wiredInquiries({ error, data }) {
        this.isLoading = true;
        if (data) {
            this.inquiries = data;
            this.error = undefined;
            this.isLoading = false;
        } else if (error) {
            this.error = error;
            this.inquiries = [];
            this.isLoading = false;
            this.showToast('Error', 'Failed to load inquiries', 'error');
        }
    }

    // Filter options
    get filterOptions() {
        return [
            { label: 'All', value: 'All' },
            { label: 'New', value: 'New' },
            { label: 'In Progress', value: 'In Progress' },
            { label: 'Responded', value: 'Responded' },
            { label: 'Closed', value: 'Closed' }
        ];
    }

    // Filtered inquiries based on selected filter
    get filteredInquiries() {
        if (!this.inquiries || this.inquiries.length === 0) {
            return [];
        }

        if (this.selectedFilter === 'All') {
            return this.inquiries;
        }

        return this.inquiries.filter(item => {
            return item.inquiry.Status__c === this.selectedFilter;
        });
    }

    // Check if there are no inquiries
    get hasNoInquiries() {
        return !this.isLoading && (!this.inquiries || this.inquiries.length === 0);
    }

    // Check if filtered list is empty
    get hasNoFilteredInquiries() {
        return !this.isLoading && this.filteredInquiries.length === 0 && this.inquiries.length > 0;
    }

    // Get inquiry count by status
    get inquiryStats() {
        if (!this.inquiries || this.inquiries.length === 0) {
            return {
                total: 0,
                new: 0,
                inProgress: 0,
                responded: 0
            };
        }

        const stats = {
            total: this.inquiries.length,
            new: 0,
            inProgress: 0,
            responded: 0
        };

        this.inquiries.forEach(item => {
            const status = item.inquiry.Status__c;
            if (status === 'New') stats.new++;
            else if (status === 'In Progress') stats.inProgress++;
            else if (status === 'Responded') stats.responded++;
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

    // Navigate to inquiry details
    handleViewInquiry(event) {
        const inquiryId = event.currentTarget.dataset.inquiryId;
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: inquiryId,
                objectApiName: 'PropertyInquiry__c',
                actionName: 'view'
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
        if (!value) return '$0';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    }

    // Get status badge class
    getStatusClass(status) {
        switch(status) {
            case 'New':
                return 'status-badge status-new';
            case 'In Progress':
                return 'status-badge status-progress';
            case 'Responded':
                return 'status-badge status-responded';
            case 'Closed':
                return 'status-badge status-closed';
            default:
                return 'status-badge';
        }
    }

    // Get priority badge class
    getPriorityClass(priority) {
        switch(priority) {
            case 'High':
                return 'priority-badge priority-high';
            case 'Medium':
                return 'priority-badge priority-medium';
            case 'Low':
                return 'priority-badge priority-low';
            default:
                return 'priority-badge';
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