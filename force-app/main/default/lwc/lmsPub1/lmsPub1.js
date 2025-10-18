import { LightningElement } from 'lwc';
import { publish,createMessageContext,releaseMessageContext, APPLICATION_SCOPE } from 'lightning/messageService';
import SAMPLEMC from "@salesforce/messageChannel/MyMessageChannel__c";
export default class LmsPub1 extends LightningElement {

    context = createMessageContext();
    message = '';

    handleChange(event) {
        this.message = event.target.value;
    }

    connectedCallback() {
        this.publishMC();
    }

    publishMC() {
        const message = {
            message: this.message
        };
        publish(this.context, SAMPLEMC, message);
    }

    disconnectedCallback() {
        releaseMessageContext(this.context);
    }
}