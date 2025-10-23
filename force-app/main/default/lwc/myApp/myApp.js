import { LightningElement } from 'lwc';
import MY_MODAL from 'c/myModal';
export default class MyApp extends LightningElement {

    async handleOpenModal(){
        const result = await MY_MODAL.open({
            label: 'Modal header Title',
            size: 'large',
            description: 'this is my modal for testing purpose',
            content: 'Modal using Standard Lightning base component',
            recordId: '3464544',
            recordName :'Salesforce.com with Pantherschools.com'
        });
        console.log('Modal has been closed ', result);
    }
}