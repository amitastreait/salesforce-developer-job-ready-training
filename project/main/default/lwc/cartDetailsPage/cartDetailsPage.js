import { api, LightningElement, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getCartItems from '@salesforce/apex/CartController.getCartItems';
import updateCartItemQuantity from '@salesforce/apex/CartController.updateCartItemQuantity';
import removeCartItem from '@salesforce/apex/CartController.removeCartItem';
import clearCart from '@salesforce/apex/CartController.clearCart';
import { publish, MessageContext } from 'lightning/messageService';
// import CART_CHANGED_CHANNEL from '@salesforce/messageChannel/CartChanged__c';

export default class CartDetailsPage extends NavigationMixin(LightningElement) {
    cartItems = [];
    isLoading = true;
    error;
    cartSummary = {
        subtotal: 0,
        tax: 0,
        shipping: 0,
        total: 0,
        itemCount: 0
    };

    @api showEmptyCartMessage;

    @wire(MessageContext)
    messageContext;

    connectedCallback() {
        this.loadCartItems();
    }

    // Load all cart items
    loadCartItems() {
        this.isLoading = true;
        getCartItems()
            .then(result => {
                console.log('Cart Items Result:', result);
                if (result && result.items) {
                    // Map cart items to component format
                    this.cartItems = result.items.map(item => ({
                        id: item.id,
                        propertyId: item.propertyId,
                        productName: item.propertyName,
                        propertyName: item.propertyName,
                        sku: item.name, // Use cart item number as SKU
                        productDescription: item.location,
                        unitPrice: item.propertyPrice,
                        quantity: item.quantity,
                        totalPrice: item.total,
                        discount: item.discount || 0,
                        discountPercent: item.discountPercent || 0,
                        imageUrl: item.propertyImage || '/resource/placeholder_product_image',
                        propertyStatus: item.propertyStatus,
                        formattedPrice: this.formatCurrency(item.propertyPrice),
                        formattedTotal: this.formatCurrency(item.total),
                        formattedDiscount: this.formatCurrency(item.discount || 0)
                    }));
                    this.calculateSummary(result);
                } else {
                    this.cartItems = [];
                    this.cartSummary = {
                        subtotal: 0,
                        tax: 0,
                        shipping: 0,
                        total: 0,
                        itemCount: 0
                    };
                }
                this.isLoading = false;
                this.error = undefined;
            })
            .catch(error => {
                console.error('Error loading cart:', error);
                this.error = error;
                this.isLoading = false;
                this.cartItems = [];
                this.showToast('Error', 'Failed to load cart items', 'error');
            });
    }

    // Calculate cart summary from returned data
    calculateSummary(cartData) {
        this.cartSummary = {
            subtotal: cartData.subtotal || 0,
            tax: cartData.tax || 0,
            shipping: cartData.shipping || 0,
            total: cartData.total || 0,
            itemCount: cartData.itemCount || 0,
            cartId: cartData.cartId,
            cartUUID: cartData.cartUUID,
            cartNumber: cartData.cartNumber
        };
    }

    // Handle quantity change
    handleQuantityChange(event) {
        const itemId = event.target.dataset.itemId;
        const newQuantity = parseInt(event.target.value, 10);

        if (newQuantity < 1) {
            this.showToast('Error', 'Quantity must be at least 1', 'error');
            return;
        }

        this.updateQuantity(itemId, newQuantity);
    }

    // Handle quantity increment
    handleIncrement(event) {
        const itemId = event.currentTarget.dataset.itemId;
        const currentItem = this.cartItems.find(item => item.id === itemId);
        if (currentItem) {
            this.updateQuantity(itemId, currentItem.quantity + 1);
        }
    }

    // Handle quantity decrement
    handleDecrement(event) {
        const itemId = event.currentTarget.dataset.itemId;
        const currentItem = this.cartItems.find(item => item.id === itemId);
        if (currentItem && currentItem.quantity > 1) {
            this.updateQuantity(itemId, currentItem.quantity - 1);
        }
    }

    // Update item quantity
    updateQuantity(itemId, quantity) {
        updateCartItemQuantity({ cartItemId: itemId, quantity: quantity })
            .then(() => {
                this.loadCartItems();
                this.publishCartChange();
                this.showToast('Success', 'Cart updated', 'success');
            })
            .catch(error => {
                this.showToast('Error', 'Failed to update quantity', 'error');
                console.error(error);
            });
    }

    // Handle remove item
    handleRemoveItem(event) {
        const itemId = event.currentTarget.dataset.itemId;
        
        removeCartItem({ cartItemId: itemId })
            .then(() => {
                this.loadCartItems();
                this.publishCartChange();
                this.showToast('Success', 'Item removed from cart', 'success');
            })
            .catch(error => {
                this.showToast('Error', 'Failed to remove item', 'error');
                console.error(error);
            });
    }

    // Handle clear cart
    handleClearCart() {
        if (confirm('Are you sure you want to clear your cart?')) {
            clearCart()
                .then(() => {
                    this.loadCartItems();
                    this.publishCartChange();
                    this.showToast('Success', 'Cart cleared', 'success');
                })
                .catch(error => {
                    this.showToast('Error', 'Failed to clear cart', 'error');
                    console.error(error);
                });
        }
    }

    // Handle continue shopping
    handleContinueShopping() {
        this.pageReference = {
            type: 'comm__namedPage',
            attributes: {
                name: 'properties__c'
            }
        };
        this[NavigationMixin.Navigate](this.pageReference);
    }

    // Handle checkout
    handleCheckout() {
        if (!this.hasCartItems) {
            this.showToast('Info', 'Your cart is empty', 'info');
            return;
        }

        // Navigate to checkout page
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: 'Checkout__c' // Update with your checkout page name
            },
            state: {
                cartId: this.cartSummary.cartId,
                cartUUID: this.cartSummary.cartUUID
            }
        });
    }

    // Publish cart change event
    publishCartChange() {
        const message = {
            cartUpdated: true,
            timestamp: new Date().getTime()
        };
        // publish(this.messageContext, CART_CHANGED_CHANNEL, message);
    }

    // Format currency
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount || 0);
    }

    // Show toast notification
    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(evt);
    }

    // Getters for template
    get hasCartItems() {
        return this.cartItems && this.cartItems.length > 0;
    }

    get formattedSubtotal() {
        return this.formatCurrency(this.cartSummary.subtotal);
    }

    get formattedTax() {
        return this.formatCurrency(this.cartSummary.tax);
    }

    get formattedShipping() {
        return this.formatCurrency(this.cartSummary.shipping);
    }

    get formattedTotal() {
        return this.formatCurrency(this.cartSummary.total);
    }

    get cartItemsCount() {
        return this.cartSummary.itemCount;
    }

    get cartNumber() {
        return this.cartSummary.cartNumber || '';
    }

    get showDiscount() {
        return this.cartItems.some(item => item.discount > 0);
    }
}