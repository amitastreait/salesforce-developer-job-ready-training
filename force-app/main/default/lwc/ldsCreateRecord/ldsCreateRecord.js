import { LightningElement } from 'lwc';
import { createRecord } from 'lightning/uiRecordApi';
import CONTACT_OBJECT from '@salesforce/schema/Contact';
import EMAIL_FIELD from '@salesforce/schema/Contact.Email';

import {  reduceErrors } from 'c/ldsUtils';
export default class LdsCreateRecord extends LightningElement {

    isLoading = false;
    errorMessage;
    errorDetails;

    contactRecord = {
        FirstName: 'Amit',
        LastName : 'Singh',
        Phone : '9876543210',
        address : {
            street: '123 Main St',
            city: 'San Francisco',
            state: 'CA',
        }
    }

    handleSave(){
        console.time('handleSave');
        this.isLoading = true;
        let line1;
        // let line1 = this.contactRecord?.address?.completeAddress?.line1;

        if(this.contactRecord && this.contactRecord.address && this.contactRecord.address.completeAddress){
            line1 = this.contactRecord.address.completeAddress.line1;
        }

        console.log('line1 ', line1);

        const fields = {
            FirstName: 'Amit',
            LastName : 'Singh',
            Phone : '9876543210',
            AccountId: '001gL00000Qr77dQAB',
            Title : 'Salesforce Architect'
        }
        fields[EMAIL_FIELD.fieldApiName] = 'asingh@gmail.com'; // fields['Email'] = 'asingh@gmail.com'
        const recordInput = {
            apiName: CONTACT_OBJECT.objectApiName, // 'Contact', 'Property__c', Course__c
            fields: fields
        }
        try{
            createRecord({
                apiName: CONTACT_OBJECT.objectApiName, // 'Contact', 'Property__c', Course__c
                fields: fields
            })
            .then( (result) => {
                console.log(result)
            })
            .catch((error)=>{
                console.error(error);
                this.errorMessage = this.handleError(error);
                this.errorDetails = error;
            })
            .finally(()=>{
                this.isLoading = false;
            })
        }catch(error){
            console.error(error);
            this.errorMessage = this.handleError(error);
            this.errorDetails = error;
        } finally {
            this.isLoading = false;
        }

        // Log for debugging
        console.group('Error Details');
        console.log('Context:');
        console.log('Error Object:');
        console.log('Stack Trace:');
        console.groupEnd();

        for (let i = 0; i < 10000; i++) {
            // some code
            console.log(i);
        }

        console.timeEnd('handleSave');

    }

    handleError(error){
        return reduceErrors(error);
    }
}