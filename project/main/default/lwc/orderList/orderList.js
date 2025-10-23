import { LightningElement, api } from 'lwc';

export default class OrderList extends LightningElement {
    @api orders = [];

    get hasOrders() {
        return this.orders && this.orders.length > 0;
    }

    handleViewOrder(event) {
        const orderId = event.currentTarget.dataset.orderId;
        const viewOrderEvent = new CustomEvent('vieworder', {
            detail: { orderId }
        });
        this.dispatchEvent(viewOrderEvent);
    }

    handleBrowseProducts(event) {
        const browseEvent = new CustomEvent('browseproducts');
        this.dispatchEvent(browseEvent);
    }

    handleReorder(event) {
        const orderId = event.currentTarget.dataset.orderId;
        const reorderEvent = new CustomEvent('reorder', {
            detail: { orderId }
        });
        this.dispatchEvent(reorderEvent);
    }

    handleTrackOrder(event) {
        const orderId = event.currentTarget.dataset.orderId;
        const trackEvent = new CustomEvent('trackorder', {
            detail: { orderId }
        });
        this.dispatchEvent(trackEvent);
    }
}
