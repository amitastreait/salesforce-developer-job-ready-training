import { LightningElement, wire } from 'lwc';
import { publish, MessageContext, releaseMessageContext, APPLICATION_SCOPE } from 'lightning/messageService';
import RECORD_SELECTED_CHANNEL from '@salesforce/messageChannel/RecordSelected__c';

export default class LmsPublisherComponent extends LightningElement {
    @wire(MessageContext) messageContext;

    handlePublish(){
        publish(
            this.messageContext,
            RECORD_SELECTED_CHANNEL,
            {
                recordId: 'a07gL000006K9GcQAK',
                source: 'lmsPublisherComponent',
                message: 'Finished SFDX: Create Lightning Web Component',
                data : {
                    record_Id: 'a07gL000006K9GcQAK_a07gL000006K9GcQAK',
                    source_demo: 'lms_PublisherComponent',
                    message_simple: 'Create Lightning Web Component',
                }
            },
            {
                scope : APPLICATION_SCOPE
            }
        )
    }

    disconnectedCallback(){
        releaseMessageContext(this.messageContext);
    }
}