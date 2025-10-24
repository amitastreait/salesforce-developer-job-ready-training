public without sharing class MyPropertiesController {

    /**
     * Get all properties purchased by the current user through orders
     * Relationship: User -> Account -> Orders -> Order Items -> Products -> Properties
     */
    @AuraEnabled(cacheable=true)
    public static List<PropertyWrapper> getMyProperties() {
        try {
            Id userId = UserInfo.getUserId();
            List<PropertyWrapper> propertyList = new List<PropertyWrapper>();

            // Get user's contact and account information
            User currentUser = [
                SELECT Id, ContactId, AccountId
                FROM User
                WHERE Id = :userId
                LIMIT 1
            ];

            if (currentUser.ContactId == null) {
                return propertyList;
            }

            // Get all activated orders for the user's account
            List<Order> orders = [
                SELECT Id, OrderNumber
                FROM Order
                WHERE (AccountId = :currentUser.AccountId
                   OR CustomerAuthorizedById = :currentUser.ContactId
                   OR BillToContactId = :currentUser.ContactId)
                AND Status = 'Activated'
            ];

            if (orders.isEmpty()) {
                return propertyList;
            }

            // Collect order IDs
            Set<Id> orderIds = new Set<Id>();
            for (Order ord : orders) {
                orderIds.add(ord.Id);
            }

            // Get all order items with product and property information
            List<OrderItem> orderItems = [
                SELECT Id, OrderId, Order.OrderNumber, Order.EffectiveDate,
                       Product2Id, Product2.Name, Product2.Property__c,
                       Product2.Property__r.Id,
                       Product2.Property__r.Name,
                       Product2.Property__r.Status__c,
                       Product2.Property__r.Property_Type__c,
                       Product2.Property__r.Listing_price__c,
                       Product2.Property__r.Bedrooms__c,
                       Product2.Property__r.Bathrooms__c,
                       Product2.Property__r.Address__c,
                       Product2.Property__r.Image_URL__c,
                       Product2.Property__r.Location_Site__r.City__c,
                       Product2.Property__r.Location_Site__r.State__c,
                       Quantity, UnitPrice, TotalPrice
                FROM OrderItem
                WHERE OrderId IN :orderIds
                AND Product2.Property__c != null
                ORDER BY CreatedDate DESC
            ];

            // Get property IDs to query images
            Set<Id> propertyIds = new Set<Id>();
            for (OrderItem item : orderItems) {
                if (item.Product2.Property__c != null) {
                    propertyIds.add(item.Product2.Property__c);
                }
            }

            // Query first image for each property
            Map<Id, String> propertyImageMap = new Map<Id, String>();
            List<Property_Image__c> propertyImages = [
                SELECT Id, Property__c, Image_URL__c
                FROM Property_Image__c
                WHERE Property__c IN :propertyIds
                ORDER BY CreatedDate ASC
            ];

            for (Property_Image__c img : propertyImages) {
                if (!propertyImageMap.containsKey(img.Property__c)) {
                    propertyImageMap.put(img.Property__c, img.Image_URL__c);
                }
            }

            // Use a map to track unique properties (avoid duplicates)
            Map<Id, PropertyWrapper> propertyMap = new Map<Id, PropertyWrapper>();

            for (OrderItem item : orderItems) {
                Id propertyId = item.Product2.Property__c;

                // Only add if not already in the map (first occurrence = most recent)
                if (!propertyMap.containsKey(propertyId)) {
                    PropertyWrapper pw = new PropertyWrapper();
                    pw.propertyId = propertyId;
                    pw.propertyName = item.Product2.Property__r.Name;
                    pw.status = item.Product2.Property__r.Status__c;
                    pw.propertyType = item.Product2.Property__r.Property_Type__c;
                    pw.listingPrice = item.Product2.Property__r.Listing_price__c;
                    pw.bedrooms = item.Product2.Property__r.Bedrooms__c;
                    pw.bathrooms = item.Product2.Property__r.Bathrooms__c;
                    pw.address = item.Product2.Property__r.Address__c;

                    // Priority: 1. Property_Image__c, 2. Image_URL__c field
                    if (propertyImageMap.containsKey(propertyId)) {
                        pw.imageUrl = propertyImageMap.get(propertyId);
                    } else {
                        pw.imageUrl = item.Product2.Property__r.Image_URL__c;
                    }

                    // Build location string
                    String location = '';
                    if (item.Product2.Property__r.Location_Site__r?.City__c != null) {
                        location = item.Product2.Property__r.Location_Site__r.City__c;
                        if (item.Product2.Property__r.Location_Site__r.State__c != null) {
                            location += ', ' + item.Product2.Property__r.Location_Site__r.State__c;
                        }
                    }
                    pw.location = location;

                    // Purchase details
                    pw.purchasePrice = item.UnitPrice;
                    pw.purchaseDate = item.Order.EffectiveDate;
                    pw.orderNumber = item.Order.OrderNumber;

                    propertyMap.put(propertyId, pw);
                }
            }

            // Convert map values to list
            propertyList = propertyMap.values();

            return propertyList;

        } catch (Exception e) {
            throw new AuraHandledException('Error fetching properties: ' + e.getMessage());
        }
    }

    /**
     * Get property count for the current user
     */
    @AuraEnabled(cacheable=true)
    public static Integer getPropertyCount() {
        try {
            List<PropertyWrapper> properties = getMyProperties();
            return properties.size();
        } catch (Exception e) {
            return 0;
        }
    }

    // Wrapper class for property data
    public class PropertyWrapper {
        @AuraEnabled public String propertyId { get; set; }
        @AuraEnabled public String propertyName { get; set; }
        @AuraEnabled public String status { get; set; }
        @AuraEnabled public String propertyType { get; set; }
        @AuraEnabled public Decimal listingPrice { get; set; }
        @AuraEnabled public Decimal bedrooms { get; set; }
        @AuraEnabled public Decimal bathrooms { get; set; }
        @AuraEnabled public String address { get; set; }
        @AuraEnabled public String imageUrl { get; set; }
        @AuraEnabled public String location { get; set; }
        @AuraEnabled public Decimal purchasePrice { get; set; }
        @AuraEnabled public Date purchaseDate { get; set; }
        @AuraEnabled public String orderNumber { get; set; }
    }
}