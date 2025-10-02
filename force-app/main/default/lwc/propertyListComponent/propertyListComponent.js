import { LightningElement } from 'lwc';

export default class PropertyListComponent extends LightningElement {

    properties = [
        {
            id: '1',
            title: 'Modern Downtown Loft',
            address: '123 Main Street',
            city: 'San Francisco',
            state: 'CA',
            zipCode: '94102',
            price: 850000,
            bedrooms: 2,
            bathrooms: 2,
            sqft: 1200,
            propertyType: 'Apartment',
            status: 'For Sale',
            yearBuilt: 2020,
            imageUrl: 'https://via.placeholder.com/400x300/667eea/ffffff?text=Modern+Loft',
            isFeatured: true
        },
        {
            id: '2',
            title: 'Luxury Family Home',
            address: '456 Oak Avenue',
            city: 'Los Angeles',
            state: 'CA',
            zipCode: '90001',
            price: 1250000,
            bedrooms: 4,
            bathrooms: 3,
            sqft: 2800,
            propertyType: 'House',
            status: 'For Sale',
            yearBuilt: 2018,
            imageUrl: 'https://via.placeholder.com/400x300/10b981/ffffff?text=Luxury+Home',
            isFeatured: true
        },
        {
            id: '3',
            title: 'Cozy Studio Apartment',
            address: '789 Park Lane',
            city: 'Seattle',
            state: 'WA',
            zipCode: '98101',
            price: 2500,
            bedrooms: 1,
            bathrooms: 1,
            sqft: 650,
            propertyType: 'Apartment',
            status: 'For Rent',
            yearBuilt: 2019,
            imageUrl: 'https://via.placeholder.com/400x300/3b82f6/ffffff?text=Studio',
            isFeatured: false
        },
        {
            id: '4',
            title: 'Beachfront Condo',
            address: '321 Ocean Drive',
            city: 'Miami',
            state: 'FL',
            zipCode: '33139',
            price: 975000,
            bedrooms: 3,
            bathrooms: 2,
            sqft: 1800,
            propertyType: 'Condo',
            status: 'For Sale',
            yearBuilt: 2021,
            imageUrl: 'https://via.placeholder.com/400x300/06b6d4/ffffff?text=Beachfront',
            isFeatured: true
        },
        {
            id: '5',
            title: 'Suburban Dream House',
            address: '555 Maple Street',
            city: 'Austin',
            state: 'TX',
            zipCode: '78701',
            price: 650000,
            bedrooms: 3,
            bathrooms: 2,
            sqft: 2100,
            propertyType: 'House',
            status: 'Pending',
            yearBuilt: 2017,
            imageUrl: 'https://via.placeholder.com/400x300/f59e0b/ffffff?text=Suburban',
            isFeatured: false
        },
        {
            id: '6',
            title: 'Urban Townhouse',
            address: '888 City Plaza',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            price: 3200,
            bedrooms: 2,
            bathrooms: 2,
            sqft: 1400,
            propertyType: 'Townhouse',
            status: 'For Rent',
            yearBuilt: 2022,
            imageUrl: 'https://via.placeholder.com/400x300/8b5cf6/ffffff?text=Townhouse',
            isFeatured: false
        }
    ];

    handleDataChange(event){
        console.log('Data Changed '+Math.random());
        let eventDetails = event.detail;
        let propertyId = eventDetails.propertyId;
        let selectedRecord = this.properties.filter(item => {
            return item.id === propertyId;
        });
        console.log(JSON.stringify(selectedRecord));
    }
}