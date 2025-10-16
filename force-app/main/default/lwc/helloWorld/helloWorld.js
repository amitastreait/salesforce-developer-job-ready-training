import { LightningElement, api, wire, track } from 'lwc';

import { ShowToastEvent } from 'lightning/platformShowToastEvent'

export default class HelloWorld extends LightningElement {

    showTom = false;
    showJerry = false;

    images = {
        tom: "https://i.pinimg.com/736x/f8/3d/b0/f83db01f1cd7075f004d914000dba049.jpg",
        jerry: "https://static.vecteezy.com/system/resources/previews/022/024/202/non_2x/tom-and-jerry-cartoon-free-vector.jpg",
        both: "https://miro.medium.com/v2/resize:fit:1400/1*pzbYin_gqDNVjOSLQs06NQ.jpeg"
    }

    /**
     * properties are nothing these are the
     * Lower Camel Case - welcomeMessage
     * Upper Camel Case - WelcomeMessage
     * Upper Case -  WELCOME_MESSAGE
     * Kebab Case
     * Lower Case - welcome_message
    */
    welcomeMessage = 'Hello World! This is my first LWC';
    modernMessage = `The modern UI standard for Salesforce` 
    name = 'Amit Singh';
    heading = ` ${this.name} Welcome to the world of Lightning Web Component!`;// String interpolation
    website = 'www.PantherSchools.com';
    age = 90;
    account; // undefined

    connectedCallback(){
        this.dispatchEvent(new ShowToastEvent({
            title: "This is the sample toast notification",
            message: "This is the sample toast notification",
            variant: "success",
            mode: "dismissable"
        }));
    }

    @api 
    accountName = 'Salesforce.com';

    person = { // objects in JS
        name: 'Amit Singh',
        age: 90,
        isAdmin: true,
        salary : 1000000,
        hobbies: ['Reading', 'Writing', 'Coding', 'Gaming', 'Cooking', 'Dancing', 'Singing', 'Painting', 'Drawing'],
        address: {
            city: 'Delhi',
            state: 'Delhi',
            country: 'India'
        }
    }
    // person.address = undefined
    // person.address.city = undefined.city
    fruits = ['Apple', 'Banana', 'Mango', 'Orange', 'Grapes', 'Pineapple', 'Watermelon', 'Papaya']
    @track
    employees = [
        { name: 'Amit', age: 90, id: 1 },
        { name: 'John', age: 30, id: 2},
        { name: 'Jane', age: 20, id: 3}
    ]
    /**
        <template for:each={employees} for:item="employee" for:index="index">

        </template>
        for(String employee: employees){
        }
     */
    employeeMap = new Map();
    employeeSet = new Set();

    handleMessage(){
        let myMessage = '';
    }

    handeSave(){

    }
}