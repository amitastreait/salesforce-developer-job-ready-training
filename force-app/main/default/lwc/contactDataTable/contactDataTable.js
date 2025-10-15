import { LightningElement, track, wire } from 'lwc';
import getAllContacts from '@salesforce/apex/ContactController.getAllContacts';

import { updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent'; 

import { refreshApex } from "@salesforce/apex";

const actions = [
    { label: 'Show Details', name : 'show_details' },
    { label: 'Delete', name : 'delete' }
]

export default class ContactDataTable extends LightningElement {

    contacts = [];
    errors;
    draftValues = [];
    @track wiredContacts;
    isLoading = false;
    sortByField;
    sortDirection = 'asc';

    columns = [
        { label: 'Name', fieldName: 'Name', type: 'text', sortable : true },
        { label: 'Email', fieldName: 'Email', type: 'email', editable : true, sortable : true },
        { label: 'Title', fieldName: 'Title', type: 'text',  editable : true, sortable : true },
        { label: 'Phone', fieldName: 'Phone', type: 'phone', editable : true, sortable : true },
        { label: 'Account Name', fieldName: 'AccountUrl', type: 'url',
            typeAttributes: {
                label: {
                    fieldName: 'AccountName' // Attribute that contains the value which you want to display
                },
                target: '_blank'
            }
        },
        /* { 
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
        }, */
        /* { label: 'Created Date', fieldName: 'CreatedDate', type: 'date',
            typeAttributes:{
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "2-digit"
            }
        }, */
        { 
            type: 'action',
            typeAttributes: {
                rowActions: actions
            } 
        }
    ];

    @wire(getAllContacts)
    wiredContacts(result){
        this.wiredContacts = result;
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

    handleRowAction(event){
        event.preventDefault();
        let action = event.detail.action;
        let row = event.detail.row;
        switch (action.name) {
            case 'show_details':
                alert(row);
                break;
            case 'delete':
                alert('Record is deleted!');
                break;
            default:
                break;
        }
    }

    handleRowSelection(event){
        event.preventDefault();
        let name = event.detail.config.action;
        // valid values - selectAllRows, deselectAllRows, rowSelect, rowDeselect
        let value = event.detail.config.value; // Id
        console.log(name);
        console.log(value);

        let selectedRows = event.detail.selectedRows;
        console.log(JSON.stringify(selectedRows));
    }

    handleSave(event){

        event.preventDefault();
        this.isLoading = true;
        /** Step1 - get the change values in the Data Table */
        this.draftValues = event.detail.draftValues;
        console.log(JSON.stringify(this.draftValues));

        /** Step2 - Prepare the input for record to update using updateRecord and there could be multiple records */
        let recordInputs = this.draftValues.map((item, index, tempArray)=>{
            // console.log(item);
            const fields = {
                Id: item.Id
            };
            if(item.Title){
                fields['Title'] = item.Title;
            }
            if(item.Email){
                fields['Email'] = item.Email;
            }
            if(item.Phone){
                fields['Phone'] = item.Phone;
            }
            // const fields = { ...item }
            return { fields }
        });
        // console.log(JSON.stringify(recordInputs));

        /** Step3 - Prepare the updateRecord Method for all the record(s) */
        const promises = recordInputs.map(recordInput => {
            return updateRecord(recordInput);
        });

        /** Step4 - Update the records using Promise.all methods */
        Promise.all(promises).then( () => {
            this.draftValues = [];
            // alert('Data saved successfully');
            /** show success toast notification */
            this.dispatchEvent(new ShowToastEvent({
                title: 'Success',
                message: 'Data saved successfully',
                variant: 'success',
                mode: 'dismissable'
            }));
            refreshApex(this.wiredContacts);
        }).catch( error => {
            console.log(error);
            //alert('Error while saving the data');
            this.dispatchEvent(new ShowToastEvent({
                title: 'Error!',
                message: 'Error while saving the data',
                variant: 'error',
                mode: 'dismissable'
            }));
        }).finally( () => {
            /** Finally make the draft values to blank array */
            this.draftValues = [];
            this.isLoading = false;
        });

        /** 
        /** Step1 - get the change values in the Data Table * /
        this.draftValues = event.detail.draftValues;
        console.log(JSON.stringify(this.draftValues));

        /** Step2 - Prepare the input for record to update using updateRecord and there could be multiple records* /
        let recordInputs = this.draftValues.map( draftValue => {
            console.log(draftValue)
            const fields = {...draftValue}
            return { fields };
        });
        console.log(JSON.stringify(recordInputs));

        /** Step3 - Prepare the updateRecord Method for all the records * /
        const promises = recordInputs.map(recordInput => {
            return updateRecord(recordInput);
        });

        /** Step4 - Update the records using Promise.all methods * /
        Promise.all(promises).then( () => {
            this.draftValues = [];
            alert('Data saved successfully');
            /** show success toast notification * /
            this.dispatchEvent(new ShowToastEvent({
                title: 'Success',
                message: 'Data saved successfully',
                variant: 'success',
                mode: 'dismissable'
            }));
        }).catch( error => {
            console.log(error);
            alert('Error while saving the data');
        }).finally( () => {
            /** Finally make the draft values to blank array * /
            this.draftValues = [];
        });  */

    }

    handleSaveError(event){
        event.preventDefault();
        console.log('Error while saving the data ', JSON.stringify(event.detail));
    }

    handleCancel(event){
        event.preventDefault();
        this.draftValues = [];
        console.log('Cancel button clicked');
    }

    handleSort(event){
        const { fieldName, sortDirection } = event.detail;

        // Shallow clone to avoid mutating original array reference
        const data = [...this.contacts];

        const comparator = this.buildComparator(fieldName, sortDirection);
        data.sort(comparator);

        this.contacts = data;
        this.sortDirection = sortDirection;
        this.sortByField = fieldName;
    }

    buildComparator(fieldName, sortDirection = 'asc') {
        const direction = sortDirection === 'asc' ? 1 : -1;
        const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

        const getVal = (row) => {
            const v = row?.[fieldName];
            return v === null || v === undefined ? null : v;
        };

        return (a, b) => {
            let va = getVal(a);
            let vb = getVal(b);

            // Nulls last
            if (va === null && vb === null) return 0;
            if (va === null) return 1;
            if (vb === null) return -1;

            // Dates
            if (va instanceof Date || vb instanceof Date) {
                const ta = va instanceof Date ? va.getTime() : new Date(va).getTime();
                const tb = vb instanceof Date ? vb.getTime() : new Date(vb).getTime();
                return direction * (ta - tb);
            }

            // Numbers
            const na = typeof va === 'number' ? va : Number(va);
            const nb = typeof vb === 'number' ? vb : Number(vb);
            const bothNumeric = Number.isFinite(na) && Number.isFinite(nb);
            if (bothNumeric) {
                return direction * (na - nb);
            }

            // Strings fallback (locale-aware, case-insensitive, numeric-aware)
            const sa = String(va);
            const sb = String(vb);
            return direction * collator.compare(sa, sb);
        };
    }

}
