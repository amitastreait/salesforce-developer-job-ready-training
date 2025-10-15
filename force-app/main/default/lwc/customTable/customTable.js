import LightningDatatable from 'lightning/datatable';
import customPicture from './templates/customPicture.html';
import picklistTemplate from './templates/picklist.html';
import customPicklistEditTemplate from "./templates/picklistEdit.html";
import toggleTemplate from './templates/toggelTemplate.html';
import customNumberTemplate from "./templates/customNumber.html";
import customNumberEditTemplate from "./templates/customNumberEdit.html";
import customLinkTemplate from "./templates/href.html";
import lookupTemplate from "./templates/lookup.html";
import lookupEditTemplate from "./templates/lookupEdit.html";
export default class CustomTable extends LightningDatatable {
    static customTypes = {
        customPictureType: {
            template: customPicture,
            standardCellLayout: true,
            typeAttributes: ['pictureUrl', 'context']
        },
        picklist: {
            template: picklistTemplate,
            editTemplate: customPicklistEditTemplate,
            standardCellLayout: true,
            typeAttributes: [
                'name', 'label', 'value', 'placeholder', 'context', 'options', 'variant'
            ]
        },
        toggle: {
            template:  toggleTemplate,
            standardCellLayout: true,
            typeAttributes : ['value', 'context']
        },
        customNumber: {
            template: customNumberTemplate,
            editTemplate: customNumberEditTemplate,
            standardCellLayout: true,
            typeAttributes: ["status", "min", "currencyCode", "percent", "required", 'context'],
        },
        customLink: {
            template: customLinkTemplate,
            standardCellLayout: true,
            typeAttributes: [
                "recordId",
                "nameField",
                "openUrl", 'context'
            ],
        },
        lookup: {
            template: lookupTemplate,
            editTemplate: lookupEditTemplate,
            standardCellLayout: true,
            typeAttributes: [
                "objectApiName",
                "label",
                "placeholder",
                "displayValue",
                "filter",
                "displayInfo",
                "matchingInfo",
                "nameField",
                "context"
            ],
        },
    };
}