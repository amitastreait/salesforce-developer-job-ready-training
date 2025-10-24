import { LightningElement, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import getDashboardMetrics from '@salesforce/apex/BuyerDashboardController.getDashboardMetrics';
import { NavigationMixin } from 'lightning/navigation';

export default class BuyerDashboard extends NavigationMixin(LightningElement) {
    // Dashboard metrics
    metrics;
    error;
    isLoading = true;
    wiredMetricsResult;

    // Computed properties for display
    get formattedTotalValue() {
        return this.metrics?.totalPropertyValue
            ? this.formatCurrency(this.metrics.totalPropertyValue)
            : '$0';
    }

    get formattedAverageValue() {
        return this.metrics?.averagePropertyValue
            ? this.formatCurrency(this.metrics.averagePropertyValue)
            : '$0';
    }

    get formattedCartTotal() {
        return this.metrics?.cartTotalAmount
            ? this.formatCurrency(this.metrics.cartTotalAmount)
            : '$0';
    }

    get hasProperties() {
        return this.metrics?.totalProperties > 0;
    }

    get hasOrders() {
        return this.metrics?.recentOrders?.length > 0;
    }

    get hasActivities() {
        return this.metrics?.recentActivities?.length > 0;
    }

    get hasCart() {
        return this.metrics?.cartItemCount > 0;
    }

    get recentPropertiesWithFormatting() {
        if (!this.metrics?.recentProperties) return [];

        return this.metrics.recentProperties.map(prop => ({
            ...prop,
            formattedPrice: this.formatCurrency(prop.purchasePrice),
            formattedDate: this.formatDate(prop.purchaseDate),
            hasImage: !!prop.imageUrl
        }));
    }

    get recentOrdersWithFormatting() {
        if (!this.metrics?.recentOrders) return [];

        return this.metrics.recentOrders.map(order => ({
            ...order,
            formattedAmount: this.formatCurrency(order.totalAmount),
            formattedDate: this.formatDate(order.orderDate),
            statusClass: this.getStatusClass(order.status),
            statusLabel: order.status
        }));
    }

    get recentActivitiesFormatted() {
        if (!this.metrics?.recentActivities) return [];

        return this.metrics.recentActivities.map(activity => ({
            ...activity,
            formattedDate: this.formatDateTime(activity.activityDate),
            iconName: activity.icon
        }));
    }

    // Wire method to fetch dashboard metrics
    @wire(getDashboardMetrics)
    wiredMetrics(result) {
        this.wiredMetricsResult = result;
        this.isLoading = false;

        const { error, data } = result;
        if (data) {
            this.metrics = data;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.metrics = undefined;
            this.showErrorToast('Error loading dashboard', error.body?.message || 'Unknown error');
        }
    }

    // Format currency
    formatCurrency(value) {
        if (!value && value !== 0) return '$0';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    }

    // Format date
    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(date);
    }

    // Format datetime
    formatDateTime(dateTimeString) {
        if (!dateTimeString) return '';
        const date = new Date(dateTimeString);
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric'
        }).format(date);
    }

    // Get status class for styling
    getStatusClass(status) {
        const statusMap = {
            'Completed': 'status-completed',
            'Activated': 'status-active',
            'Draft': 'status-draft',
            'Pending': 'status-pending'
        };
        return statusMap[status] || 'status-default';
    }

    // Navigation handlers
    handleViewAllProperties() {
        this[NavigationMixin.Navigate]({
            type: 'standard__namedPage',
            attributes: {
                pageName: 'my-properties'
            }
        });
    }

    handleViewCart() {
        this.pageReference = {
            type: 'comm__namedPage',
            attributes: {
                name: 'cartDetailsPage__c'
            }
        };
        this[NavigationMixin.Navigate](this.pageReference);
    }

    handleViewOrders() {
        this.pageReference = {
            type: 'comm__namedPage',
            attributes: {
                name: 'myProfile__c'
            }
        };
        this[NavigationMixin.Navigate](this.pageReference);
    }

    handleViewWishlist() {
        this.pageReference = {
            type: 'comm__namedPage',
            attributes: {
                name: 'myProfile__c'
            }
        };
        this[NavigationMixin.Navigate](this.pageReference);
    }

    handlePropertyClick(event) {
        const propertyId = event.currentTarget.dataset.id;
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

    handleOrderClick(event) {
        const orderId = event.currentTarget.dataset.id;
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: 'orderDetails__c'
            },
            state: {
                c__recordId: orderId
            }
        });
    }

    handleRefresh() {
        this.isLoading = true;
        // Force refresh by resetting the wire
        return refreshApex(this.wiredMetricsResult);
    }

    // Show error toast
    showErrorToast(title, message) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: 'error'
            })
        );
    }
}