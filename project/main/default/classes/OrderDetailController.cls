public without sharing class OrderDetailController {

    /**
     * Get order details by Order ID
     */
    @AuraEnabled(cacheable=true)
    public static OrderDetailWrapper getOrderDetails(String orderId) {
        try {
            OrderDetailWrapper orderDetail = new OrderDetailWrapper();

            // Get Order information
            Order order = [
                SELECT Id, OrderNumber, Status, CreatedDate, EffectiveDate,
                       TotalAmount, Description,
                       Account.Name, Account.PersonEmail, Account.Phone,
                       ShippingStreet, ShippingCity, ShippingState,
                       ShippingPostalCode, ShippingCountry,
                       BillingStreet, BillingCity, BillingState,
                       BillingPostalCode, BillingCountry
                FROM Order
                WHERE Id = :orderId
                LIMIT 1
            ];

            orderDetail.orderId = order.Id;
            orderDetail.orderNumber = order.OrderNumber;
            orderDetail.orderDate = order.CreatedDate;
            orderDetail.status = order.Status;
            orderDetail.customerName = order.Account.Name;
            orderDetail.customerEmail = order.Account.PersonEmail;
            orderDetail.customerPhone = order.Account.Phone;
            orderDetail.shippingStreet = order.ShippingStreet;
            orderDetail.shippingCity = order.ShippingCity;
            orderDetail.shippingState = order.ShippingState;
            orderDetail.shippingPostalCode = order.ShippingPostalCode;
            orderDetail.shippingCountry = order.ShippingCountry;

            // Get OrderItems
            List<OrderItem> items = [
                SELECT Id, OrderItemNumber, Quantity, UnitPrice, TotalPrice,
                       Description, Product2Id, Product2.Name,
                       Product2.Property__c, Product2.Property__r.Name,
                       Product2.Property__r.Image_URL__c,
                       Product2.Property__r.Address__c,
                       Product2.Property__r.Location_Site__r.City__c,
                       Product2.Property__r.Location_Site__r.State__c
                FROM OrderItem
                WHERE OrderId = :orderId
                ORDER BY OrderItemNumber ASC
            ];

            List<OrderItemWrapper> orderItems = new List<OrderItemWrapper>();
            Decimal subtotal = 0;
            Integer itemCount = 0;

            for (OrderItem item : items) {
                OrderItemWrapper oiw = new OrderItemWrapper();
                oiw.id = item.Id;
                oiw.propertyId = item.Product2.Property__c;
                oiw.propertyName = item.Description != null ? item.Description :
                                   (item.Product2.Property__r?.Name != null ? item.Product2.Property__r.Name : item.Product2.Name);
                oiw.propertyPrice = item.UnitPrice;
                oiw.propertyImage = item.Product2.Property__r?.Image_URL__c;
                oiw.propertyAddress = item.Product2.Property__r?.Address__c;
                oiw.quantity = Integer.valueOf(item.Quantity);
                oiw.subtotal = item.UnitPrice * item.Quantity;
                oiw.total = item.TotalPrice;

                String location = '';
                if (item.Product2.Property__r?.Location_Site__r?.City__c != null) {
                    location = item.Product2.Property__r.Location_Site__r.City__c;
                    if (item.Product2.Property__r?.Location_Site__r?.State__c != null) {
                        location += ', ' + item.Product2.Property__r.Location_Site__r.State__c;
                    }
                }
                oiw.location = location;

                orderItems.add(oiw);

                if (item.TotalPrice != null) {
                    subtotal += item.TotalPrice;
                }
                itemCount += Integer.valueOf(item.Quantity);
            }

            orderDetail.items = orderItems;
            orderDetail.subtotal = subtotal;
            orderDetail.totalItems = itemCount;

            // Calculate tax and shipping (same logic as checkout)
            orderDetail.taxRate = 8.5;
            orderDetail.tax = (subtotal * orderDetail.taxRate) / 100;
            orderDetail.shipping = subtotal > 500000 ? 0 : 99.00;
            orderDetail.total = subtotal + orderDetail.tax + orderDetail.shipping;
            orderDetail.totalAmount = orderDetail.total;

            return orderDetail;

        } catch (Exception e) {
            throw new AuraHandledException('Error fetching order details: ' + e.getMessage());
        }
    }

    /**
     * Get user's order history
     */
    @AuraEnabled(cacheable=true)
    public static List<OrderSummaryWrapper> getUserOrders() {
        try {
            Id userId = UserInfo.getUserId();
            List<OrderSummaryWrapper> ordersList = new List<OrderSummaryWrapper>();

            // Get user's account
            User currentUser = [
                SELECT Id, AccountId
                FROM User
                WHERE Id = :userId
                LIMIT 1
            ];

            if (currentUser.AccountId == null) {
                return ordersList; // No orders if no account
            }

            // Get all orders for the user's account
            List<Order> orders = [
                SELECT Id, OrderNumber, Status, CreatedDate, TotalAmount,
                       (SELECT Id, Quantity FROM OrderItems)
                FROM Order
                WHERE AccountId = :currentUser.AccountId
                ORDER BY CreatedDate DESC
                LIMIT 50
            ];

            for (Order order : orders) {
                OrderSummaryWrapper osw = new OrderSummaryWrapper();
                osw.orderId = order.Id;
                osw.orderNumber = order.OrderNumber;
                osw.orderDate = order.CreatedDate;
                osw.status = order.Status;
                osw.totalAmount = order.TotalAmount != null ? order.TotalAmount : 0;

                // Calculate total items
                Integer itemCount = 0;
                for (OrderItem item : order.OrderItems) {
                    itemCount += Integer.valueOf(item.Quantity);
                }
                osw.totalItems = itemCount;

                ordersList.add(osw);
            }

            return ordersList;

        } catch (Exception e) {
            throw new AuraHandledException('Error fetching orders: ' + e.getMessage());
        }
    }

    // Wrapper Classes
    public class OrderDetailWrapper {
        @AuraEnabled public String orderId { get; set; }
        @AuraEnabled public String orderNumber { get; set; }
        @AuraEnabled public DateTime orderDate { get; set; }
        @AuraEnabled public String status { get; set; }
        @AuraEnabled public Integer totalItems { get; set; }
        @AuraEnabled public Decimal subtotal { get; set; }
        @AuraEnabled public Decimal tax { get; set; }
        @AuraEnabled public Decimal taxRate { get; set; }
        @AuraEnabled public Decimal shipping { get; set; }
        @AuraEnabled public Decimal totalAmount { get; set; }
        @AuraEnabled public Decimal total { get; set; }
        @AuraEnabled public String customerName { get; set; }
        @AuraEnabled public String customerEmail { get; set; }
        @AuraEnabled public String customerPhone { get; set; }
        @AuraEnabled public String shippingStreet { get; set; }
        @AuraEnabled public String shippingCity { get; set; }
        @AuraEnabled public String shippingState { get; set; }
        @AuraEnabled public String shippingPostalCode { get; set; }
        @AuraEnabled public String shippingCountry { get; set; }
        @AuraEnabled public List<OrderItemWrapper> items { get; set; }
    }

    public class OrderItemWrapper {
        @AuraEnabled public String id { get; set; }
        @AuraEnabled public String propertyId { get; set; }
        @AuraEnabled public String propertyName { get; set; }
        @AuraEnabled public String propertyAddress { get; set; }
        @AuraEnabled public Decimal propertyPrice { get; set; }
        @AuraEnabled public String propertyImage { get; set; }
        @AuraEnabled public Integer quantity { get; set; }
        @AuraEnabled public Decimal subtotal { get; set; }
        @AuraEnabled public Decimal discount { get; set; }
        @AuraEnabled public Decimal total { get; set; }
        @AuraEnabled public String location { get; set; }
    }

    public class OrderSummaryWrapper {
        @AuraEnabled public String orderId { get; set; }
        @AuraEnabled public String orderNumber { get; set; }
        @AuraEnabled public DateTime orderDate { get; set; }
        @AuraEnabled public String status { get; set; }
        @AuraEnabled public Integer totalItems { get; set; }
        @AuraEnabled public Decimal totalAmount { get; set; }
    }
}
