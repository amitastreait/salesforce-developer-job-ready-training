import { api, LightningElement } from 'lwc';

export default class UpdateProfile extends LightningElement {
    @api userId;

    @api
    handleUpdateModal(recordId){
        console.log('recordId: ' + recordId);
    }
}