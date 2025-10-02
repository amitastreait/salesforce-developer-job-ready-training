import { api, LightningElement } from 'lwc';

export default class PropertyDetailComponent extends LightningElement {

    @api property = {
        name: 'Test Property',
        description: 'This is a test property',
        bedrooms: 3,
        bathrooms: 2,
        price: 1000000,
        imageUrl: 'https://www.lightningdesignsystem.com/assets/images/carousel/carousel-01.jpg',
        Id: '1234567890'
    };

    handleClick(event){
        console.log('Button Clicked');
        /** Step1 - Prepare The event */
        const myEvent = new CustomEvent(
            'datachange', {
                detail: {
                    propertyId: this.property.id
                },
                bubbles: true,
                composed: false
            }
        );

        /** Step2 - Fire the Event */
        this.dispatchEvent(myEvent);
    }
}