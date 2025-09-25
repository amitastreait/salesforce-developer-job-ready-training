import { LightningElement } from 'lwc';

export default class Parent extends LightningElement {
    message;
    showHide = true;

    constructor() {
        super();
        this.message = 'Lifecycle Hook methods are called in the following order: constructor, connectedCallback, renderedCallback, and then updatedCallback.';
        console.log('Parent constructor');
    }

    connectedCallback() {
        console.log('Parent connectedCallback');
    }

    errorCallback(error, stack) {
        console.log('Parent errorCallback');
        console.log('Parent error: ' + error);
        console.log('Parent stack: ' + stack);
    }

    handleClick(event){
        this.showHide = !this.showHide;
        // true ~= false
        // false ~= true
    }
}