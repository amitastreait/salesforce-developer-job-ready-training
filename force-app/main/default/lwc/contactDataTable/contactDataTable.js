import { LightningElement, track, wire } from 'lwc';
import getAllContacts from '@salesforce/apex/ContactController.getAllContacts';

import { updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import { refreshApex } from "@salesforce/apex";

// Import for picklist values
import { getObjectInfo, getPicklistValues } from 'lightning/uiObjectInfoApi';
import CONTACT_OBJECT from '@salesforce/schema/Contact';
import LEADSOURCE_FIELD from '@salesforce/schema/Contact.LeadSource';

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

    // Properties for picklist values
    contactObjectInfo;
    leadSourceOptions = [];

    // Wire to get Contact object info (needed for picklist recordTypeId)
    @wire(getObjectInfo, { objectApiName: CONTACT_OBJECT })
    objectInfo({ error, data }) {
        if (data) {
            this.contactObjectInfo = data;
            console.log('Contact Object Info:', data);
        } else if (error) {
            console.error('Error fetching object info:', error);
        }
    }

    // Wire to get Lead Source picklist values
    @wire(getPicklistValues, {
        recordTypeId: '$contactObjectInfo.defaultRecordTypeId',
        fieldApiName: LEADSOURCE_FIELD
    })
    leadSourcePicklist({ error, data }) {
        if (data) {
            this.leadSourceOptions = data.values.map(option => ({
                label: option.label,
                value: option.value
            }));
            console.log('Lead Source Options:', this.leadSourceOptions);
            this.updateColumnsWithPicklist();
        } else if (error) {
            console.error('Error fetching Lead Source picklist:', error);
        }
    }

    columns = [
        { label: 'Name', fieldName: 'Name', type: 'text', sortable : true },
        { label: 'Email', fieldName: 'Email', type: 'email', editable : true, sortable : true },
        { label: 'Title', fieldName: 'Title', type: 'text',  editable : true, sortable : true },
        { label: 'Phone', fieldName: 'Phone', type: 'phone', editable : true, sortable : true },
        {
            label: 'Lead Source',
            fieldName: 'LeadSource',
            type: 'picklist',
            editable: true,
            typeAttributes: {
                placeholder: 'Choose Lead Source',
                options: { fieldName: 'leadSourceOptions' },
                value: { fieldName: 'LeadSource' },
                context: { fieldName: 'Id' },
                variant: 'label-hidden',
                name: 'LeadSource',
                label: 'Lead Source'
            }
        },
        {
            label: 'Account',
            fieldName: 'AccountId',
            type: 'lookup',
            editable: true,
            typeAttributes: {
                objectApiName: 'Account',
                label: 'Account',
                placeholder: 'Search Accounts...',
                displayValue: { fieldName: 'AccountName' },
                nameField: 'Name',
                filter: null,
                displayInfo: {
                    primaryField: 'Name',
                    additionalFields: ['Type']
                },
                matchingInfo: {
                    primaryField: { fieldPath: 'Name' },
                    additionalFields: [
                        { fieldPath: 'Type' }
                    ]
                },
                context: { fieldName: 'Id' }
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
                // Add lead source options to each row for picklist
                item.leadSourceOptions = this.leadSourceOptions;

                if(item.AccountId){
                    console.log(item.AccountId);
                    console.log(item.AccountId.Name);
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

    // Helper method to update columns when picklist values are loaded
    updateColumnsWithPicklist() {
        if (this.contacts && this.contacts.length > 0) {
            // Update existing contacts with new picklist options
            this.contacts = this.contacts.map(contact => ({
                ...contact,
                leadSourceOptions: this.leadSourceOptions
            }));
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

    handleCellChange(event) {
        console.log('Cell Change Event:', JSON.stringify(event.detail));
        const draftValues = event.detail.draftValues;
        if (!draftValues || !Array.isArray(draftValues) || draftValues.length === 0) {
            console.error('Invalid cellchange event. Missing or empty draftValues array');
            return;
        }
        // Process each draft value from the event
        draftValues.forEach(draft => {
            const recordId = draft.Id;
            Object.keys(draft).forEach(fieldName => {
                if (fieldName !== 'Id') {
                    const value = draft[fieldName];
                    // console.log('Cell Changed:', fieldName, recordId, value);
                    this.updateDraftValues(recordId, fieldName, value);
                }
            });
        });
    }

    handleLookupSelected(event) {
        console.log('Lookup Selected Event:', JSON.stringify(event.detail));

        const accountId = event.detail.recordId;
        const accountName = event.detail.recordName;
        const recordId = event.detail.context;

        if (!recordId) {
            console.error('Invalid lookup selected event. Missing context (row ID)');
            return;
        }

        // console.log('Selected account - ID:', accountId, 'Name:', accountName);

        // Update the contacts data to show the selected account name immediately
        this.contacts = this.contacts.map(row => {
            if (row.Id === recordId) {
                return {
                    ...row,
                    AccountId: accountId,
                    AccountName: accountName || accountId
                };
            }
            return row;
        });

        // Update draft values for the save operation
        this.updateDraftValues(recordId, 'AccountId', accountId);
    }

    updateDraftValues(recordId, fieldName, value) {
        const existingIndex = this.draftValues.findIndex(item => item.Id === recordId);

        if (existingIndex >= 0) {
            this.draftValues[existingIndex] = {
                ...this.draftValues[existingIndex],
                [fieldName]: value
            };
        } else {
            this.draftValues = [
                ...this.draftValues,
                { Id: recordId, [fieldName]: value }
            ];
        }
        // console.log('Updated Draft Values:', JSON.stringify(this.draftValues, null, 2));
    }

    handleSave(event){

        event.preventDefault();
        this.isLoading = true;
        /** Step1 - get the change values in the Data Table */
        this.draftValues = event.detail.draftValues;
        console.log(' Saving Draft Values: \n ', JSON.stringify(this.draftValues));

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
            if(item.LeadSource){
                fields['LeadSource'] = item.LeadSource;
            }
            if(item.AccountId){
                fields['AccountId'] = item.AccountId;
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
        refreshApex(this.wiredContacts);
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