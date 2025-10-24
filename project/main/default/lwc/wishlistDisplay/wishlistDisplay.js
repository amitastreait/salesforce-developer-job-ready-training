import { LightningElement, api } from 'lwc';

export default class WishlistDisplay extends LightningElement {
    @api wishlistItems = [];
    @api totalItems = 0;

    get hasWishlistItems() {
        return this.wishlistItems && this.wishlistItems.length > 0;
    }

    handleRemoveWishlistItem(event) {
        const wishlistItemId = event.currentTarget.dataset.itemId;

        const removeEvent = new CustomEvent('removewishlistitem', {
            detail: { wishlistItemId }
        });
        this.dispatchEvent(removeEvent);
    }

    handleViewWishlistItem(event) {
        const propertyId = event.currentTarget.dataset.propertyId;
        console.log('Property ID:', propertyId);
        const viewEvent = new CustomEvent('viewwishlistitem', {
            detail: { propertyId }
        });
        this.dispatchEvent(viewEvent);
    }

    handleAddToCartFromWishlist(event) {
        const propertyId = event.currentTarget.dataset.propertyId;

        const addToCartEvent = new CustomEvent('addtocartwishlist', {
            detail: { propertyId }
        });
        this.dispatchEvent(addToCartEvent);
    }

    handleBrowseProducts() {
        const browseEvent = new CustomEvent('browseproducts');
        this.dispatchEvent(browseEvent);
    }
}