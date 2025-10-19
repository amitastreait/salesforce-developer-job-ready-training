import { LightningElement } from 'lwc';

export default class LocalDevEnabled extends LightningElement {

    message = 'Hello World';

    handleClick(){
        console.log('Button Clicked');
    }

    get options(){
        return [
            {label: 'In Progress', value: 'inProgress'},
            {label: 'Completed', value: 'completed'},
            {label: 'Not Started', value: 'notStarted'},
            {label: 'On Hold', value: 'onHold'},
            {label: 'Cancelled', value: 'cancelled'},
            {label: 'Deferred', value: 'deferred'},
            {label: 'Pending', value: 'pending'},
            {label: 'Scheduled', value: 'scheduled'},
            {label: 'Waiting', value: 'waiting'},
            {label: 'Waiting for Approval', value: 'waitingForApproval'},
            {label: 'Waiting for Resources', value: 'waitingForResources'},
            {label: 'Waiting for Review', value: 'waitingForReview'},
        ]
    }
}