import { api, LightningElement } from 'lwc';

export default class ProfileCard extends LightningElement {
    @api name;
    @api email;
    @api phone;
    @api photoUrl;
    @api isAdmin;
    @api isManager;
    @api isEmployee;
}