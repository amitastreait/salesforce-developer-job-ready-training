import { api, LightningElement, track } from 'lwc';

export default class LdsCreate extends LightningElement {
    @api objectApiName = 'Contact';
    @api recordId;
    @track fields = [
        "FirstName", "LastName", "Email", "Phone", "Title"
    ];

    handleSubmit(event) {
        event.preventDefault();
        const fields = event.detail.fields;
        fields.AccountId = this.recordId;
        fields.Email = 'amitasing@gmail.com';
        fields.Phone = '9856321470';

        console.log(JSON.stringify(fields));

        this.template.querySelector('lightning-record-form').submit(fields);
    }
}