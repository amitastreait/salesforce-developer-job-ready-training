import { LightningElement, track, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { publish, MessageContext } from 'lightning/messageService';
import CART_UPDATED_CHANNEL from '@salesforce/messageChannel/Cart_Updated__c';
import getCheckoutData from '@salesforce/apex/CheckoutController.getCheckoutData';
import processCheckout from '@salesforce/apex/CheckoutController.processCheckout';
import validatePayment from '@salesforce/apex/CheckoutController.validatePayment';
import applyPromoCode from '@salesforce/apex/CheckoutController.applyPromoCode';

export default class Checkout extends NavigationMixin(LightningElement) {
    @track checkoutData = {
        items: [],
        subtotal: 0,
        tax: 0,
        taxRate: 0,
        shipping: 0,
        total: 0
    };
    @track shippingInfo = {
        name: '',
        email: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: ''
    };
    @track paymentInfo = {
        cardholderName: '',
        cardNumber: '',
        expiryDate: '',
        cvv: ''
    };

    @track currentStep = 1; // 1: Shipping, 2: Payment, 3: Review
    @track isLoading = true;
    @track error = '';
    @track isProcessing = false;
    @track agreedToTerms = false;
    @track promoCode = '';
    @track promoMessage = '';
    @track promoSuccess = false;
    @track discountPercent = 0;
    @track discountAmount = 0;

    @wire(MessageContext)
    messageContext;

    // Lifecycle hook
    connectedCallback() {
        this.loadCheckoutData();
    }

    // Load checkout data from Apex
    loadCheckoutData() {
        this.isLoading = true;
        getCheckoutData()
            .then(data => {
                this.checkoutData = data;
                // Pre-fill shipping info from user data
                this.shippingInfo.name = data.customerName || '';
                this.shippingInfo.email = data.customerEmail || '';
                this.shippingInfo.phone = data.customerPhone || '';
                this.shippingInfo.street = data.shippingStreet || '';
                this.shippingInfo.city = data.shippingCity || '';
                this.shippingInfo.state = data.shippingState || '';
                this.shippingInfo.postalCode = data.shippingPostalCode || '';
                this.shippingInfo.country = data.shippingCountry || '';
                this.isLoading = false;
                this.error = '';
            })
            .catch(error => {
                this.error = error.body?.message || 'Error loading checkout data';
                this.isLoading = false;
                this.showToast('Error', this.error, 'error');
            });
    }

    // Step indicators
    get isShippingStep() {
        return this.currentStep === 1;
    }

    get isPaymentStep() {
        return this.currentStep === 2;
    }

    get isReviewStep() {
        return this.currentStep === 3;
    }

    get step1Class() {
        return this.currentStep >= 1 ? 'step active' : 'step';
    }

    get step2Class() {
        return this.currentStep >= 2 ? 'step active' : 'step';
    }

    get step3Class() {
        return this.currentStep >= 3 ? 'step active' : 'step';
    }

    // Price calculations
    get finalTotal() {
        let total = this.checkoutData.subtotal + this.calculatedTax + this.checkoutData.shipping;
        if (this.discountAmount > 0) {
            total -= this.discountAmount;
        }
        return total;
    }

    get calculatedTax() {
        let taxableAmount = this.checkoutData.subtotal;
        if (this.discountAmount > 0) {
            taxableAmount -= this.discountAmount;
        }
        return (taxableAmount * this.checkoutData.taxRate) / 100;
    }

    get freeShipping() {
        return this.checkoutData.shipping === 0;
    }

    get maskedCardNumber() {
        if (!this.paymentInfo.cardNumber) return '****';
        const last4 = this.paymentInfo.cardNumber.slice(-4);
        return `**** ${last4}`;
    }

    get promoMessageClass() {
        return this.promoSuccess ? 'promo-message success' : 'promo-message error';
    }

    // Handle form changes
    handleShippingChange(event) {
        const field = event.target.dataset.field;
        this.shippingInfo[field] = event.target.value;
    }

    handlePaymentChange(event) {
        const field = event.target.dataset.field;
        this.paymentInfo[field] = event.target.value;
    }

    handlePromoCodeChange(event) {
        this.promoCode = event.target.value;
    }

    handleTermsChange(event) {
        this.agreedToTerms = event.target.checked;
    }

    // Navigation handlers
    handleBackToCart() {
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: 'my_profile__c'
            },
            state: {
                c__tab: 'cart'
            }
        });
    }

    handleContinueToPayment() {
        // Validate shipping info
        if (!this.validateShippingInfo()) {
            this.showToast('Error', 'Please fill in all shipping information', 'error');
            return;
        }
        this.currentStep = 2;
        this.scrollToTop();
    }

    handleBackToShipping() {
        this.currentStep = 1;
        this.scrollToTop();
    }

    handleContinueToReview() {
        // Validate payment info
        if (!this.validatePaymentInfo()) {
            this.showToast('Error', 'Please fill in all payment information', 'error');
            return;
        }
        this.currentStep = 3;
        this.scrollToTop();
    }

    handleBackToPayment() {
        this.currentStep = 2;
        this.scrollToTop();
    }

    handleEditShipping() {
        this.currentStep = 1;
        this.scrollToTop();
    }

    handleEditPayment() {
        this.currentStep = 2;
        this.scrollToTop();
    }

    // Apply promo code
    handleApplyPromo() {
        if (!this.promoCode) {
            this.showToast('Error', 'Please enter a promo code', 'error');
            return;
        }

        applyPromoCode({ promoCode: this.promoCode })
            .then(result => {
                if (result.success) {
                    this.promoSuccess = true;
                    this.promoMessage = result.message;
                    this.discountPercent = result.discountPercent;
                    this.discountAmount = (this.checkoutData.subtotal * this.discountPercent) / 100;
                    this.showToast('Success', result.message, 'success');
                } else {
                    this.promoSuccess = false;
                    this.promoMessage = result.message;
                    this.discountPercent = 0;
                    this.discountAmount = 0;
                }
            })
            .catch(error => {
                this.promoSuccess = false;
                this.promoMessage = 'Error applying promo code';
                this.showToast('Error', error.body?.message || 'Error applying promo code', 'error');
            });
    }

    // Place order
    handlePlaceOrder() {
        if (!this.agreedToTerms) {
            this.showToast('Error', 'Please agree to the Terms and Conditions', 'error');
            return;
        }

        this.isProcessing = true;

        // First validate payment
        const paymentData = {
            cardNumber: this.paymentInfo.cardNumber,
            cvv: this.paymentInfo.cvv,
            expiryDate: this.paymentInfo.expiryDate
        };

        validatePayment({ paymentDataJson: JSON.stringify(paymentData) })
            .then(paymentResult => {
                if (paymentResult.success) {
                    // Process checkout
                    const checkoutInfo = {
                        ...this.shippingInfo,
                        ...this.paymentInfo,
                        subtotal: this.checkoutData.subtotal,
                        tax: this.calculatedTax,
                        shipping: this.checkoutData.shipping,
                        discount: this.discountAmount,
                        total: this.finalTotal,
                        transactionId: paymentResult.transactionId
                    };

                    return processCheckout({ checkoutDataJson: JSON.stringify(checkoutInfo) });
                } else {
                    throw new Error(paymentResult.message);
                }
            })
            .then(result => {

                if (result.success) {
                    this.showToast('Success', result.message || 'Order placed successfully!', 'success');

                    // Publish cart cleared event to update cart display across components
                    if (result.cartCleared) {
                        this.publishCartClearedEvent();
                    }

                    // Navigate to order detail page or profile
                    setTimeout(() => {
                        this.isProcessing = false;
                        this[NavigationMixin.Navigate]({
                            type: 'comm__namedPage',
                            attributes: {
                                name: 'orderDetails__c'
                            },
                            state: {
                                c__tab: 'orders',
                                c__orderId: result.orderId
                            }
                        });
                    }, 2000); // Wait 2 seconds to show success message
                } else {
                    throw new Error('Checkout failed');
                }
            })
            .catch(error => {
                this.isProcessing = false;
                this.showToast('Error', error.body?.message || error.message || 'Error placing order', 'error');
            })
            .finally(() => {
                this.isProcessing = false;
            });
    }

    // Validation methods
    validateShippingInfo() {
        return (
            this.shippingInfo.name &&
            this.shippingInfo.email &&
            this.shippingInfo.phone &&
            this.shippingInfo.street &&
            this.shippingInfo.city &&
            this.shippingInfo.state &&
            this.shippingInfo.postalCode &&
            this.shippingInfo.country
        );
    }

    validatePaymentInfo() {
        return (
            this.paymentInfo.cardholderName &&
            this.paymentInfo.cardNumber &&
            this.paymentInfo.cardNumber.length >= 13 &&
            this.paymentInfo.expiryDate &&
            this.paymentInfo.cvv &&
            this.paymentInfo.cvv.length >= 3
        );
    }

    // Publish cart cleared event
    publishCartClearedEvent() {
        const payload = {
            cartCleared: true,
            timestamp: new Date().getTime()
        };
        publish(this.messageContext, CART_UPDATED_CHANNEL, payload);
    }

    // Utility methods
    scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        }));
    }
}