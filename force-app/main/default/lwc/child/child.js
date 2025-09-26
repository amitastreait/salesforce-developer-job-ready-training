import { api, LightningElement } from 'lwc';

export default class Child extends LightningElement {

    @api message;
    constructor() {
        super();
        console.log('Child constructor');
        console.log('Child message: ' + this.message);
    }

    connectedCallback() {
        console.log('Child connectedCallback');
        console.log('Child message inside connectedCallback : ' + this.message);
        // throw new Error('Child connectedCallback error');
    }

    disconnectedCallback() {
        console.log('Child disconnectedCallback');
    }

    renderedCallback(){
        console.log('Child renderedCallback');
    }

}