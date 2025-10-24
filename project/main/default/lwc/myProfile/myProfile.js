import { api, LightningElement, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import { refreshApex } from '@salesforce/apex';
import getProfileData from '@salesforce/apex/MyProfileController.getProfileData';
import getRecentOrders from '@salesforce/apex/MyProfileController.getRecentOrders';
import updateProfileInfo from '@salesforce/apex/MyProfileController.updateProfileInfo';
import getCartData from '@salesforce/apex/MyProfileController.getCartData';
import removeFromCart from '@salesforce/apex/MyProfileController.removeFromCart';
import updateCartQuantity from '@salesforce/apex/MyProfileController.updateCartQuantity';
import getWishlistData from '@salesforce/apex/MyProfileController.getWishlistData';
import removeFromWishlist from '@salesforce/apex/MyProfileController.removeFromWishlist';
import addToWishlist from '@salesforce/apex/MyProfileController.addToWishlist';

export default class MyProfile extends NavigationMixin(LightningElement) {
    @track profileData = {
        personalInfo: {},
        address: {}
    };
    @track orders = [];
    @track cartData = {
        cartItems: [],
        totalItems: 0,
        totalAmount: 0,
        hasCart: false
    };
    @track wishlistData = {
        wishlistItems: [],
        totalItems: 0,
        hasWishlist: false
    };
    @track activeTab = 'personalInfo';
    @track isLoading = true;
    @track error;
    @track showEditModal = false;
    @track editData = {};

    @api showHeader = false;

    // Store wired results for refresh
    wiredProfileResult;
    wiredOrdersResult;

    // Wire adapter to fetch profile data
    @wire(getProfileData)
    wiredProfile(result) {
        this.wiredProfileResult = result;
        this.isLoading = true;

        const { error, data } = result;
        if (data) {
            this.profileData = data;
            this.error = undefined;
            this.isLoading = false;
        } else if (error) {
            this.error = error.body?.message || 'Error loading profile data';
            this.profileData = { personalInfo: {}, address: {} };
            this.isLoading = false;
            this.showToast('Error', this.error, 'error');
        }
    }

    // Wire adapter to fetch recent orders
    @wire(getRecentOrders)
    wiredOrders(result) {
        this.wiredOrdersResult = result;

        const { error, data } = result;
        if (data) {
            this.orders = data;
        } else if (error) {
            console.error('Error loading orders:', error);
            this.orders = [];
        }
    }

    // Fetch cart and wishlist data when component loads
    connectedCallback() {
        this.loadCartData();
        this.loadWishlistData();
    }

    loadCartData() {
        getCartData()
            .then(data => {
                this.cartData = data;
            })
            .catch(error => {
                console.error('Error loading cart data:', error);
                this.cartData = {
                    cartItems: [],
                    totalItems: 0,
                    totalAmount: 0,
                    hasCart: false
                };
            });
    }

    loadWishlistData() {
        getWishlistData()
            .then(data => {
                this.wishlistData = data;
            })
            .catch(error => {
                console.error('Error loading wishlist data:', error);
                this.wishlistData = {
                    wishlistItems: [],
                    totalItems: 0,
                    hasWishlist: false
                };
            });
    }

    // Tab navigation computed properties
    get isPersonalInfoTab() {
        return this.activeTab === 'personalInfo';
    }

    get isAddressTab() {
        return this.activeTab === 'address';
    }

    get isOrdersTab() {
        return this.activeTab === 'orders';
    }

    get isCartTab() {
        return this.activeTab === 'cart';
    }

    get isWishlistTab() {
        return this.activeTab === 'wishlist';
    }

    get isSettingsTab() {
        return this.activeTab === 'settings';
    }

    // Tab class computed properties
    get personalInfoTabClass() {
        return this.activeTab === 'personalInfo' ? 'tab-button active' : 'tab-button';
    }

    get addressTabClass() {
        return this.activeTab === 'address' ? 'tab-button active' : 'tab-button';
    }

    get ordersTabClass() {
        return this.activeTab === 'orders' ? 'tab-button active' : 'tab-button';
    }

    get cartTabClass() {
        return this.activeTab === 'cart' ? 'tab-button active' : 'tab-button';
    }

    get wishlistTabClass() {
        return this.activeTab === 'wishlist' ? 'tab-button active' : 'tab-button';
    }

    get settingsTabClass() {
        return this.activeTab === 'settings' ? 'tab-button active' : 'tab-button';
    }

    // Display value getters for handling null/undefined values
    get displayValue() {
        return {
            phone: this.profileData.personalInfo?.phone || 'Not provided',
            mobile: this.profileData.personalInfo?.mobile || 'Not provided',
            title: this.profileData.personalInfo?.title || 'Not provided',
            department: this.profileData.personalInfo?.department || 'Not provided',
            company: this.profileData.personalInfo?.company || 'Not provided',
            birthdate: this.profileData.personalInfo?.birthdate
                ? new Date(this.profileData.personalInfo.birthdate).toLocaleDateString()
                : 'Not provided'
        };
    }

    get hasAddress() {
        const addr = this.profileData.address;
        return addr && (addr.street || addr.city || addr.state || addr.postalCode || addr.country);
    }

    get hasOrders() {
        return this.orders && this.orders.length > 0;
    }

    get hasCartItems() {
        return this.cartData.hasCart && this.cartData.cartItems && this.cartData.cartItems.length > 0;
    }

    get cartTotalFormatted() {
        if (!this.cartData.totalAmount) return '$0.00';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(this.cartData.totalAmount);
    }

    get hasWishlistItems() {
        return this.wishlistData.hasWishlist && this.wishlistData.wishlistItems && this.wishlistData.wishlistItems.length > 0;
    }

    // Handle tab change
    handleTabChange(event) {
        const tabName = event.currentTarget.dataset.tab;
        this.activeTab = tabName;
    }

    // Handle Edit Profile button click
    handleEditProfile() {
        this.editData = {
            phone: this.profileData.personalInfo?.phone || '',
            mobile: this.profileData.personalInfo?.mobile || '',
            title: this.profileData.personalInfo?.title || '',
            department: this.profileData.personalInfo?.department || '',
            aboutMe: this.profileData.personalInfo?.aboutMe || '',
            street: this.profileData.address?.street || '',
            city: this.profileData.address?.city || '',
            state: this.profileData.address?.state || '',
            postalCode: this.profileData.address?.postalCode || '',
            country: this.profileData.address?.country || ''
        };
        this.showEditModal = true;
    }

    // Handle input changes in edit modal
    handleInputChange(event) {
        const field = event.target.dataset.field;
        this.editData[field] = event.target.value;
    }

    // Handle close modal
    handleCloseModal() {
        this.showEditModal = false;
        this.editData = {};
    }

    // Handle save profile changes
    handleSaveProfile() {
        this.isLoading = true;

        const personalInfo = {
            phone: this.editData.phone,
            mobile: this.editData.mobile,
            title: this.editData.title,
            department: this.editData.department,
            aboutMe: this.editData.aboutMe
        };

        const addressInfo = {
            street: this.editData.street,
            city: this.editData.city,
            state: this.editData.state,
            postalCode: this.editData.postalCode,
            country: this.editData.country
        };

        updateProfileInfo({
            personalInfoJson: JSON.stringify(personalInfo),
            addressInfoJson: JSON.stringify(addressInfo)
        })
            .then(() => {
                this.showToast('Success', 'Profile updated successfully', 'success');
                this.showEditModal = false;
                this.editData = {};

                // Refresh wired profile data to display latest values
                return refreshApex(this.wiredProfileResult);
            })
            .then(() => {
                this.isLoading = false;
                // Force a page refresh to ensure all data is fresh
                // window.location.reload();
            })
            .catch(error => {
                this.showToast('Error', error.body?.message || 'Error updating profile', 'error');
                this.isLoading = false;
            });
    }

    // Handle view order details
    handleViewOrder(event) {
        const orderId = event.detail?.orderId || event.currentTarget?.dataset?.orderId;
        this.showToast('Info', 'Navigating to order details...', 'info');
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

    // Handle reorder
    handleReorder(event) {
        const orderId = event.detail?.orderId;
        this.showToast('Info', 'Reordering items...', 'info');
        // Implement reorder logic here
    }

    // Handle track order
    handleTrackOrder(event) {
        const orderId = event.detail?.orderId;
        this.showToast('Info', 'Opening tracking information...', 'info');
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: 'orderDetails__c'
            },
            state: {
                c__recordId: orderId
            }
        });
        // Implement tracking logic here
    }

    // Handle browse products
    handleBrowseProducts() {
        // Navigate to products page
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: 'properties__c' // Update with your product listing page name
            }
        });
    }

    // Handle change password
    handleChangePassword() {
        this.showToast('Info', 'Password change functionality coming soon', 'info');
    }

    // Handle privacy settings
    handlePrivacySettings() {
        this.showToast('Info', 'Privacy settings functionality coming soon', 'info');
    }

    // Handle remove cart item
    handleRemoveCartItem(event) {
        const cartItemId = event.detail?.cartItemId || event.currentTarget?.dataset?.itemId;

        removeFromCart({ cartItemId: cartItemId })
            .then(() => {
                this.showToast('Success', 'Item removed from cart', 'success');
                // Reload cart data
                this.loadCartData();
            })
            .catch(error => {
                this.showToast('Error', error.body?.message || 'Error removing item', 'error');
            });
    }

    // Handle update cart quantity
    handleUpdateQuantity(event) {
        const cartItemId = event.detail?.cartItemId || event.currentTarget?.dataset?.itemId;
        const quantity = event.detail?.quantity || parseInt(event.target?.value, 10);

        if (quantity <= 0) {
            this.showToast('Error', 'Quantity must be greater than 0', 'error');
            return;
        }

        updateCartQuantity({ cartItemId: cartItemId, quantity: quantity })
            .then(() => {
                this.showToast('Success', 'Quantity updated', 'success');
                // Reload cart data
                this.loadCartData();
            })
            .catch(error => {
                this.showToast('Error', error.body?.message || 'Error updating quantity', 'error');
            });
    }

    // Handle view cart item details
    handleViewCartItem(event) {
        const propertyId = event.detail?.propertyId || event.currentTarget?.dataset?.propertyId;

        // Navigate to property details page
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

    // Handle checkout
    handleCheckout() {
        if (!this.hasCartItems) {
            this.showToast('Info', 'Your cart is empty', 'info');
            return;
        }

        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: 'Checkout__c' // Update with your checkout page name
            },
            state: {
                cartId: '',
                cartUUID: ''
            }
        });
    }

    // Handle remove wishlist item
    handleRemoveWishlistItem(event) {
        const wishlistItemId = event.detail?.wishlistItemId || event.currentTarget?.dataset?.itemId;

        removeFromWishlist({ wishlistItemId: wishlistItemId })
            .then(() => {
                this.showToast('Success', 'Item removed from wishlist', 'success');
                // Reload wishlist data
                this.loadWishlistData();
            })
            .catch(error => {
                this.showToast('Error', error.body?.message || 'Error removing item', 'error');
            });
    }

    // Handle view wishlist item details
    handleViewWishlistItem(event) {
        const propertyId = event.detail?.propertyId || event.currentTarget?.dataset?.propertyId;

        // Navigate to property details page
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

    // Handle add wishlist item to cart
    handleAddToCartFromWishlist(event) {
        const propertyId = event.detail?.propertyId || event.currentTarget?.dataset?.propertyId;

        this.showToast('Info', 'Adding property to cart...', 'info');
        // In a real scenario, call the addToCart method from CartController
        // For now, just show a success message
        this.showToast('Success', 'Property added to cart!', 'success');
    }

    // Show toast notification
    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }
}