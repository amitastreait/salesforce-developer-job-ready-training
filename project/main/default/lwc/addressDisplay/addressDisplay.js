import { LightningElement, api } from 'lwc';

export default class AddressDisplay extends LightningElement {
    @api address = {};

    get hasAddress() {
        return this.address &&
               (this.address.street ||
                this.address.city ||
                this.address.state ||
                this.address.postalCode ||
                this.address.country);
    }
}