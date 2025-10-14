import { LightningElement, wire } from 'lwc';
import getAllContacts from '@salesforce/apex/ContactController.getAllContacts';

export default class ContactDataTable extends LightningElement {

    contacts = [];
    errors;

    columns = [
        { label: 'Name', fieldName: 'Name', type: 'text' },
        { label: 'Email', fieldName: 'Email', type: 'email' },
        // { label: 'Title', fieldName: 'Title', type: 'text' },
        { label: 'Phone', fieldName: 'Phone', type: 'phone' },
        { label: 'Account Name', fieldName: 'AccountUrl', type: 'url',
            typeAttributes: {
                label: {
                    fieldName: 'AccountName' // Attribute that contains the value which you want to display
                },
                target: '_blank'
            }
        },
        { 
            label: 'Account Revenue', fieldName: 'AnnualRevenue', type: 'currency',
            typeAttributes: {
                currencyCode: {
                    fieldName: 'CurrencyIsoCode'
                },
                step: '0.1'
            },
            cellAttributes: {
                iconName: {
                    fieldName: 'iconName' //'utility:trending',
                },
                iconPosition: 'right',
                iconAlternativeText: {
                    fieldName: 'AnnualRevenue'
                },
            }
        },
        /* { label: 'Created Date', fieldName: 'CreatedDate', type: 'date',
            typeAttributes:{
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "2-digit"
            }
        }, */
    ];

    @wire(getAllContacts)
    wiredContacts(result){
        let { error, data } = result;
        if(data) {
            console.log(data);
            this.contacts = JSON.parse( JSON.stringify(data) );
            this.contacts.forEach( (item, index, tempArray) => {
                if(item.AccountId){
                    item.AccountName = item.Account.Name;
                    item.AnnualRevenue = item.Account.AnnualRevenue;
                    item.CurrencyIsoCode = item.Account.CurrencyIsoCode;
                    item.AccountUrl = 'https://'+location.host+'/lightning/r/Account/'+item.AccountId+'/view'
                    if(item.AnnualRevenue > 139000000){
                        item.iconName = 'utility:chevronup'
                    }else{
                        item.iconName = 'utility:chevrondown'
                    }
                }
                item.contactUrl = 'https://'+location.host+'/lightning/r/Contact/'+item.Id+'/view';
            });
            // this.contacts = data;
        } else if(error){
            this.errors = error;
        }
    }

    handleProSelected(event){
        event.preventDefault();
        let selectedRows = this.refs.condatatable.getSelectedRows();
        console.log(JSON.stringify(selectedRows));
    }

}