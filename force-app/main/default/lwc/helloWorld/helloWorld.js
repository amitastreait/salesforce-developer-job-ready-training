import { LightningElement } from 'lwc';

export default class HelloWorld extends LightningElement {
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
    employees = [
        { name: 'Amit', age: 90 },
        { name: 'John', age: 30 },
        { name: 'Jane', age: 20 }
    ]
    employeeMap = new Map();
    employeeSet = new Set();

    handleMessage(){
        let myMessage = '';
    }

    handeSave(){
        
    }
}