public without sharing class PropertyController {

    /**
     * Retrieves filtered property records based on multiple criteria
     * @param cityFilter - Filter by city name
     * @param typeFilter - Filter by property type
     * @param statusFilter - Filter by status
     * @param minPrice - Minimum price filter
     * @param maxPrice - Maximum price filter
     * @param minBedrooms - Minimum bedrooms filter
     * @return List of Property__c records with related images
     */
    @AuraEnabled(cacheable=true)
    public static List<Property__c> getFilteredProperties(String cityFilter, String typeFilter, String statusFilter, Decimal minPrice, Decimal maxPrice, Integer minBedrooms) {
        try {
            // Build dynamic WHERE clause - Include subquery for Property Images
            String query = 'SELECT Id, Name, CurrencyIsoCode, Image_URL__c, Market_value__c, Address__c, Property_Taxes__c, Have_a_fireplace__c, Listed_Date__c, Status__c, Lot_size__c, Description__c, Built_Year__c, Square_footage__c, Listing_price__c, Bathrooms__c, HOA_Fees__c, Property_Type__c, Bedrooms__c, Garage_spaces__c, Have_a_pool__c, PrimaryAgent__c, Location_Site__c, Price_Per_SqFt__c, Property_Age__c, Days_on_Market__c, Total_Monthly_Fees__c, Luxury_Property__c, Location_City__c, Location_Site__r.City__c, Location_Site__r.State__c, (SELECT Id, Name, Image_Url__c, Type__c FROM Property_Images__r ORDER BY CreatedDate ASC LIMIT 1) FROM Property__c WHERE Location_Site__c != null AND Status__c = \'Available\' ';

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

            // Execute query
            List<Property__c> properties = Database.query(query);
            System.debug('Query: \n ' + JSON.serialize(properties));
            return properties;

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

    /**
     * Retrieves detailed property information including related records
     * @param propertyId - The Id of the Property__c record
     * @return PropertyDetailWrapper containing property details and related records
     */
    @AuraEnabled(cacheable=true)
    public static PropertyDetailWrapper getPropertyDetails(Id propertyId) {
        try {
            if (propertyId == null) {
                throw new AuraHandledException('Property Id is required');
            }

            // Query the property with all relevant fields including Location Site information
            Property__c property = [
                SELECT Id, Name, CurrencyIsoCode, Image_URL__c, Market_value__c, Address__c,
                       Property_Taxes__c, Have_a_fireplace__c, Listed_Date__c, Status__c,
                       Lot_size__c, Description__c, Built_Year__c, Square_footage__c,
                       Listing_price__c, Bathrooms__c, HOA_Fees__c, Property_Type__c,
                       Bedrooms__c, Garage_spaces__c, Have_a_pool__c, PrimaryAgent__c,
                       Location_Site__c, Price_Per_SqFt__c, Property_Age__c, Days_on_Market__c,
                       Total_Monthly_Fees__c, Luxury_Property__c, Location_City__c,
                       Location_Site__r.Id, Location_Site__r.Name, Location_Site__r.City__c,
                       Location_Site__r.State__c, Location_Site__r.Address__c,
                       Location_Site__r.County__c, Location_Site__r.ZIPPostal_code__c,
                       Location_Site__r.School_district__c, Location_Site__r.Safetycrime_rating__c,
                       Location_Site__r.Safety_Score__c, Location_Site__r.Walkability_score_1_100__c,
                       Location_Site__r.Public_transportation_available__c,
                       Location_Site__r.Average_home_price_in_area__c,
                       Location_Site__r.Nearby_hospitals__c, Location_Site__r.Nearby_shopping_centers__c,
                       Location_Site__r.Parks_and_recreation__c
                FROM Property__c
                WHERE Id = :propertyId
                LIMIT 1
            ];

            // Query related Property Images
            List<Property_Image__c> propertyImages = [
                SELECT Id, Name, Image_Url__c, Type__c
                FROM Property_Image__c
                WHERE Property__c = :propertyId
                ORDER BY CreatedDate ASC
            ];

            // Query related Property Amenities with Amenities details
            List<Property_Amenities__c> propertyAmenities = [
                SELECT Id, Name, Description__c, Active__c,
                       Amenities__c, Amenities__r.Name
                FROM Property_Amenities__c
                WHERE Property__c = :propertyId
                AND Active__c = true
                ORDER BY Amenities__r.Name ASC
            ];

            // Query related Property Features with Feature details
            List<Property_Feature__c> propertyFeatures = [
                SELECT Id, Name, Description__c, Active__c,
                       Feature__c, Feature__r.Name
                FROM Property_Feature__c
                WHERE Property__c = :propertyId
                AND Active__c = true
                ORDER BY Feature__r.Name ASC
            ];

            // Create and populate the wrapper
            PropertyDetailWrapper wrapper = new PropertyDetailWrapper();
            wrapper.property = property;
            wrapper.images = propertyImages;
            wrapper.amenities = propertyAmenities;
            wrapper.features = propertyFeatures;

            return wrapper;

        } catch (QueryException qe) {
            throw new AuraHandledException('Property not found: ' + qe.getMessage());
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching property details: ' + e.getMessage());
        }
    }

    /**
     * Wrapper class to hold property details and related records
     */
    public class PropertyDetailWrapper {
        @AuraEnabled public Property__c property { get; set; }
        @AuraEnabled public List<Property_Image__c> images { get; set; }
        @AuraEnabled public List<Property_Amenities__c> amenities { get; set; }
        @AuraEnabled public List<Property_Feature__c> features { get; set; }
    }
}