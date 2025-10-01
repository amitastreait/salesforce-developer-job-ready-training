import { LightningElement } from 'lwc';

export default class PropertyListComponent extends LightningElement {


    handleDataChange(event){
        console.log('Data Changed '+Math.random());
        let eventDetails = event.detail;
        
        console.log('Event Details ', JSON.stringify(eventDetails) );
        console.log('Event target ', event.target);
        console.log('Event Type ', event.type);

        let propertyId = eventDetails.propertyId;
        let propertyName = eventDetails.propertyName;
        let propertyPrice = eventDetails.propertyPrice;

        console.log('Property Id ', propertyId);
        console.log('Property Name ', propertyName);
        console.log('Property Price ', propertyPrice);
    }
}