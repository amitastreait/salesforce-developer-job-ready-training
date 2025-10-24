import { LightningElement, api, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getOrderDetails from '@salesforce/apex/OrderDetailController.getOrderDetails';

export default class OrderDetail extends NavigationMixin(LightningElement) {
    @api recordId; // Order ID passed from navigation or URL parameter
    @track orderDetail = {
        orderId: '',
        orderNumber: '',
        orderDate: null,
        status: '',
        totalItems: 0,
        subtotal: 0,
        tax: 0,
        taxRate: 0,
        shipping: 0,
        total: 0,
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        shippingStreet: '',
        shippingCity: '',
        shippingState: '',
        shippingPostalCode: '',
        shippingCountry: '',
        items: []
    };
    @track isLoading = true;
    @track error = '';

    // Lifecycle hook
    connectedCallback() {
        // Get orderId from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const orderIdFromUrl = urlParams.get('recordId');

        if (orderIdFromUrl) {
            this.recordId = orderIdFromUrl;
        }

        // Wait a bit to ensure recordId is set
        setTimeout(() => {
            if (this.recordId) {
                this.loadOrderDetails();
            } else {
                this.error = 'No order ID provided';
                this.isLoading = false;
            }
        }, 100);
    }

    // Load order details from Apex
    loadOrderDetails() {
        this.isLoading = true;
        this.error = '';

        getOrderDetails({ orderId: this.recordId })
            .then(data => {
                this.orderDetail = data;
                this.isLoading = false;
            })
            .catch(error => {
                this.error = error.body?.message || 'Error loading order details';
                this.isLoading = false;
                this.showToast('Error', this.error, 'error');
            });
    }

    // Computed properties
    get freeShipping() {
        return this.orderDetail.shipping === 0;
    }

    get hasShippingAddress() {
        return this.orderDetail.shippingStreet ||
               this.orderDetail.shippingCity ||
               this.orderDetail.shippingState;
    }

    // Navigation handlers
    handleBackToOrders() {
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: 'myProfile__c'
            },
            state: {
                c__tab: 'orders'
            }
        });
    }

    handleContinueShopping() {
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: 'Home'
            }
        });
    }

    // Utility method
    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        }));
    }
}