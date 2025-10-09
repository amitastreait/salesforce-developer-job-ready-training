import { LightningElement, api, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class PropertyDetailsPage extends NavigationMixin(LightningElement) {
    @api recordId;
    
    currentImageIndex = 0;
    showInquiryModal = false;
    showScheduleModal = false;
    
    property = {
        id: 'P001',
        name: 'Luxury Waterfront Villa',
        type: 'Villa',
        status: 'Available',
        price: 2500000,
        address: '123 Ocean Drive',
        city: 'Miami Beach',
        state: 'Florida',
        zipCode: '33139',
        country: 'USA',
        bedrooms: 5,
        bathrooms: 4.5,
        squareFeet: 4500,
        lotSize: 8000,
        yearBuilt: 2020,
        description: 'Experience luxury living at its finest in this stunning waterfront villa. This meticulously designed residence offers breathtaking ocean views, premium finishes, and state-of-the-art amenities. The open-concept floor plan seamlessly blends indoor and outdoor living spaces, perfect for entertaining guests or enjoying peaceful family moments. With five spacious bedrooms, four and a half elegant bathrooms, and over 4,500 square feet of living space, this home provides the ultimate in comfort and sophistication.',
        features: [
            { id: 'f1', name: 'Ocean View' },
            { id: 'f2', name: 'Swimming Pool' },
            { id: 'f3', name: 'Private Beach Access' },
            { id: 'f4', name: 'Gourmet Kitchen' },
            { id: 'f5', name: 'Smart Home Technology' },
            { id: 'f6', name: 'Home Theater' },
            { id: 'f7', name: 'Wine Cellar' },
            { id: 'f8', name: 'Three Car Garage' }
        ],
        amenities: [
            { id: 'a1', icon: '🏊', name: 'Swimming Pool', available: true },
            { id: 'a2', icon: '🏋️', name: 'Fitness Center', available: true },
            { id: 'a3', icon: '🚗', name: 'Parking', available: true },
            { id: 'a4', icon: '🔒', name: '24/7 Security', available: true },
            { id: 'a5', icon: '🌳', name: 'Garden', available: true },
            { id: 'a6', icon: '🎾', name: 'Tennis Court', available: false },
            { id: 'a7', icon: '🏖️', name: 'Beach Access', available: true },
            { id: 'a8', icon: '📡', name: 'High Speed Internet', available: true }
        ],
        images: [
            { id: 'img1', url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800', alt: 'Living Room' },
            { id: 'img2', url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', alt: 'Kitchen' },
            { id: 'img3', url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', alt: 'Bedroom' },
            { id: 'img4', url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800', alt: 'Bathroom' },
            { id: 'img5', url: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800', alt: 'Pool' }
        ],
        agent: {
            name: 'Sarah Johnson',
            phone: '(305) 555-0123',
            email: 'sarah.johnson@realty.com'
        },
        rating: 4.8,
        reviewCount: 24
    };

    /* 
        inquiryForm = {
            name: '',
            email: '',
            phone: '',
            message: ''
        };

        viewingForm = {
            date: '',
            time: '',
            name: '',
            phone: ''
        };
    */
    get ratingStars() {
        const stars = [];
        const fullStars = Math.floor(this.property.rating);
        const hasHalfStar = this.property.rating % 1 >= 0.5;
        const emptyStars = 5 - Math.ceil(this.property.rating);

        // Full stars - Use boolean properties
        for (let i = 0; i < fullStars; i++) {
            stars.push({ 
                id: `star-full-${i}`, 
                isFull: true,      // ✅ Boolean property
                isHalf: false, 
                isEmpty: false 
            });
        }

        // Half star
        if (hasHalfStar) {
            stars.push({ 
                id: 'star-half', 
                isFull: false, 
                isHalf: true,      // ✅ Boolean property
                isEmpty: false 
            });
        }

        // Empty stars
        for (let i = 0; i < emptyStars; i++) {
            stars.push({ 
                id: `star-empty-${i}`, 
                isFull: false, 
                isHalf: false, 
                isEmpty: true      // ✅ Boolean property
            });
        }

        return stars;
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
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0
        }).format(this.property.price);
    }

    get formattedAddress() {
        return `${this.property.address}, ${this.property.city}, ${this.property.state} ${this.property.zipCode}`;
    }

    get statusClass() {
        const statusMap = {
            'Available': 'status-available',
            'Under Contract': 'status-under-contract',
            'Sold': 'status-sold',
            'Pending': 'status-pending'
        };
        return `property-status-badge ${statusMap[this.property.status] || ''}`;
    }

    get ratingStars() {
        const stars = [];
        const fullStars = Math.floor(this.property.rating);
        const hasHalfStar = this.property.rating % 1 >= 0.5;
        const emptyStars = 5 - Math.ceil(this.property.rating);

        // Full stars
        for (let i = 0; i < fullStars; i++) {
            stars.push({ id: `star-full-${i}`, type: 'full' });
        }

        // Half star
        if (hasHalfStar) {
            stars.push({ id: 'star-half', type: 'half' });
        }

        // Empty stars
        for (let i = 0; i < emptyStars; i++) {
            stars.push({ id: `star-empty-${i}`, type: 'empty' });
        }

        return stars;
    }

    get pricePerSqFt() {
        const perSqFt = this.property.price / this.property.squareFeet;
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0
        }).format(perSqFt);
    }
    
    handleBack() {
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Property__c',
                actionName: 'list'
            }
        });
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
        this.showToast('Info', `Calling ${this.property.agent.name}...`, 'info');
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
        this.showToast('Success', 'Property saved to favorites!', 'success');
    }

    handleCloseScheduleModal() {
        this.showScheduleModal = false;
    }
    handleScheduleViewingSubmit(event) {
        const viewingData = event.detail;
        console.log('Viewing Data:', viewingData);
        
        // In real scenario: Call Apex to create Property_Viewing__c record
        // createViewing({ viewingData: JSON.stringify(viewingData) })
        this.showToast('Success', 'Viewing scheduled successfully!', 'success');
        this.showScheduleModal = false;
    }

    handleCloseInquiryModal() {
        this.showInquiryModal = false;
    }

    handleInquirySubmit(event) {
        const inquiryData = event.detail;
        console.log('Inquiry Data:', inquiryData);
        
        // In real scenario: Call Apex to create Property_Inquiry__c record
        // createInquiry({ inquiryData: JSON.stringify(inquiryData) })
        this.showToast('Success', 'Inquiry submitted successfully!', 'success');
        this.showInquiryModal = false;
        
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