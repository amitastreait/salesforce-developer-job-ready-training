import { api, LightningElement } from 'lwc';

export default class ContactCard extends LightningElement {
   @api contactInformation;
   @api message;
   @api wlecomemessage;
}