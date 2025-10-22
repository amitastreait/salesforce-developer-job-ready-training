import { LightningElement, wire } from 'lwc';

import { subscribe, unsubscribe, MessageContext, createMessageContext, releaseMessageContext, APPLICATION_SCOPE } from 'lightning/messageService';
import RECORD_SELECTED_CHANNEL from '@salesforce/messageChannel/RecordSelected__c';

export default class LmsSubscriberComponent extends LightningElement {

    @wire(MessageContext) messageContext;
    subscription = null;
    receivedMessage;

    context = createMessageContext();

    connectedCallback(){
        this.handleSubscribe();
    }

    handleSubscribe(){
        this.subscription = subscribe(
            this.messageContext, RECORD_SELECTED_CHANNEL, (message) => {
                this.handleSubscribeMessage(message);
            },
            {
                scope : APPLICATION_SCOPE
            }
        );
        console.log('Subscribed to channel - ', this.subscription);
    }

    handleUnSubscribe(){
        unsubscribe(this.subscription);
        this.subscription = null;
    }

    handleSubscribeMessage(message){
        console.log('Mesage received ', JSON.stringify(message));
        this.receivedMessage = message ? JSON.stringify(message, null, '\t') : 'no message payload';
    }

    disconnectedCallback(){
        releaseMessageContext(this.messageContext);
        unsubscribe(this.subscription);
        this.subscription = null;
    }

}