import { LightningElement, api, track } from 'lwc';

export default class ImageCarousel extends LightningElement {
    @api images = []; // Array of image objects: { id, url, alt }
    @api height = '500px'; // Carousel height
    @api showThumbnails; // Show thumbnail strip
    @api showIndicators; // Show dot indicators
    @api showCounter; // Show image counter
    @api autoPlay; // Auto-play carousel
    @api autoPlayInterval = 3000; // Auto-play interval in ms
    
    @track currentIndex = 0;
    autoPlayTimer;

    connectedCallback() {
        if(!this.showThumbnails){
            this.showThumbnails = true;
        }
        if(!this.showIndicators){
            this.showIndicators = true;
        }
        if(!this.showCounter){
            this.showCounter = true;
        }
        if(!this.autoPlay){
            this.autoPlay = true;
        }
        if (this.autoPlay) {
            this.startAutoPlay();
        }
    }

    disconnectedCallback() {
        this.stopAutoPlay();
    }

    // Computed properties
    get currentImage() {
        if (this.images && this.images.length > 0) {
            return this.images[this.currentIndex];
        }
        return null;
    }

    get indicators() {
        return this.images.map((img, index) => ({
            id: img.id,
            index: index,
            indicatorClass: index === this.currentIndex ? 
                'carousel-indicator active' : 
                'carousel-indicator'
        }));
    }

    get thumbnails() {
        return this.images.map((img, index) => ({
            ...img,
            index: index,
            thumbnailClass: index === this.currentIndex ? 
                'carousel-thumbnail active' : 
                'carousel-thumbnail'
        }));
    }

    get imageCounter() {
        if (!this.images || this.images.length === 0) return '0 / 0';
        return `${this.currentIndex + 1} / ${this.images.length}`;
    }

    get carouselStyle() {
        return `height: ${this.height}`;
    }

    get hasMultipleImages() {
        return this.images && this.images.length > 1;
    }

    get hasPreviousImage() {
        return this.currentIndex > 0;
    }

    get hasNextImage() {
        return this.currentIndex < this.images.length - 1;
    }

    // Navigation handlers
    handlePrevious() {
        if (this.images.length === 0) return;
        
        this.stopAutoPlay();
        this.currentIndex = 
            this.currentIndex === 0 
                ? this.images.length - 1 
                : this.currentIndex - 1;
        
        this.dispatchImageChangeEvent();
        
        if (this.autoPlay) {
            this.startAutoPlay();
        }
    }

    handleNext() {
        if (this.images.length === 0) return;
        
        this.stopAutoPlay();
        this.currentIndex = 
            this.currentIndex === this.images.length - 1 
                ? 0 
                : this.currentIndex + 1;
        
        this.dispatchImageChangeEvent();
        
        if (this.autoPlay) {
            this.startAutoPlay();
        }
    }

    handleIndicatorClick(event) {
        this.stopAutoPlay();
        this.currentIndex = parseInt(event.currentTarget.dataset.index, 10);
        this.dispatchImageChangeEvent();
        
        if (this.autoPlay) {
            this.startAutoPlay();
        }
    }

    handleThumbnailClick(event) {
        this.stopAutoPlay();
        this.currentIndex = parseInt(event.currentTarget.dataset.index, 10);
        this.dispatchImageChangeEvent();
        
        if (this.autoPlay) {
            this.startAutoPlay();
        }
    }

    handleImageClick() {
        // Dispatch event for parent to handle (e.g., open lightbox)
        this.dispatchEvent(new CustomEvent('imageclick', {
            detail: {
                image: this.currentImage,
                index: this.currentIndex
            }
        }));
    }

    // Auto-play functionality
    startAutoPlay() {
        if (!this.autoPlay || this.images.length <= 1) return;
        
        this.autoPlayTimer = setInterval(() => {
            this.handleNext();
        }, this.autoPlayInterval);
    }

    stopAutoPlay() {
        if (this.autoPlayTimer) {
            clearInterval(this.autoPlayTimer);
            this.autoPlayTimer = null;
        }
    }

    // Public methods
    @api
    goToSlide(index) {
        if (index >= 0 && index < this.images.length) {
            this.currentIndex = index;
            this.dispatchImageChangeEvent();
        }
    }

    @api
    reset() {
        this.currentIndex = 0;
        this.dispatchImageChangeEvent();
    }

    // Event dispatching
    dispatchImageChangeEvent() {
        this.dispatchEvent(new CustomEvent('imagechange', {
            detail: {
                image: this.currentImage,
                index: this.currentIndex,
                total: this.images.length
            }
        }));
    }
}