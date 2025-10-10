import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class ToastEvent extends LightningElement {

    recordId = 'a0SgL0000009OrJUAU';
    
    handleSuccessClick(){
        const evt = new ShowToastEvent({
            title: 'Success',
            message: 'Record {0} has been saved. See it {1}! {2} {3}',
            variant: 'success',
            mode: 'dismissable',
            messageData : [
                "Salesforce",
                {
                    url: `https://${location.host}/${this.recordId}`,
                    label: "here"
                },
                "This is another placeholder text",
                {
                    url: `https://${location.host}/${this.recordId}`,
                    label: "here"
                },
            ]
        });
        this.dispatchEvent(evt);
    }

    handleErrorClick(){
        const evt = new ShowToastEvent({
            title: 'Error',
            message: 'Error while creating the record',
            variant: 'error',
            mode: 'dismissable'
        });
        this.dispatchEvent(evt);
    }

    handleWarningClick(){
        const evt = new ShowToastEvent({
            title: 'Warning',
            message: 'You are about to reach the Governor Limits',
            variant: 'warning',
            mode: 'sticky'
        });
        this.dispatchEvent(evt);
    }

    handleInfoClick(){
        const evt = new ShowToastEvent({
            title: 'Information',
            message: 'Record has been saved',
            mode: 'pester'
        });
        this.dispatchEvent(evt);
    }
}