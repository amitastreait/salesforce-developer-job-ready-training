import { LightningElement, api } from 'lwc';

export default class CartDisplay extends LightningElement {
    @api cartItems = [];
    @api totalItems = 0;
    @api totalAmount = 0;

    get hasCartItems() {
        console.log('cartItems', JSON.stringify(this.cartItems));
        return this.cartItems && this.cartItems.length > 0;
    }

    get cartTotalFormatted() {
        if (!this.totalAmount) return '$0.00';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(this.totalAmount);
    }

    handleUpdateQuantity(event) {
        const cartItemId = event.currentTarget.dataset.itemId;
        const quantity = parseInt(event.target.value, 10);

        const updateEvent = new CustomEvent('updatequantity', {
            detail: { cartItemId, quantity }
        });
        this.dispatchEvent(updateEvent);
    }

    handleViewCartItem(event) {
        const propertyId = event.currentTarget.dataset.propertyId;

        const viewEvent = new CustomEvent('viewcartitem', {
            detail: { propertyId }
        });
        this.dispatchEvent(viewEvent);
    }

    handleRemoveCartItem(event) {
        const cartItemId = event.currentTarget.dataset.itemId;

        const removeEvent = new CustomEvent('removecartitem', {
            detail: { cartItemId }
        });
        this.dispatchEvent(removeEvent);
    }

    handleCheckout(event) {
        const cartItemId = event.currentTarget?.dataset?.itemId || '';
        const checkoutEvent = new CustomEvent('checkout', {
            detail: { cartItemId }
        });
        this.dispatchEvent(checkoutEvent);
    }

    handleBrowseProducts() {
        const browseEvent = new CustomEvent('browseproducts');
        this.dispatchEvent(browseEvent);
    }
}
