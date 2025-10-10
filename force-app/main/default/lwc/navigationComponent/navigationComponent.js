import { api, LightningElement } from 'lwc';

//1 import { NavigationMixin } from 'lightning/navigation';
import { NavigationMixin } from 'lightning/navigation';

export default class NavigationComponent extends NavigationMixin(LightningElement) {

    @api recordId;
    handleNavigateRecord(event){
        this[NavigationMixin.Navigate]({
            type: "standard__recordPage",
            attributes: {
                actionName: "edit", // view, edit, clone
                recordId: "a0SgL0000009OrJUAU"
            }
        });
    }

    handleNavigateObject(){
        this[NavigationMixin.Navigate]({
          type: "standard__objectPage",
          attributes: {
            actionName: "new",
            objectApiName: "Account"
          }
        });
    }
    navigateToCustomTab(){
        /* this[NavigationMixin.Navigate]({
          type: "standard__namedPage",
          attributes: {
            pageName: 'Property_Explorer'
          }
        }); */
        this[NavigationMixin.Navigate]({
            type: "standard__navItemPage",
            attributes: {
                apiName: "Property_Explorer"
            },
            state: {
                c__recordId : this.recordId,
                c__source : 'Navigation Component',
                c__message : 'Hello from Navigation Component',
                c__newMessage: 'Hello from Navigation Component'
            }
        });
    }

    navigateToLwc(){
        this[NavigationMixin.Navigate]({
            type: 'standard__component',
            attributes: {
                componentName: 'c__contactList'
            },
            state: {
                c__counter: '5'
            }
        });
    }
}