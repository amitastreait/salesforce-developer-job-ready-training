import { api, LightningElement } from 'lwc';

export default class LdsGetRecord extends LightningElement {
    @api recordId;
    fields = ["Name","Industry","Phone","Fax","Website","Rating"]

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