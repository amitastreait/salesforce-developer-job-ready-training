import { LightningElement, track, api } from 'lwc';

export default class MockCursorPagination extends LightningElement {
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
        // Load mock data for demonstration
        this.loadMockContacts();
    }
    
    loadMockContacts() {
        this.loading = true;
        
        // Simulate API delay
        setTimeout(() => {
            // Generate mock contact data
            const mockContacts = [];
            for (let i = 1; i <= 25; i++) {
                mockContacts.push({
                    Id: '003' + i.toString().padStart(3, '0'),
                    Name: `Contact ${i}`,
                    Email: `contact${i}@example.com`,
                    Phone: `+1-555-${String(i).padStart(4, '0')}`,
                    Title: `Job Title ${i}`
                });
            }
            
            this.contacts = mockContacts;
            this.totalRecords = mockContacts.length;
            this.currentPage = 1;
            this.totalPages = Math.ceil(this.totalRecords / this.batchSize);
            this.disablePreviousButton = true;
            this.disableNextButton = this.totalPages > 1;
            this.loading = false;
        }, 500);
    }
    
    handleNext() {
        if (!this.disableNextButton) {
            this.currentPosition += this.batchSize;
            this.loadMockContacts(); // In real scenario, this would call the API
        }
    }
    
    handlePrevious() {
        if (!this.disablePreviousButton) {
            this.currentPosition -= this.batchSize;
            this.loadMockContacts(); // In real scenario, this would call the API
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