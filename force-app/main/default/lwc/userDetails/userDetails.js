import { LightningElement } from 'lwc';

export default class UserDetails extends LightningElement {
    userInformation = {
        name: "Amit Singh",
        email: "asingh@gmail.com",
        phone: "1234567890",
        photoUrl: "https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png",
        isAdmin: true,
        isManager: true,
        isEmployee: true
    }

    handleUpdateProfile(event){
        /** Step1 - Which Child component */
        let updateProfileComponent = this.refs.updateProfile;
        if(updateProfileComponent){
            updateProfileComponent.handleUpdateModal(Math.random());
        }
    }
}