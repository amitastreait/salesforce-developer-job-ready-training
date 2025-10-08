import { LightningElement, wire } from 'lwc';
import { getObjectInfo, getPicklistValues, getPicklistValuesByRecordType } from 'lightning/uiObjectInfoApi';
import ACCOUNT_OBJECT from "@salesforce/schema/Account";
import TYPE_FIELD from "@salesforce/schema/Account.Type";

const DUMMY_RECORDTYPE_ID = '012000000000000AAA';
let recordTypeId = DUMMY_RECORDTYPE_ID;

export default class UiObjectInfoApi extends LightningElement {
    
    typeOpions = [];
    statusOptions = [];
    fieldApiName = 'Property_Type__c'

    fieldInfo = {
        "fieldApiName": "Type",
        "objectApiName": "Account"
    }

    objectInfo = {
        "objectApiName": "Property__c"
    }

    displayInfo = {
        primaryField: 'Name',
        additionalFields: ['Phone'],
    };

    matchingInfo = {
        primaryField: { fieldPath: 'Name' },
        additionalFields: [{ fieldPath: 'Industry' }],
    };

    connectedCallback(){
        console.log('ACCOUNT_OBJECT', ACCOUNT_OBJECT);
        console.log('TYPE_FIELD', TYPE_FIELD);
    }

    @wire(getObjectInfo, { objectApiName: '$objectInfo' })
    wiredObjectInfo({data, error}){
        if(data){
            console.log('Object ', data);
        }
        else if(error){
            console.error(error)
        }
    }

    @wire(getPicklistValues, { recordTypeId: DUMMY_RECORDTYPE_ID, fieldApiName: '$fieldInfo' })
    wiredPicklistValues({data, error}){
        // let 
        if(data){
            console.log('field ', data);
            this.typeOpions = data.values;
            /* this.typeOpions = this.typeOpions.map(item => {
                return {
                    label: item.label,
                    value: item.value
                }
            }) */
        }
        else if(error){
            console.error('error ', error)
        }
    }

    @wire(getPicklistValuesByRecordType, {
        objectApiName: '$objectInfo',
        recordTypeId: DUMMY_RECORDTYPE_ID,
    })
    wiredPicklistValuesByRecordType({data, error}){
        if(data){
            console.log('data wiredPicklistValuesByRecordType', data);
            console.log('data wiredPicklistValuesByRecordType', data.picklistFieldValues);
            let status = data.picklistFieldValues.Status__c;
            this.statusOptions = status.values;

            console.log(data.picklistFieldValues[this.fieldApiName]);
        }
        else if(error){
            console.error('error wiredPicklistValuesByRecordType', error)
        }
    }

    handleInputChange(event){
        let selectedRecordId = event.detail.recordId;;
        console.log('selectedRecordId '+ selectedRecordId);
    }
}