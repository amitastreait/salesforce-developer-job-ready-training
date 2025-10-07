import { api, LightningElement, wire } from 'lwc';

import { getRecord, getFieldValue, getFieldDisplayValue } from 'lightning/uiRecordApi';
import ACCOUNT_OBJECT from '@salesforce/schema/Account';
import NAME_FIELD from '@salesforce/schema/Account.Name';
import RATING_FIELD from '@salesforce/schema/Account.Rating';
import ANNUALREVENUE_FIELD from '@salesforce/schema/Account.AnnualRevenue';
export default class LdsGetRecord extends LightningElement {
    @api recordId;
    fields = ["Name","Industry","Phone","Fax","Website","Rating"]
    account;
    error;

    connectedCallback(){
        console.log(ACCOUNT_OBJECT)
        console.log(NAME_FIELD)
        console.log(RATING_FIELD)
        console.log(ANNUALREVENUE_FIELD)
    }

    @wire(getRecord, { 
        recordId:  '$recordId',
        fields: [NAME_FIELD, RATING_FIELD, ANNUALREVENUE_FIELD]
    })
    wiredGetRecord({data, error}){
        console.log(data);
        if(data){
            this.account = data;
            let annualRevenue =  this.account.fields.AnnualRevenue.displayValue;
            console.log(annualRevenue);
        }else if(error){
            this.error = error;
        }
    }

    get accountName(){
        return getFieldValue(this.account, NAME_FIELD);
    }

     get annualRevenue(){
        return getFieldDisplayValue(this.account, ANNUALREVENUE_FIELD);
    }

    handleSubmit(event) {
        let fields = event.detail.fields;
        console.log(JSON.stringify(fields))
        fields.Description = 'This is the default value from Lightning Web Component';

        // submit the form
        this.refs.accountForm.submit(fields);
    }
    handleSuccess(event) {
        let fields = event.detail.fields;
        console.log(JSON.stringify(fields))
        alert('Record Saved');
    }
    handleError(event) {
        let fields = event.detail.fields;
        console.log(JSON.stringify(fields))
    }
}