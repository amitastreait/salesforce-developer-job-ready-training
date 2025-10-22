import { LightningElement } from 'lwc';

export default class TestCursorPagination extends LightningElement {
    handleContactSelected(event) {
        console.log('Selected contact:', event.detail);
        // You can add logic here to handle the selected contact
        alert(`Selected contact: ${event.detail.Name}`);
    }
}