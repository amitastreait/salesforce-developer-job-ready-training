import { LightningElement } from 'lwc';
import { createRecord } from 'lightning/uiRecordApi';
import CONTACT_OBJECT from '@salesforce/schema/Contact';
import EMAIL_FIELD from '@salesforce/schema/Contact.Email';
export default class LdsCreateRecord extends LightningElement {

    isLoading = false;

    handleSave(){
        this.isLoading = true;
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
        createRecord({
            apiName: CONTACT_OBJECT.objectApiName, // 'Contact', 'Property__c', Course__c
            fields: fields
        })
        .then( (result) => {
            console.log(result)
        })
        .catch((error)=>{
            console.error(error);
        })
        .finally(()=>{
            this.isLoading = false;
        })
    }
}