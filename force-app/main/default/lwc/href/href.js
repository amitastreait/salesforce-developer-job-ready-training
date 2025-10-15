import { LightningElement, api } from 'lwc';

export default class Href extends LightningElement {

    @api recordId;
    @api value;
    @api openUrl;

    handleHrefClick(event){
        event.preventDefault();
        let recordId = event.currentTarget.dataset.id;
        let openUrl = event.currentTarget.dataset.url;
        if(openUrl !== 'false' && openUrl !== false && openUrl !== undefined && openUrl !== null && openUrl !== ''){
            let finalUrl = `https://${location.host}/lightning/r/Account/${recordId}/view`;
            window.open(finalUrl, "_blank");
        } else {
            /** dispatch the event and given the record Id and name field back */
            this.dispatchEvent(new CustomEvent('hrefselect', {
                detail: {
                    recordId: recordId,
                    recordName: this.value
                },
                bubbles: true,
                composed: true
            }));
        }
    }
}