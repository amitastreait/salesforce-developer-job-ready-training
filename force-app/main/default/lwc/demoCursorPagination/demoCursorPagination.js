import { LightningElement } from 'lwc';

export default class DemoCursorPagination extends LightningElement {
    handleContactSelected(event) {
        console.log('Selected contact:', event.detail);
        alert(`Selected contact: ${event.detail.Name}`);
    }
}