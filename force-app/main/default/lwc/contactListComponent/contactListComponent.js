import { api, LightningElement, track, wire } from 'lwc';

/** Import all required apex class methods */
import getAllContacts from '@salesforce/apex/ContactController.getAllContacts';
import getContactsByAccountId from '@salesforce/apex/ContactController.getContactsByAccountId';

export default class ContactListComponent extends LightningElement {

    @api recordId;

    @track contacts;
    relatedContacts;
    errors;

    /** use @wire decorator to call the apex class */
    // @wire(apexClassMethod) propertyOrFunction

    @wire(getAllContacts) result; // {data, error}

    // result = { data, error }
    // result.data , result.error

    @wire(getAllContacts)
    wiredAllContacts( { data, error } ){
        if(data){
            // console.log(data);
            // console.table(data);
            /* data.forEach(contact => {
                contact.AccountName = contact.Account.Name
                contact.ContactName = `${contact.Name} - ${contact.Title}`
            }); */
            let copyOfData = JSON.parse( JSON.stringify(data) ); // let copyOfData = [... data]
            copyOfData.forEach(contact => {
                contact.AccountName = contact.Account.Name
                contact.ContactName = `${contact.Name} - ${contact.Title}`
            });
            this.contacts = copyOfData;
        }else if(error){
            console.error(error);
            this.errors = error;
        }
    }

    @wire(getContactsByAccountId, {
        accountId : '$recordId',
        accountName : 'Salesforce.com'
    })
    wiredRelatedContacts( { data, error } ){
        console.log('getContactsByAccountId');
        console.log(data)
        console.log(error)
        if(data){
            console.log(data);
            this.relatedContacts = data;
        }else if(error){
            console.error(error);
            this.errors = error;
        }
    }

    handleClick(){
        this.recordId = '001gL000007YsWhQAK';
    }
}