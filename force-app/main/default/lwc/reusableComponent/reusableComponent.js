import { LightningElement } from 'lwc';
import { add, sub } from 'c/ldsUtils';
export default class ReusableComponent extends LightningElement {

    connectedCallback(){
        console.log('add', add(1, 2));
        console.log('sub', sub(1, 2));
    }
}