import { api, LightningElement, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import { NavigationMixin } from 'lightning/navigation';

export default class ContactCard extends NavigationMixin(LightningElement) {
   @api contactInformation;
   @api message;
   @api wlecomemessage;

   @wire(CurrentPageReference)
    getPageRef(currRef){
        console.log('Current Page Reference: ', JSON.stringify(currRef.state));
    }
}