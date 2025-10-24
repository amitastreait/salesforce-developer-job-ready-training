import { LightningElement, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getUserAppointments from '@salesforce/apex/PropertyController.getUserAppointments';

export default class MyAppointments extends NavigationMixin(LightningElement) {
    appointments = [];
    error;
    isLoading = true;
    selectedFilter = 'All';

    // Wire adapter to fetch user appointments
    @wire(getUserAppointments)
    wiredAppointments({ error, data }) {
        this.isLoading = true;
        if (data) {
            this.appointments = data;
            this.error = undefined;
            this.isLoading = false;
        } else if (error) {
            this.error = error;
            this.appointments = [];
            this.isLoading = false;
            this.showToast('Error', 'Failed to load appointments', 'error');
        }
    }

    // Filter options
    get filterOptions() {
        return [
            { label: 'All', value: 'All' },
            { label: 'Scheduled', value: 'Scheduled' },
            { label: 'Confirmed', value: 'Confirmed' },
            { label: 'Completed', value: 'Completed' },
            { label: 'Cancelled', value: 'Cancelled' }
        ];
    }

    // Filtered appointments based on selected filter
    get filteredAppointments() {
        if (!this.appointments || this.appointments.length === 0) {
            return [];
        }

        if (this.selectedFilter === 'All') {
            return this.appointments;
        }

        return this.appointments.filter(item => {
            return item.appointment.Status__c === this.selectedFilter;
        });
    }

    // Check if there are no appointments
    get hasNoAppointments() {
        return !this.isLoading && (!this.appointments || this.appointments.length === 0);
    }

    // Check if filtered list is empty
    get hasNoFilteredAppointments() {
        return !this.isLoading && this.filteredAppointments.length === 0 && this.appointments.length > 0;
    }

    // Get appointment count by status
    get appointmentStats() {
        if (!this.appointments || this.appointments.length === 0) {
            return {
                total: 0,
                scheduled: 0,
                confirmed: 0,
                completed: 0
            };
        }

        const stats = {
            total: this.appointments.length,
            scheduled: 0,
            confirmed: 0,
            completed: 0
        };

        this.appointments.forEach(item => {
            const status = item.appointment.Status__c;
            if (status === 'Scheduled') stats.scheduled++;
            else if (status === 'Confirmed') stats.confirmed++;
            else if (status === 'Completed') stats.completed++;
        });

        return stats;
    }

    // Get upcoming appointments (future appointments)
    get upcomingAppointments() {
        if (!this.appointments || this.appointments.length === 0) {
            return 0;
        }

        const now = new Date();
        return this.appointments.filter(item => {
            const appointmentDate = new Date(item.appointment.Appointment_Date_Time__c);
            return appointmentDate > now && (item.appointment.Status__c === 'Scheduled' || item.appointment.Status__c === 'Confirmed');
        }).length;
    }

    // Handle filter change
    handleFilterChange(event) {
        this.selectedFilter = event.detail.value;
    }

    // Navigate to property details
    handleViewProperty(event) {
        const propertyId = event.currentTarget.dataset.propertyId;
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

    // Navigate to appointment details
    handleViewAppointment(event) {
        const appointmentId = event.currentTarget.dataset.appointmentId;
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: appointmentId,
                objectApiName: 'Appointment__c',
                actionName: 'view'
            }
        });
    }

    // Format date/time
    formatDateTime(dateTimeString) {
        if (!dateTimeString) return '';
        const date = new Date(dateTimeString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }

    // Format currency
    formatCurrency(value) {
        if (!value) return '$0';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    }

    // Get status badge class
    getStatusClass(status) {
        switch(status) {
            case 'Scheduled':
                return 'status-badge status-scheduled';
            case 'Confirmed':
                return 'status-badge status-confirmed';
            case 'Completed':
                return 'status-badge status-completed';
            case 'Cancelled':
                return 'status-badge status-cancelled';
            default:
                return 'status-badge';
        }
    }

    // Get type badge class
    getTypeClass(type) {
        switch(type) {
            case 'Private':
                return 'type-badge type-private';
            case 'Virtual Tour':
                return 'type-badge type-virtual';
            case 'Open House':
                return 'type-badge type-open';
            default:
                return 'type-badge';
        }
    }

    // Check if appointment is upcoming
    isUpcoming(dateTimeString) {
        if (!dateTimeString) return false;
        const appointmentDate = new Date(dateTimeString);
        const now = new Date();
        return appointmentDate > now;
    }

    // Show toast message
    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        }));
    }
}