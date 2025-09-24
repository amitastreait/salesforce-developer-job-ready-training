import { LightningElement } from 'lwc';

export default class ContactList extends LightningElement {

    contacts = [
        {
            "Id": "003XXXXXXXXXXXXXXX",
            "Name": "John Doe",
            "FirstName": "John",
            "LastName": "Doe",
            "Email": "john.doe@example.com",
            "Phone": "555-123-4567",
            "AccountId": "001XXXXXXXXXXXXXXX",
            "AccountName": "Acme Corp"
        },
        {
            "Id": "003YYYYYYYYYYYYYYY",
            "Name": "Jane Smith",
            "FirstName": "Jane",
            "LastName": "Smith",
            "Email": "jane.smith@example.com",
            "Phone": "555-987-6543",
            "AccountId": "001ZZZZZZZZZZZZZZZ",
            "AccountName": "Global Solutions"
        }
    ]
}