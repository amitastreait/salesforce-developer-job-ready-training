import { LightningElement, track, api } from 'lwc';
import getContacts from '@salesforce/apex/CursorExample.pagination';

export default class CursorPagination extends LightningElement {
    @track contacts = [];
    @track totalRecords = 0;
    @track currentPage = 1;
    @track totalPages = 0;
    @track loading = false;
    @track disablePreviousButton = true;
    @track disableNextButton = false;
    
    // Default batch size
    @api batchSize = 10;
    
    // Current position in the cursor
    currentPosition = 0;
    
    connectedCallback() {
        this.loadContacts();
    }
    
    loadContacts() {
        this.loading = true;
        
        getContacts({ 
            startPosition: this.currentPosition, 
            batchSize: this.batchSize 
        })
        .then(result => {
            this.contacts = result.records;
            this.totalRecords = result.totalCount;
            this.currentPage = Math.floor(this.currentPosition / this.batchSize) + 1;
            this.totalPages = Math.ceil(this.totalRecords / this.batchSize);
            
            // Update button states
            this.disablePreviousButton = this.currentPosition === 0;
            this.disableNextButton = !result.hasNext;
            
            this.loading = false;
        })
        .catch(error => {
            console.error('Error loading contacts:', error);
            this.loading = false;
        });
    }
    
    handleNext() {
        if (!this.disableNextButton) {
            this.currentPosition += this.batchSize;
            this.loadContacts();
        }
    }
    
    handlePrevious() {
        if (!this.disablePreviousButton) {
            this.currentPosition -= this.batchSize;
            this.loadContacts();
        }
    }
    
    // Handle row selection
    handleRowSelect(event) {
        const selectedContactId = event.target.dataset.contactId;
        const selectedContact = this.contacts.find(contact => contact.Id === selectedContactId);
        
        // Dispatch custom event with selected contact
        const selectedEvent = new CustomEvent('contactselected', {
            detail: selectedContact
        });
        this.dispatchEvent(selectedEvent);
    }
}