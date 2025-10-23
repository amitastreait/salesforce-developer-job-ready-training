import { api, LightningElement, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import isGuest from '@salesforce/user/isGuest';
import userId from '@salesforce/user/Id';
import getCartSummary from '@salesforce/apex/CartController.getCartSummary';
import { subscribe, unsubscribe, APPLICATION_SCOPE, MessageContext } from 'lightning/messageService';
import CART_CHANGED_CHANNEL from '@salesforce/messageChannel/CartChanged__c';

import RealityForceLogo from '@salesforce/resourceUrl/RealityForceLogo';
// Example :- import TRAILHEAD_LOGO from '@salesforce/resourceUrl/trailhead_logo';

export default class StickyHeader extends NavigationMixin(LightningElement) {
    isGuestUser = isGuest;
    currentUserId = userId;
    cartItemCount = 0;
    cartTotalAmount = 0;
    subscription = null;
    logoImage = RealityForceLogo;

    @api headerTitle = 'RealtyForce';

    @wire(MessageContext)
    messageContext;

    connectedCallback() {
        this.loadCartSummary();
        this.subscribeToMessageChannel();
    }

    disconnectedCallback() {
        this.unsubscribeFromMessageChannel();
    }

    // Load cart summary
    loadCartSummary() {
        if (!this.isGuestUser) {
            getCartSummary()
                .then(result => {
                    if (result) {
                        this.cartItemCount = result.itemCount || 0;
                        this.cartTotalAmount = result.totalAmount || 0;
                    }
                })
                .catch(error => {
                    console.error('Error loading cart summary:', error);
                });
        }
    }

    // Subscribe to Lightning Message Service
    subscribeToMessageChannel() {
        if (!this.subscription) {
            this.subscription = subscribe(
                this.messageContext,
                CART_CHANGED_CHANNEL,
                (message) => this.handleCartChanged(message),
                { scope: APPLICATION_SCOPE }
            );
        }
    }

    // Unsubscribe from Lightning Message Service
    unsubscribeFromMessageChannel() {
        if (this.subscription) {
            unsubscribe(this.subscription);
            this.subscription = null;
        }
    }

    // Handle cart changed message
    handleCartChanged(message) {
        console.log('Cart changed message received:', message);
        if (message.itemCount !== undefined) {
            this.cartItemCount = message.itemCount;
        }
        if (message.totalAmount !== undefined) {
            this.cartTotalAmount = message.totalAmount;
        }
        // Optionally reload cart summary for the most current data
        // this.loadCartSummary();
    }

    // Navigate to login page
    handleLogin() {
        this[NavigationMixin.Navigate]({
            type: 'comm__loginPage',
            attributes: {
                actionName: 'login'
            }
        });
    }

    handleCartClick() {
        this.pageReference = {
            type: 'comm__namedPage',
            attributes: {
                name: 'cartDetailsPage__c'
            }
        };
        this[NavigationMixin.Navigate](this.pageReference);
    }

    // Navigate to account/profile
    handleUserClick() {
       this.pageReference = {
            type: 'comm__namedPage',
            attributes: {
                name: 'myProfile__c'
            }
        };
        this[NavigationMixin.Navigate](this.pageReference);
    }

    // Getters for UI
    get formattedCartTotal() {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(this.cartTotalAmount);
    }

    get showCartBadge() {
        return this.cartItemCount > 0;
    }

    get cartBadgeLabel() {
        return this.cartItemCount > 99 ? '99+' : this.cartItemCount.toString();
    }
}