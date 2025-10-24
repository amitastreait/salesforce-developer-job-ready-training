/**
 * @description Controller for Buyer Dashboard component in Experience Cloud
 * Provides comprehensive buyer metrics including properties, orders, cart, and wishlist
 */
public with sharing class BuyerDashboardController {

    /**
     * @description Wrapper class for dashboard metrics
     */
    public class DashboardMetrics {
        @AuraEnabled public Integer totalProperties { get; set; }
        @AuraEnabled public Decimal totalPropertyValue { get; set; }
        @AuraEnabled public Decimal averagePropertyValue { get; set; }
        @AuraEnabled public Integer activeOrders { get; set; }
        @AuraEnabled public Integer completedOrders { get; set; }
        @AuraEnabled public Integer cartItemCount { get; set; }
        @AuraEnabled public Decimal cartTotalAmount { get; set; }
        @AuraEnabled public Integer wishlistCount { get; set; }
        @AuraEnabled public List<RecentOrderWrapper> recentOrders { get; set; }
        @AuraEnabled public List<PropertySummary> recentProperties { get; set; }
        @AuraEnabled public List<ActivityItem> recentActivities { get; set; }
    }

    /**
     * @description Wrapper for recent order information
     */
    public class RecentOrderWrapper {
        @AuraEnabled public String orderId { get; set; }
        @AuraEnabled public String orderNumber { get; set; }
        @AuraEnabled public String status { get; set; }
        @AuraEnabled public Date orderDate { get; set; }
        @AuraEnabled public Decimal totalAmount { get; set; }
        @AuraEnabled public Integer itemCount { get; set; }
    }

    /**
     * @description Wrapper for property summary
     */
    public class PropertySummary {
        @AuraEnabled public String propertyId { get; set; }
        @AuraEnabled public String propertyName { get; set; }
        @AuraEnabled public String imageUrl { get; set; }
        @AuraEnabled public Decimal purchasePrice { get; set; }
        @AuraEnabled public Date purchaseDate { get; set; }
        @AuraEnabled public String propertyType { get; set; }
        @AuraEnabled public String status { get; set; }
    }

    /**
     * @description Wrapper for activity timeline items
     */
    public class ActivityItem implements Comparable {
        @AuraEnabled public String activityType { get; set; }
        @AuraEnabled public String description { get; set; }
        @AuraEnabled public DateTime activityDate { get; set; }
        @AuraEnabled public String icon { get; set; }
        @AuraEnabled public String recordId { get; set; }

        // Implement compareTo for sorting by date descending
        public Integer compareTo(Object compareTo) {
            ActivityItem compareToActivity = (ActivityItem)compareTo;

            if (activityDate == null && compareToActivity.activityDate == null) {
                return 0;
            }
            if (activityDate == null) {
                return 1;
            }
            if (compareToActivity.activityDate == null) {
                return -1;
            }

            // Sort descending (most recent first)
            if (activityDate > compareToActivity.activityDate) {
                return -1;
            }
            if (activityDate < compareToActivity.activityDate) {
                return 1;
            }
            return 0;
        }
    }

    /**
     * @description Get comprehensive dashboard metrics for the current buyer
     * @return DashboardMetrics containing all buyer statistics
     */
    @AuraEnabled(cacheable=true)
    public static DashboardMetrics getDashboardMetrics() {
        try {
            DashboardMetrics metrics = new DashboardMetrics();

            // Get current user's account ID
            String userId = UserInfo.getUserId();
            User currentUser = [
                SELECT Id, ContactId, Contact.AccountId
                FROM User
                WHERE Id = :userId
                LIMIT 1
            ];

            if (currentUser.Contact == null || currentUser.Contact.AccountId == null) {
                return getEmptyMetrics();
            }

            String accountId = currentUser.Contact.AccountId;

            // Get properties owned - via Order -> OrderItem -> Product -> Property
            Map<Id, PropertySummary> propertyMap = new Map<Id, PropertySummary>();
            Decimal totalValue = 0;

            List<Order> orders = [
                SELECT Id, OrderNumber, Status, EffectiveDate, TotalAmount,
                    (SELECT Id, Product2Id, Product2.Name, Quantity, UnitPrice, TotalPrice
                     FROM OrderItems
                     WHERE Product2.Property__c != null)
                FROM Order
                WHERE AccountId = :accountId
                ORDER BY EffectiveDate DESC
                LIMIT 100
            ];

            List<String> propertyIds = new List<String>();
            for (Order ord : orders) {
                for (OrderItem item : ord.OrderItems) {
                    propertyIds.add(ord.Id);
                }
            }

            // Query properties with details
            if (!propertyIds.isEmpty()) {
                List<OrderItem> allOrderItems = [
                    SELECT Id, Product2.Property__c, Product2.Property__r.Name,
                        Product2.Property__r.Listing_price__c,
                        Product2.Property__r.Property_Type__c,
                        Product2.Property__r.Status__c,
                        Product2.Property__r.Image_URL__c,
                        UnitPrice, Order.EffectiveDate
                    FROM OrderItem
                    WHERE OrderId IN :propertyIds
                        AND Product2.Property__c != null
                    ORDER BY Order.EffectiveDate DESC
                ];

                // Get unique property IDs for image query
                Set<Id> uniquePropertyIds = new Set<Id>();
                for (OrderItem item : allOrderItems) {
                    if (item.Product2.Property__c != null) {
                        uniquePropertyIds.add(item.Product2.Property__c);
                    }
                }

                // Query property images separately
                Map<Id, String> propertyImageMap = new Map<Id, String>();
                if (!uniquePropertyIds.isEmpty()) {
                    List<Property_Image__c> propertyImages = [
                        SELECT Property__c, Image_Url__c
                        FROM Property_Image__c
                        WHERE Property__c IN :uniquePropertyIds
                        ORDER BY CreatedDate ASC
                        LIMIT 100
                    ];

                    for (Property_Image__c img : propertyImages) {
                        // Only add if not already in map (gets first image for each property)
                        if (!propertyImageMap.containsKey(img.Property__c)) {
                            propertyImageMap.put(img.Property__c, img.Image_Url__c);
                        }
                    }
                }

                for (OrderItem item : allOrderItems) {
                    if (item.Product2.Property__c != null &&
                        !propertyMap.containsKey(item.Product2.Property__c)) {

                        PropertySummary prop = new PropertySummary();
                        prop.propertyId = item.Product2.Property__c;
                        prop.propertyName = item.Product2.Property__r.Name;
                        prop.purchasePrice = item.UnitPrice;
                        prop.purchaseDate = item.Order.EffectiveDate;
                        prop.propertyType = item.Product2.Property__r.Property_Type__c;
                        prop.status = item.Product2.Property__r.Status__c;

                        // Get image URL - check primary image first, then fallback to Image_URL__c
                        if (propertyImageMap.containsKey(item.Product2.Property__c)) {
                            prop.imageUrl = propertyImageMap.get(item.Product2.Property__c);
                        } else if (item.Product2.Property__r.Image_URL__c != null) {
                            prop.imageUrl = item.Product2.Property__r.Image_URL__c;
                        }

                        propertyMap.put(item.Product2.Property__c, prop);
                        totalValue += item.UnitPrice;
                    }
                }
            }

            metrics.totalProperties = propertyMap.size();
            metrics.totalPropertyValue = totalValue;
            metrics.averagePropertyValue = metrics.totalProperties > 0 ?
                totalValue / metrics.totalProperties : 0;

            // Get recent properties (last 3)
            metrics.recentProperties = new List<PropertySummary>();
            Integer count = 0;
            for (PropertySummary prop : propertyMap.values()) {
                if (count < 3) {
                    metrics.recentProperties.add(prop);
                    count++;
                }
            }

            // Get order statistics
            Integer activeOrderCount = 0;
            Integer completedOrderCount = 0;
            List<RecentOrderWrapper> recentOrdersList = new List<RecentOrderWrapper>();

            for (Order ord : orders) {
                if (ord.Status == 'Activated' || ord.Status == 'Draft') {
                    activeOrderCount++;
                } else if (ord.Status == 'Completed') {
                    completedOrderCount++;
                }

                // Add to recent orders (last 5)
                if (recentOrdersList.size() < 5) {
                    RecentOrderWrapper orderWrap = new RecentOrderWrapper();
                    orderWrap.orderId = ord.Id;
                    orderWrap.orderNumber = ord.OrderNumber;
                    orderWrap.status = ord.Status;
                    orderWrap.orderDate = ord.EffectiveDate;
                    orderWrap.totalAmount = ord.TotalAmount != null ? ord.TotalAmount : 0;
                    orderWrap.itemCount = ord.OrderItems != null ? ord.OrderItems.size() : 0;
                    recentOrdersList.add(orderWrap);
                }
            }

            metrics.activeOrders = activeOrderCount;
            metrics.completedOrders = completedOrderCount;
            metrics.recentOrders = recentOrdersList;

            // Get cart summary
            List<Cart__c> carts = [
                SELECT Id, Total_Items__c, Total_Amount__c
                FROM Cart__c
                WHERE User__c = :userId
                    AND Status__c = 'Active'
                ORDER BY LastModifiedDate DESC
                LIMIT 1
            ];

            if (!carts.isEmpty()) {
                metrics.cartItemCount = carts[0].Total_Items__c != null ?
                    Integer.valueOf(carts[0].Total_Items__c) : 0;
                metrics.cartTotalAmount = carts[0].Total_Amount__c != null ?
                    carts[0].Total_Amount__c : 0;
            } else {
                metrics.cartItemCount = 0;
                metrics.cartTotalAmount = 0;
            }

            // Get wishlist count
            List<Wishlist__c> wishlists = [
                SELECT Id,
                    (SELECT Id FROM Wishlist_Items__r)
                FROM Wishlist__c
                WHERE User__c = :userId
                LIMIT 1
            ];

            metrics.wishlistCount = 0;
            if (!wishlists.isEmpty() && wishlists[0].Wishlist_Items__r != null) {
                metrics.wishlistCount = wishlists[0].Wishlist_Items__r.size();
            }

            // Build activity timeline
            metrics.recentActivities = buildActivityTimeline(orders, propertyMap.values());

            return metrics;

        } catch (Exception e) {
            System.debug('Error in getDashboardMetrics: ' + e.getMessage());
            throw new AuraHandledException('Unable to load dashboard metrics: ' + e.getMessage());
        }
    }

    /**
     * @description Build activity timeline from orders and properties
     */
    private static List<ActivityItem> buildActivityTimeline(
        List<Order> orders,
        List<PropertySummary> properties
    ) {
        List<ActivityItem> activities = new List<ActivityItem>();

        // Add order activities
        for (Order ord : orders) {
            if (activities.size() >= 10) break;

            ActivityItem activity = new ActivityItem();
            activity.activityType = 'Order';
            activity.description = 'Order ' + ord.OrderNumber + ' - ' + ord.Status;
            activity.activityDate = DateTime.newInstance(ord.EffectiveDate, Time.newInstance(0, 0, 0, 0));
            activity.icon = 'standard:orders';
            activity.recordId = ord.Id;
            activities.add(activity);
        }

        // Add property purchase activities
        for (PropertySummary prop : properties) {
            if (activities.size() >= 10) break;

            ActivityItem activity = new ActivityItem();
            activity.activityType = 'Property';
            activity.description = 'Purchased ' + prop.propertyName;
            activity.activityDate = DateTime.newInstance(prop.purchaseDate, Time.newInstance(0, 0, 0, 0));
            activity.icon = 'standard:home';
            activity.recordId = prop.propertyId;
            activities.add(activity);
        }

        // Sort by date descending
        activities.sort();

        return activities;
    }

    /**
     * @description Return empty metrics when no account is found
     */
    private static DashboardMetrics getEmptyMetrics() {
        DashboardMetrics metrics = new DashboardMetrics();
        metrics.totalProperties = 0;
        metrics.totalPropertyValue = 0;
        metrics.averagePropertyValue = 0;
        metrics.activeOrders = 0;
        metrics.completedOrders = 0;
        metrics.cartItemCount = 0;
        metrics.cartTotalAmount = 0;
        metrics.wishlistCount = 0;
        metrics.recentOrders = new List<RecentOrderWrapper>();
        metrics.recentProperties = new List<PropertySummary>();
        metrics.recentActivities = new List<ActivityItem>();
        return metrics;
    }
}
