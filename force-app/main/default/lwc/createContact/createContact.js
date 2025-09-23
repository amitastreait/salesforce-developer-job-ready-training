import { LightningElement } from 'lwc';

export default class CreateContact extends LightningElement {

    _options = [
        { label: 'Call', value: 'Call' },
        { label: 'Email', value: 'Email' },
        { label: 'Web Site', value: 'Web Site' },
        { label: 'Other', value: 'Other' }
    ]

    _firstName;
    _lastName;
    _email;
    _phone;
    _leadSource;
    _isPrimaryContact;

    handleFirstName(event){ // event, evt, myEvent
        console.log('handleFirstName');
        console.log(event);
        console.log(event.target);
        console.log(event.target.value);
        console.log(event.target.label);
        console.log(event.target.name);
        console.log(event.target.variant);
        console.log('-------------------');
        console.log(event.key);
        console.log(event.code);
        console.log(event.ctrlKey);
        console.log(event.shiftKey);
        console.log(event.altKey);
        this._firstName = event.target.value;
    }

    handleLastName(event){
        console.log('handleLastName');
        console.log(event);
        console.log(event.target);
        console.log(event.target.value);
        console.log('-------------------');
        this._lastName = event.target.value;
    }

    handleEmail(evt){
        console.log('handleEmail');
        console.log(evt);
        console.log(evt.target);
        console.log(evt.target.value);
        console.log('-------------------');
        this._email = evt.target.value;
    }

    handlePhone(evt){
        console.log('handlePhone');
        console.log(evt);
        console.log(evt.target);
        console.log(evt.target.value);
        console.log('-------------------');
        this._phone = evt.target.value;
    }

    handleLeadSource(evt){
        console.log('handleLeadSource');
        console.log(evt);
        console.log(evt.target);
        console.log(evt.target.value);
        console.log('-------------------');
        this._leadSource = evt.target.value;
    }

    handlePrimary(event){
        console.log('handlePrimary');
        console.log(event);
        console.log(event.target);
        console.log(event.target.checked);
        console.log('-------------------');
        this._isPrimaryContact = event.target.checked;
    }

    handleMouseOver(event){
        alert('Mouse Over');
    }
    handleEnterKey(event){
        console.log('handleEnterKey');
        console.log(event.key);
    }

    handleCreateContact(event){
        console.log('handleCreateContact');
        console.log(this._firstName);
        console.log(this._lastName);
        console.log(this._email);
        console.log(this._phone);
        console.log(this._leadSource);
        console.log(this._isPrimaryContact);
    }
}