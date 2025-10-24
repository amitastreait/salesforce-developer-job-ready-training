import { LightningElement, api } from 'lwc';

export default class WishlistNameModal extends LightningElement {
    @api isOpen = false;

    wishlistName = '';
    errorMessage = '';
    isCreating = false;

    handleNameChange(event) {
        this.wishlistName = event.target.value;
        this.errorMessage = '';
    }

    handleClose() {
        this.wishlistName = '';
        this.errorMessage = '';
        this.isCreating = false;
        this.dispatchEvent(new CustomEvent('close'));
    }

    handleCreate() {
        if (!this.wishlistName || this.wishlistName.trim() === '') {
            this.errorMessage = 'Please enter a wishlist name';
            return;
        }

        if (this.wishlistName.trim().length < 2) {
            this.errorMessage = 'Wishlist name must be at least 2 characters';
            return;
        }

        this.isCreating = true;
        this.errorMessage = '';

        // Dispatch event with wishlist name
        this.dispatchEvent(new CustomEvent('create', {
            detail: {
                wishlistName: this.wishlistName.trim()
            }
        }));
    }

    @api
    resetForm() {
        this.wishlistName = '';
        this.errorMessage = '';
        this.isCreating = false;
    }

    @api
    setError(message) {
        this.errorMessage = message;
        this.isCreating = false;
    }
}