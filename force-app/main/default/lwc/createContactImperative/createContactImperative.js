import { api, LightningElement } from 'lwc';
import createContact from '@salesforce/apex/ContactController.createContact'

import { executeApexWithLoading } from 'c/ldsUtils';
export default class CreateContactImperative extends LightningElement {

    @api recordId;

    firstName
    lastName
    email
    phone
    title

    contact = { };
    error;

    isLoading = false;
    contactCreated = false

    handleInputChange(event){
        /* let target = event.target;
        let name = target.name;
        let value = target.value;
        this.contact[name] = value; */
        // this.contact["FirstName"] = "Amit"
        this.contact[event.target.name] = event.target.value;
    }

    handleFirstName(event){
        this.firstName = event.target.value;
    }

    handleLastName(event){
        this.lastName = event.target.value;
    }
    handleEmailName(event){
        this.email = event.target.value;
    }
    handlePhoneName(event){
        this.phone = event.target.value;
    }
    handleTitleName(event){
        this.title = event.target.value;
    }

    handleSave(){

        console.log(this.contact);
        console.log(this.recordId);

        if( !this.validateInput() ){
            return;
        }

        // let result = executeApexWithLoading(this, createContact, {});

        this.isLoading = true;
        createContact({
            firstName: this.contact.ContactFirstName,
            lastName: this.contact.LastName,
            email: this.contact.Email,
            phone: this.contact.Phone,
            title: this.contact.Title,
            accountId: this.recordId
        })
        .then( (result) =>{
            console.log('Contact Created ', result);
            console.log('Contact Id ', result.Id);
            this.contactCreated = true;
        })
        .catch( (error) => {
            this.error = JSON.stringify(error);
            console.error(error);
            this.contactCreated = false;
        })
        .finally(() => {
            console.log('Finally Executed!');
            this.isLoading = false;
        })
    }

    validateInput(){
        const allValid = [...this.template.querySelectorAll('lightning-input,lightning-combobox'),].reduce((validSoFar, inputCmp) => {
            inputCmp.reportValidity();
            return validSoFar && inputCmp.checkValidity();
        }, true);
        return allValid;
    }
}