public with sharing class PropertyController {
    
    /**
     * Retrieves filtered property records based on multiple criteria
     * @param cityFilter - Filter by city name
     * @param typeFilter - Filter by property type
     * @param statusFilter - Filter by status
     * @param minPrice - Minimum price filter
     * @param maxPrice - Maximum price filter
     * @param minBedrooms - Minimum bedrooms filter
     * @return List of filtered Property__c records
     */
    @AuraEnabled(cacheable=true)
    public static List<Property__c> getFilteredProperties(String cityFilter, String typeFilter, String statusFilter, Decimal minPrice, Decimal maxPrice, Integer minBedrooms) {
        try {
            // Build dynamic WHERE clause
            String query = 'SELECT Name, CurrencyIsoCode, Image_URL__c, Market_value__c, Address__c, Property_Taxes__c, Have_a_fireplace__c, Listed_Date__c, Status__c, Lot_size__c, Description__c, Built_Year__c, Square_footage__c, Listing_price__c, Bathrooms__c, HOA_Fees__c, Property_Type__c, Bedrooms__c, Garage_spaces__c, Have_a_pool__c, PrimaryAgent__c, Location_Site__c, Price_Per_SqFt__c, Property_Age__c, Days_on_Market__c, Total_Monthly_Fees__c, Luxury_Property__c, Location_City__c, Location_Site__r.City__c, Location_Site__r.State__c FROM Property__c WHERE Location_Site__c != null';
            
            List<String> conditions = new List<String>();
            
            // Add city filter
            if (String.isNotBlank(cityFilter)) {
                conditions.add('Location_Site__r.City__c = :cityFilter');
            }
            
            // Add type filter
            if (String.isNotBlank(typeFilter)) {
                conditions.add('Property_Type__c = :typeFilter');
            }
            
            // Add status filter
            if (String.isNotBlank(statusFilter)) {
                conditions.add('Status__c = :statusFilter');
            }
            
            // Add minimum price filter
            if (minPrice != null && minPrice > 0) {
                conditions.add('Listing_price__c >= :minPrice');
            }
            
            // Add maximum price filter
            if (maxPrice != null && maxPrice > 0) {
                conditions.add('Listing_price__c <= :maxPrice');
            }
            
            // Add minimum bedrooms filter
            if (minBedrooms != null && minBedrooms > 0) {
                conditions.add('Bedrooms__c >= :minBedrooms');
            }
            
            // Append conditions to query
            if (!conditions.isEmpty()) {
                query += ' AND ' + String.join(conditions, ' AND ');
            }
            
            query += ' ORDER BY Name ASC LIMIT 500';
            
            // Execute query with security enforced
            return Database.query(query);
            
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching properties: ' + e.getMessage());
        }
    }
    
    /**
     * Get distinct cities for filter dropdown
     * @return List of city values
     */
    @AuraEnabled(cacheable=true)
    public static List<String> getCities() {
        try {
            List<String> cities = new List<String>();
            List<AggregateResult> results = [ SELECT City__c FROM LocationSite__c WHERE City__c != null GROUP BY City__c ORDER BY City__c];
            for (AggregateResult ar : results) {
                cities.add((String)ar.get('City__c'));
            }
            return cities;
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching cities: ' + e.getMessage());
        }
    }
}