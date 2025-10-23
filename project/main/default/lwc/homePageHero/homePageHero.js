import { LightningElement, api, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import isGuest from '@salesforce/user/isGuest';
import getFeaturedProperties from '@salesforce/apex/HomePageController.getFeaturedProperties';
import getCategories from '@salesforce/apex/HomePageController.getCategories';
import getPromotionalBanner from '@salesforce/apex/HomePageController.getPromotionalBanner';
import subscribeToNewsletter from '@salesforce/apex/HomePageController.subscribeToNewsletter';

export default class HomePageHero extends NavigationMixin(LightningElement) {
    @api heroTitle = 'Find Your Dream Home';
    @api heroSubtitle = 'Discover amazing properties at great prices';
    @api ctaButtonText = 'Browse Properties';
    @api heroImage = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop';
    @api showFeaturedProperties = false;
    @api showCategories = false;
    @api showPromotionalBanner = false;

    isGuestUser = isGuest;
    featuredProperties = [];
    categories = [];
    promotionalBanner = {};
    isLoading = true;
    error;

    // Newsletter state
    newsletterEmail = '';
    newsletterMessage = '';
    newsletterMessageType = '';
    isSubscribing = false;

    // Carousel state
    currentSlideIndex = 0;
    autoPlayInterval;

    connectedCallback() {
        this.loadHomePageData();
        this.startAutoPlay();
    }

    disconnectedCallback() {
        this.stopAutoPlay();
    }

    get carouselDots() {
        return this.featuredProperties.map((_, index) => ({
            index: index,
            isActive: index === this.currentSlideIndex,
            className: index === this.currentSlideIndex ? 'carousel-dot active' : 'carousel-dot'
        }));
    }

    // Load all home page data
    loadHomePageData() {
        this.isLoading = true;
        this.showFeaturedProperties = true;
        this.showCategories = false;
        this.showPromotionalBanner = true;

        Promise.all([
            this.loadFeaturedProperties(),
            this.loadCategories(),
            this.loadPromotionalBanner()
        ]).then(() => {
            this.isLoading = false;
        }).catch(error => {
            this.error = error;
            this.isLoading = false;
            console.error('Error loading home page data:', error);
        });
    }

    // Load featured properties
    loadFeaturedProperties() {
        if (!this.showFeaturedProperties) {
            return Promise.resolve();
        }

        return getFeaturedProperties({ recordLimit: 8 })
            .then(result => {
                console.log('Featured properties:', result);
                this.featuredProperties = result.map((wrapper, index) => {
                    const property = wrapper.property;
                    const images = wrapper.images || [];

                    return {
                        id: property.Id,
                        name: property.Name,
                        address: property.Address__c || '',
                        city: property.Location_City__c || '',
                        price: property.Listing_price__c || 0,
                        formattedPrice: this.formatCurrency(property.Listing_price__c || 0),
                        pricePerSqFt: property.Price_Per_SqFt__c || 0,
                        formattedPricePerSqFt: this.formatCurrency(property.Price_Per_SqFt__c || 0),
                        imageUrl: images.length > 0 ? images[0].Image_Url__c : (property.Image_URL__c || '/resource/placeholder_property_image'),
                        allImages: images.map(img => ({
                            id: img.Id,
                            url: img.Image_Url__c,
                            type: img.Type__c
                        })),
                        description: property.Description__c || '',
                        propertyType: property.Property_Type__c || '',
                        bedrooms: property.Bedrooms__c || 0,
                        bathrooms: property.Bathrooms__c || 0,
                        squareFootage: property.Square_footage__c || 0,
                        formattedSquareFootage: this.formatNumber(property.Square_footage__c || 0),
                        status: property.Status__c || '',
                        daysOnMarket: property.Days_on_Market__c || 0,
                        hasPool: property.Have_a_pool__c || false,
                        hasFireplace: property.Have_a_fireplace__c || false,
                        garageSpaces: property.Garage_spaces__c || 0,
                        isNew: property.Days_on_Market__c <= 7,
                        isLuxury: property.Luxury_Property__c || false,
                        dataIndex: index
                    };
                });
            })
            .catch(error => {
                console.error('Error loading featured properties:', error);
                return Promise.resolve();
            });
    }

    // Load categories
    loadCategories() {
        if (!this.showCategories) {
            return Promise.resolve();
        }
        return Promise.resolve();
        /* return getCategories({ recordLimit: 6 })
            .then(result => {
                this.categories = result.map(category => ({
                    id: category.Id,
                    name: category.Name,
                    imageUrl: category.Image_URL__c || '/resource/placeholder_category_image',
                    productCount: category.Product_Count__c || 0,
                    description: category.Description || ''
                }));
            })
            .catch(error => {
                console.error('Error loading categories:', JSON.stringify(error));
                return Promise.resolve();
            }); */
    }

    // Load promotional banner
    loadPromotionalBanner() {
        if (!this.showPromotionalBanner) {
            return Promise.resolve();
        }

        return getPromotionalBanner()
            .then(result => {
                if (result && result.length > 0) {
                    this.promotionalBanner = {
                        title: result[0].Title__c || '',
                        subtitle: result[0].Subtitle__c || '',
                        imageUrl: result[0].Image_URL__c || '',
                        ctaText: result[0].CTA_Text__c || 'Learn More',
                        ctaUrl: result[0].CTA_URL__c || '/promotions',
                        isActive: result[0].Is_Active__c || false
                    };
                }
            })
            .catch(error => {
                console.error('Error loading promotional banner:', error);
                return Promise.resolve();
            });
    }

    // Handle CTA button click
    handleCtaClick() {
        this.pageReference = {
            type: 'comm__namedPage',
            attributes: {
                name: 'properties__c'
            }
        };
        this[NavigationMixin.Navigate](this.pageReference);
    }

    // Handle property click
    handlePropertyClick(event) {
        const propertyId = event.currentTarget.dataset.propertyId;
        this.pageReference = {
            type: 'comm__namedPage',
            attributes: {
                name: 'PropertyDetails__c'
            },
            state : {
                c__recordId : propertyId
            }
        };
        this[NavigationMixin.Navigate](this.pageReference);
    }

    // Handle category click
    handleCategoryClick(event) {
        const categoryId = event.currentTarget.dataset.categoryId;
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: `/category/${categoryId}`
            }
        });
    }

    // Handle favorite property
    handleFavoriteProperty(event) {
        event.stopPropagation();
        const propertyId = event.currentTarget.dataset.propertyId;

        // Implement favorite logic
        console.log('Favorite property:', propertyId);

        // Show success message
        this.dispatchEvent(
            new CustomEvent('showtoast', {
                detail: {
                    title: 'Success',
                    message: 'Property added to favorites',
                    variant: 'success'
                },
                bubbles: true,
                composed: true
            })
        );
    }

    // Carousel navigation
    handlePrevSlide() {
        this.stopAutoPlay();
        const totalSlides = this.featuredProperties.length;
        this.currentSlideIndex = (this.currentSlideIndex - 1 + totalSlides) % totalSlides;
        this.updateCarousel();
        this.startAutoPlay();
    }

    handleNextSlide() {
        this.stopAutoPlay();
        const totalSlides = this.featuredProperties.length;
        this.currentSlideIndex = (this.currentSlideIndex + 1) % totalSlides;
        this.updateCarousel();
        this.startAutoPlay();
    }

    handleDotClick(event) {
        this.stopAutoPlay();
        this.currentSlideIndex = parseInt(event.currentTarget.dataset.index, 10);
        this.updateCarousel();
        this.startAutoPlay();
    }

    updateCarousel() {
        const carousel = this.template.querySelector('.properties-carousel');
        if (carousel) {
            const slideWidth = carousel.querySelector('.property-card')?.offsetWidth || 300;
            const gap = 20;
            const offset = this.currentSlideIndex * (slideWidth + gap);
            carousel.style.transform = `translateX(-${offset}px)`;
        }
    }

    startAutoPlay() {
        this.autoPlayInterval = setInterval(() => {
            this.handleNextSlide();
        }, 5000); // Change slide every 5 seconds
    }

    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
        }
    }

    // Newsletter handlers
    handleEmailChange(event) {
        this.newsletterEmail = event.target.value;
        // Clear any previous messages when user starts typing
        if (this.newsletterMessage) {
            this.newsletterMessage = '';
            this.newsletterMessageType = '';
        }
    }

    handleNewsletterSubscribe() {
        // Validate email
        if (!this.newsletterEmail || !this.isValidEmail(this.newsletterEmail)) {
            this.showNewsletterMessage('Please enter a valid email address', 'error');
            return;
        }

        this.isSubscribing = true;
        this.newsletterMessage = '';

        subscribeToNewsletter({ email: this.newsletterEmail })
            .then(result => {
                this.showNewsletterMessage('Thank you for subscribing! Check your inbox for confirmation.', 'success');
                this.newsletterEmail = '';
                this.isSubscribing = false;
            })
            .catch(error => {
                console.error('Newsletter subscription error:', error);
                const errorMessage = error.body?.message || 'Unable to subscribe. Please try again later.';
                this.showNewsletterMessage(errorMessage, 'error');
                this.isSubscribing = false;
            });
    }

    showNewsletterMessage(message, type) {
        this.newsletterMessage = message;
        this.newsletterMessageType = type;

        // Auto-hide success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                this.newsletterMessage = '';
                this.newsletterMessageType = '';
            }, 5000);
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Format currency
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount || 0);
    }

    // Format number with commas
    formatNumber(number) {
        return new Intl.NumberFormat('en-US').format(number || 0);
    }

    // Getters for template
    get hasFeaturedProperties() {
        return this.featuredProperties && this.featuredProperties.length > 0;
    }

    get hasCategories() {
        return this.categories && this.categories.length > 0;
    }

    get showBanner() {
        return this.showPromotionalBanner && 
               this.promotionalBanner.isActive && 
               this.promotionalBanner.title;
    }

    // Remove duplicate carouselDots getter (already defined earlier)

    get newsletterMessageClass() {
        return `newsletter-message ${this.newsletterMessageType}`;
    }

    get newsletterMessageIcon() {
        return this.newsletterMessageType === 'success'
            ? 'utility:success'
            : 'utility:error';
    }

    get welcomeMessage() {
        if (this.isGuestUser) {
            return this.heroTitle;
        }
        return 'Welcome Back!';
    }
}