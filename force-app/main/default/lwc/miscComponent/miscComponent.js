import { LightningElement } from 'lwc';
import LightningAlert from 'lightning/alert';
import LightningConfirm from 'lightning/confirm';
import LightningPrompt from 'lightning/prompt';

/** Import the custom label from Salesforce */
import WELCOME_MESSAGE from '@salesforce/label/c.Welcome_Message';

import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class MiscComponent extends LightningElement {

    labels = {
        WELCOME_MESSAGE
    }

    currentStep = "Address Details";

    handleNext(event){
        event.preventDefault();
        this.currentStep = 'Additional Details';
        this.dispatchEvent(new ShowToastEvent({
            title: "title",
            message: "message",
            variant: "success"
        }));
    }

    async handleAlert(event){
        event.preventDefault();

        

        let result = await LightningAlert.open({
            message: 'This is a Lightning Alert',
            theme: 'alt-inverse',
            label: 'Success',
            variant:'header'
        });
        console.log(' Alert has been closed ', result);
        /*
            default: white
            shade: gray
            inverse: dark blue
            alt-inverse: darker blue
            success: green
            info: gray-ish blue
            warning: yellow
            error: red
            offline: ​black
        */
    }

    async handleConfirm(event){
        event.preventDefault();
        let result = await LightningConfirm.open({
            message: 'You are about to delete the record. Please confirm the action',
            theme: 'warning',
            label: 'Are you Sure?',
            variant:'header'
        });
        console.log(' Confirm has been closed ', result);
        if(result){
            // Handle the process to delete the record
            let result = await LightningAlert.open({
                message: 'The record has been deleted!',
                theme: 'info',
                label: 'Success',
                variant:'header'
            });
            console.log(' Alert has been closed ', result);
        }
    }

    async handlePromptClick() {
        LightningPrompt.open({
            message: 'this is the prompt message',
            theme: 'inverse',
            label: 'Please Respond', // this is the header text
            defaultValue: 'initial input value', //this is optional
        }).then((result) => {
            if(result){
                LightningAlert.open({
                    message: 'You have typed '+ result,
                    theme: 'info',
                    label: 'Success',
                    variant:'header'
                });
            }
        });
    }
}