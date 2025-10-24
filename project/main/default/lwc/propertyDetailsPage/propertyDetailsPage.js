import { LightningElement, api, track, wire } from 'lwc';
import { NavigationMixin, CurrentPageReference } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { publish, MessageContext } from 'lightning/messageService';
import CART_CHANGED_CHANNEL from '@salesforce/messageChannel/CartChanged__c';
import getPropertyDetails from '@salesforce/apex/PropertyController.getPropertyDetails';
import addToCart from '@salesforce/apex/CartController.addToCart';
import getCartSummary from '@salesforce/apex/CartController.getCartSummary';
import getUserWishlist from '@salesforce/apex/WishlistController.getUserWishlist';
import createWishlist from '@salesforce/apex/WishlistController.createWishlist';
import addToWishlist from '@salesforce/apex/WishlistController.addToWishlist';
import createPropertyInquiry from '@salesforce/apex/PropertyController.createPropertyInquiry';
import getCurrentUserInfo from '@salesforce/apex/PropertyController.getCurrentUserInfo';
import createAppointment from '@salesforce/apex/PropertyController.createAppointment';

export default class PropertyDetailsPage extends NavigationMixin(LightningElement) {
    @api recordId;

    currentImageIndex = 0;
    showInquiryModal = false;
    showScheduleModal = false;
    isAddingToCart = false;
    showWishlistNameModal = false;
    isAddingToWishlist = false;
    currentWishlistId = null;

    propertyData;
    propertyError;
    isLoading = true;

    // User information
    userInfo;
    userInfoError;

    @wire(MessageContext)
    messageContext;

    @wire(CurrentPageReference)
    setPageReference(pageRef){
        if(pageRef){
            this.recordId = pageRef?.state?.c__recordId;
        }
    }

    // Wire adapter to fetch current user info
    @wire(getCurrentUserInfo)
    wiredUserInfo({ error, data }) {
        if (data) {
            this.userInfo = data;
            this.userInfoError = undefined;
        } else if (error) {
            this.userInfoError = error;
            this.userInfo = undefined;
            console.error('Error fetching user info:', error);
        }
    }

    // Wire adapter to fetch property details
    @wire(getPropertyDetails, { propertyId: '$recordId' })
    wiredPropertyDetails({ error, data }) {
        this.isLoading = true;
        console.log('Property details: ', data);
        if (data) {
            this.propertyData = data;
            this.propertyError = undefined;
            this.isLoading = false;
        } else if (error) {
            this.propertyError = error;
            this.propertyData = undefined;
            this.isLoading = false;
            this.showToast('Error', 'Failed to load property details', 'error');
        }
    }

    // Getter to access property object from wire data
    get property() {
        if (!this.propertyData || !this.propertyData.property) {
            return null;
        }
        return this.propertyData.property;
    }

    // Getter for property images
    get images() {
        if (!this.propertyData || !this.propertyData.images) {
            return [];
        }
        return this.propertyData.images.map(img => ({
            id: img.Id,
            url: img.Image_Url__c,
            alt: img.Name,
            type: img.Type__c
        }));
    }

    // Getter for property amenities
    get amenities() {
        if (!this.propertyData || !this.propertyData.amenities) {
            return [];
        }
        return this.propertyData.amenities.map(amenity => ({
            id: amenity.Id,
            name: amenity.Amenities__r?.Name || amenity.Name,
            description: amenity.Description__c,
            available: amenity.Active__c
        }));
    }

    // Getter for property features
    get features() {
        if (!this.propertyData || !this.propertyData.features) {
            return [];
        }
        return this.propertyData.features.map(feature => ({
            id: feature.Id,
            name: feature.Feature__r?.Name || feature.Name,
            description: feature.Description__c
        }));
    }

    // Getter for location information
    get location() {
        if (!this.property || !this.property.Location_Site__r) {
            return null;
        }
        return this.property.Location_Site__r;
    }


    // Handle carousel image change
    handleImageChange(event) {
        const { image, index, total } = event.detail;
        // console.log(`Image changed to ${index + 1} of ${total}`);
        // Optional: Track analytics, update external state, etc.
    }

    // Handle carousel image click
    handleImageClick(event) {
        const { image, index } = event.detail;
        // console.log('Image clicked:', image);
        // Optional: Open lightbox/modal with full-size image
    }

    get formattedPrice() {
        if (!this.property || !this.property.Listing_price__c) return '$0';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: this.property.CurrencyIsoCode || 'USD',
            minimumFractionDigits: 0
        }).format(this.property.Listing_price__c);
    }

    get formattedAddress() {
        if (!this.property) return '';
        const address = this.property.Address__c || '';
        const city = this.location?.City__c || '';
        const state = this.location?.State__c || '';
        const zip = this.location?.ZIPPostal_code__c || '';
        return `${address}${city ? ', ' + city : ''}${state ? ', ' + state : ''}${zip ? ' ' + zip : ''}`;
    }

    get statusClass() {
        if (!this.property) return 'property-status-badge';
        const statusMap = {
            'Available': 'status-available',
            'Under Contract': 'status-under-contract',
            'Sold': 'status-sold',
            'Pending': 'status-pending'
        };
        return `property-status-badge ${statusMap[this.property.Status__c] || ''}`;
    }

    get pricePerSqFt() {
        if (!this.property || !this.property.Price_Per_SqFt__c) return '$0';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: this.property.CurrencyIsoCode || 'USD',
            minimumFractionDigits: 0
        }).format(this.property.Price_Per_SqFt__c);
    }

    // Property details getters
    get propertyName() {
        return this.property?.Name || '';
    }

    get propertyType() {
        return this.property?.Property_Type__c || '';
    }

    get propertyStatus() {
        return this.property?.Status__c || '';
    }

    get bedrooms() {
        return this.property?.Bedrooms__c || 0;
    }

    get bathrooms() {
        return this.property?.Bathrooms__c || 0;
    }

    get squareFeet() {
        return this.property?.Square_footage__c || 0;
    }

    get lotSize() {
        return this.property?.Lot_size__c || 0;
    }

    get yearBuilt() {
        return this.property?.Built_Year__c || '';
    }

    get description() {
        return this.property?.Description__c || '';
    }

    get hasProperty() {
        return this.property !== null && this.property !== undefined;
    }

    get hasImages() {
        return this.images && this.images.length > 0;
    }

    get hasFeatures() {
        return this.features && this.features.length > 0;
    }

    get hasAmenities() {
        return this.amenities && this.amenities.length > 0;
    }
    
    handleBack() {
        this.pageReference = {
            type: 'comm__namedPage',
            attributes: {
                name: 'properties__c'
            }
        };
        this[NavigationMixin.Navigate](this.pageReference);
    }

    handleScheduleViewing() {
        this.showScheduleModal = true;
    }

    handleSubmitInquiry() {
        this.showInquiryModal = true;
    }

    handleMakeOffer() {
        this.showToast('Info', 'Navigating to offer form...', 'info');
    }

    handleContactAgent() {
        if (this.property?.PrimaryAgent__c) {
            this.showToast('Info', 'Contacting agent...', 'info');
            // In real scenario: Navigate to agent detail or initiate contact
        } else {
            this.showToast('Info', 'No agent assigned to this property', 'info');
        }
    }

    handleShareProperty() {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            this.showToast('Success', 'Property link copied to clipboard!', 'success');
        }).catch(() => {
            this.showToast('Error', 'Failed to copy link', 'error');
        });
    }

    handleSaveFavorite() {
        if (!this.recordId) {
            this.showToast('Error', 'Property ID not found', 'error');
            return;
        }

        if (this.isAddingToWishlist) {
            return; // Prevent duplicate clicks
        }

        this.isAddingToWishlist = true;

        // First, check if user has a wishlist
        getUserWishlist()
            .then(result => {
                if (result.exists) {
                    // User has a wishlist, try to add property
                    this.currentWishlistId = result.wishlistId;
                    return this.addPropertyToWishlist(result.wishlistId);
                } else {
                    // No wishlist exists, show modal to create one
                    this.showWishlistNameModal = true;
                    this.isAddingToWishlist = false;
                }
            })
            .catch(error => {
                console.error('Error checking wishlist:', error);
                const errorMessage = error.body?.message || error.message || 'Failed to check wishlist';
                this.showToast('Error', errorMessage, 'error');
                this.isAddingToWishlist = false;
            });
    }

    addPropertyToWishlist(wishlistId) {
        return addToWishlist({
            propertyId: this.recordId,
            wishlistId: wishlistId
        })
            .then(result => {
                if (result.success) {
                    this.showToast('Success', 'Property added to wishlist!', 'success');
                } else if (result.alreadyExists) {
                    this.showToast('Info', 'Property is already in your wishlist', 'info');
                } else {
                    this.showToast('Error', result.message || 'Failed to add to wishlist', 'error');
                }
                this.isAddingToWishlist = false;
            })
            .catch(error => {
                console.error('Error adding to wishlist:', error);
                const errorMessage = error.body?.message || error.message || 'Failed to add to wishlist';
                this.showToast('Error', errorMessage, 'error');
                this.isAddingToWishlist = false;
            });
    }

    handleCloseWishlistModal() {
        this.showWishlistNameModal = false;
        this.isAddingToWishlist = false;
    }

    handleCreateWishlist(event) {
        const wishlistName = event.detail.wishlistName;

        createWishlist({ wishlistName: wishlistName })
            .then(result => {
                if (result.success) {
                    this.showToast('Success', 'Wishlist created successfully!', 'success');
                    this.currentWishlistId = result.wishlistId;
                    this.showWishlistNameModal = false;

                    // Now add the property to the newly created wishlist
                    return this.addPropertyToWishlist(result.wishlistId);
                } else {
                    throw new Error(result.message || 'Failed to create wishlist');
                }
            })
            .catch(error => {
                console.error('Error creating wishlist:', error);
                const errorMessage = error.body?.message || error.message || 'Failed to create wishlist';

                // Show error in modal
                const modal = this.template.querySelector('c-wishlist-name-modal');
                if (modal) {
                    modal.setError(errorMessage);
                } else {
                    this.showToast('Error', errorMessage, 'error');
                    this.showWishlistNameModal = false;
                    this.isAddingToWishlist = false;
                }
            });
    }

    handleAddToCart() {
        if (!this.recordId) {
            this.showToast('Error', 'Property ID not found', 'error');
            return;
        }

        this.isAddingToCart = true;

        // Call Apex method to add property to cart
        addToCart({ propertyId: this.recordId, quantity: 1 })
            .then(result => {
                if (result.success) {
                    this.showToast('Success', 'Property added to cart successfully!', 'success');

                    // Get updated cart summary
                    return getCartSummary();
                } else {
                    throw new Error(result.message || 'Failed to add property to cart');
                }
            })
            .then(cartSummary => {
                // Publish message to update cart UI via Lightning Message Service
                if (cartSummary) {
                    const message = {
                        cartId: cartSummary.cartId,
                        itemCount: cartSummary.itemCount || 0,
                        totalAmount: cartSummary.totalAmount || 0,
                        action: 'add'
                    };
                    publish(this.messageContext, CART_CHANGED_CHANNEL, message);
                }
            })
            .catch(error => {
                console.error('Error adding to cart:', error);
                const errorMessage = error.body?.message || error.message || 'Failed to add property to cart';
                this.showToast('Error', errorMessage, 'error');
            })
            .finally(() => {
                this.isAddingToCart = false;
            });
    }

    handleCloseScheduleModal() {
        this.showScheduleModal = false;
    }
    handleScheduleViewingSubmit(event) {
        const viewingData = event.detail;
        console.log('Viewing Data:', viewingData);

        // Combine date and time into a DateTime string
        const dateTimeString = viewingData.date + ' ' + viewingData.time + ':00';

        // Call Apex to create Appointment__c record
        createAppointment({
            propertyId: this.recordId,
            appointmentDateTime: dateTimeString,
            name: viewingData.name,
            phone: viewingData.phone
        })
            .then(result => {
                if (result.success) {
                    this.showToast('Success', 'Viewing scheduled successfully!', 'success');
                    this.showScheduleModal = false;
                } else {
                    this.showToast('Error', result.message || 'Failed to schedule viewing', 'error');
                }
            })
            .catch(error => {
                console.error('Error scheduling viewing:', error);
                const errorMessage = error.body?.message || error.message || 'Failed to schedule viewing';
                this.showToast('Error', errorMessage, 'error');
            });
    }

    handleCloseInquiryModal() {
        this.showInquiryModal = false;
    }

    handleInquirySubmit(event) {
        const inquiryData = event.detail;
        console.log('Inquiry Data:', inquiryData);

        // Call Apex to create PropertyInquiry__c record
        createPropertyInquiry({
            propertyId: this.recordId,
            name: inquiryData.name,
            email: inquiryData.email,
            phone: inquiryData.phone || '',
            message: inquiryData.message
        })
            .then(result => {
                if (result.success) {
                    this.showToast('Success', 'Inquiry submitted successfully!', 'success');
                    this.showInquiryModal = false;
                } else {
                    this.showToast('Error', result.message || 'Failed to submit inquiry', 'error');
                }
            })
            .catch(error => {
                console.error('Error submitting inquiry:', error);
                const errorMessage = error.body?.message || error.message || 'Failed to submit inquiry';
                this.showToast('Error', errorMessage, 'error');
            });
    }

    /* validateViewingForm() {
        if (!this.viewingForm.date || !this.viewingForm.time || 
            !this.viewingForm.name || !this.viewingForm.phone) {
            this.showToast('Error', 'Please fill all required fields', 'error');
            return false;
        }
        return true;
    } */

    /* validateInquiryForm() {
        if (!this.inquiryForm.name || !this.inquiryForm.email || 
            !this.inquiryForm.message) {
            this.showToast('Error', 'Please fill all required fields', 'error');
            return false;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.inquiryForm.email)) {
            this.showToast('Error', 'Please enter a valid email', 'error');
            return false;
        }
        return true;
    } */

    resetViewingForm() {
        this.viewingForm = { date: '', time: '', name: '', phone: '' };
    }

    resetInquiryForm() {
        this.inquiryForm = { name: '', email: '', phone: '', message: '' };
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        }));
    }
}