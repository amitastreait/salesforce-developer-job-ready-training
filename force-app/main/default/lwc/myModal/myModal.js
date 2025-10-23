import { api } from 'lwc';
import LightningModal from 'lightning/modal';
export default class MyModal extends LightningModal {

    @api content;
    @api recordId;
    @api recordName;

    handleClose(){
        this.close('Okay');
    }

}