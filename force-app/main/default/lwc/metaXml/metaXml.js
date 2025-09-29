import { api, LightningElement } from 'lwc';

export default class MetaXml extends LightningElement {
    @api recordId;
    @api objectApiName;
    @api message;
    @api strName;
    @api showDetails;
    @api empName;
    @api empDepartment;
    @api empLocation;
    @api empAge;
    @api empGender;
    @api recordLimit;
}