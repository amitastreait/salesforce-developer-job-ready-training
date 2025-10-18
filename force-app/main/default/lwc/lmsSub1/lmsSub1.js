import { LightningElement, track } from 'lwc';
import { subscribe,unsubscribe,createMessageContext,releaseMessageContext, APPLICATION_SCOPE } from 'lightning/messageService';
import SAMPLEMC from "@salesforce/messageChannel/MyMessageChannel__c";
export default class LmsSub1 extends LightningElement {

    @track receivedMessage = '';
    subscription = null;
    context = createMessageContext();
    message = ''

    subscribeMC() {
        if (this.subscription) {
            return;
        }
        this.subscription = subscribe(this.context, SAMPLEMC, 
            (message) => {
                this.displayMessage(message);
            },
            { 
                scope: APPLICATION_SCOPE 
            }
        );
        console.log('Subscribed to message channel ', this.subscription);
        this.message = 'Channel is subscribed';
    }
 
    unsubscribeMC() {
        unsubscribe(this.subscription);
        this.subscription = null;
        console.log('Unsubscribed from message channel ', this.subscription);
        this.message = 'Channel is unsubscribed';
    }

    displayMessage(message) {
        this.receivedMessage = message ? JSON.stringify(message, null, '\t') : 'no message payload';
    }

    disconnectedCallback() {
        releaseMessageContext(this.context);
    }
}