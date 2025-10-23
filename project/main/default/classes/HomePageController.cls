public without sharing class HomePageController {

    /**
     * Wrapper class to hold property with its images
     */
    public class PropertyWrapper {
        @AuraEnabled public Property__c property;
        @AuraEnabled public List<Property_Image__c> images;

        public PropertyWrapper(Property__c prop, List<Property_Image__c> imgs) {
            this.property = prop;
            this.images = imgs;
        }
    }

    /**
     * Get featured properties for the home page
     * @param recordLimit Number of properties to return
     * @return List of PropertyWrapper with properties and their images
     */
    @AuraEnabled(cacheable=true)
    public static List<PropertyWrapper> getFeaturedProperties(Integer recordLimit) {
        try {
            if (recordLimit == null || recordLimit <= 0) {
                recordLimit = 8;
            }

            // Query featured properties with all relevant fields
            List<Property__c> properties = [
                SELECT Id,
                       Name,
                       Description__c,
                       Address__c,
                       Property_Type__c,
                       Bedrooms__c,
                       Bathrooms__c,
                       Square_footage__c,
                       Listing_price__c,
                       Status__c,
                       Image_URL__c,
                       Location_City__c,
                       Price_Per_SqFt__c,
                       Days_on_Market__c,
                       Listed_Date__c,
                       Have_a_pool__c,
                       Have_a_fireplace__c,
                       Garage_spaces__c,
                       (SELECT Id, Name, Image_Url__c, Type__c
                        FROM Property_Images__r
                        ORDER BY CreatedDate ASC)
                FROM Property__c
                WHERE Status__c = 'Available'
                ORDER BY CreatedDate DESC
                LIMIT :recordLimit
            ];

            return wrapPropertiesWithImages(properties);

        } catch (Exception e) {
            throw new AuraHandledException('Error fetching featured properties: ' + e.getMessage());
        }
    }

    /**
     * Helper method to wrap properties with their images
     * @param properties List of properties
     * @return List of PropertyWrapper objects
     */
    private static List<PropertyWrapper> wrapPropertiesWithImages(List<Property__c> properties) {
        List<PropertyWrapper> wrappers = new List<PropertyWrapper>();

        for (Property__c prop : properties) {
            List<Property_Image__c> images = prop.Property_Images__r != null ?
                prop.Property_Images__r : new List<Property_Image__c>();
            wrappers.add(new PropertyWrapper(prop, images));
        }

        return wrappers;
    }
    
    /**
     * Get product categories for the home page
     * @param recordLimit Number of categories to return
     * @return List of Product Category records
     */
    @AuraEnabled(cacheable=true)
    public static List<Object> getCategories(Integer recordLimit) {
        try {
            if (recordLimit == null || recordLimit <= 0) {
                recordLimit = 6;
            }
            
            return null;
            
        } catch (Exception e) {
            // If ProductCategory doesn't exist or has issues, return empty list
            System.debug('Error fetching categories: ' + e.getMessage());
            return null;
        }
    }
    
    /**
     * Get promotional banner information
     * @return List of active promotional banners
     */
    @AuraEnabled(cacheable=true)
    public static List<Object> getPromotionalBanner() {
        try {
            // Query active promotional banners
            // Assuming you have a custom object Promotional_Banner__c
            /* List<Promotional_Banner__c> banners = [
                SELECT Id,
                       Title__c,
                       Subtitle__c,
                       Image_URL__c,
                       CTA_Text__c,
                       CTA_URL__c,
                       Is_Active__c,
                       Start_Date__c,
                       End_Date__c,
                       Priority__c
                FROM Promotional_Banner__c
                WHERE Is_Active__c = true
                  AND Start_Date__c <= TODAY
                  AND (End_Date__c >= TODAY OR End_Date__c = null)
                ORDER BY Priority__c ASC NULLS LAST
                LIMIT 1
            ]; */
            
            return null;
            
        } catch (Exception e) {
            // If custom object doesn't exist, return empty list
            System.debug('Error fetching promotional banner: ' + e.getMessage());
            return null;
        }
    }
    
    /**
     * Search properties by keyword
     * @param searchTerm The search keyword
     * @param recordLimit Number of results to return
     * @return List of matching properties with images
     */
    @AuraEnabled(cacheable=false)
    public static List<PropertyWrapper> searchProperties(String searchTerm, Integer recordLimit) {
        try {
            if (String.isBlank(searchTerm)) {
                return new List<PropertyWrapper>();
            }

            if (recordLimit == null || recordLimit <= 0) {
                recordLimit = 20;
            }

            String searchPattern = '%' + String.escapeSingleQuotes(searchTerm) + '%';

            List<Property__c> properties = [
                SELECT Id,
                       Name,
                       Description__c,
                       Address__c,
                       Property_Type__c,
                       Bedrooms__c,
                       Bathrooms__c,
                       Square_footage__c,
                       Listing_price__c,
                       Status__c,
                       Image_URL__c,
                       Location_City__c,
                       Price_Per_SqFt__c,
                       Days_on_Market__c,
                       Listed_Date__c,
                       Have_a_pool__c,
                       Have_a_fireplace__c,
                       Garage_spaces__c,
                       (SELECT Id, Name, Image_Url__c, Type__c
                        FROM Property_Images__r
                        ORDER BY CreatedDate ASC)
                FROM Property__c
                WHERE Status__c = 'Available'
                  AND (Name LIKE :searchPattern
                       OR Location_City__c LIKE :searchPattern)
                ORDER BY Name ASC
                LIMIT :recordLimit
            ];

            return wrapPropertiesWithImages(properties);

        } catch (Exception e) {
            throw new AuraHandledException('Error searching properties: ' + e.getMessage());
        }
    }
    
    /**
     * Get most popular properties (by lowest days on market)
     * @param recordLimit Number of properties to return
     * @return List of popular properties with images
     */
    @AuraEnabled(cacheable=true)
    public static List<PropertyWrapper> getPopularProperties(Integer recordLimit) {
        try {
            if (recordLimit == null || recordLimit <= 0) {
                recordLimit = 8;
            }

            // Query properties ordered by days on market (lowest first)
            // This represents properties that are selling faster (more popular)
            List<Property__c> properties = [
                SELECT Id,
                       Name,
                       Description__c,
                       Address__c,
                       Property_Type__c,
                       Bedrooms__c,
                       Bathrooms__c,
                       Square_footage__c,
                       Listing_price__c,
                       Status__c,
                       Image_URL__c,
                       Location_City__c,
                       Price_Per_SqFt__c,
                       Days_on_Market__c,
                       Listed_Date__c,
                       Have_a_pool__c,
                       Have_a_fireplace__c,
                       Garage_spaces__c,
                       (SELECT Id, Name, Image_Url__c, Type__c
                        FROM Property_Images__r
                        ORDER BY CreatedDate ASC)
                FROM Property__c
                WHERE Status__c = 'Available'
                  AND Listed_Date__c != null
                ORDER BY Days_on_Market__c ASC NULLS LAST
                LIMIT :recordLimit
            ];

            return wrapPropertiesWithImages(properties);

        } catch (Exception e) {
            System.debug('Error fetching popular properties: ' + e.getMessage());
            return new List<PropertyWrapper>();
        }
    }
    
    /**
     * Get newly listed properties
     * @param recordLimit Number of properties to return
     * @return List of newly listed properties with images
     */
    @AuraEnabled(cacheable=true)
    public static List<PropertyWrapper> getNewListings(Integer recordLimit) {
        try {
            if (recordLimit == null || recordLimit <= 0) {
                recordLimit = 8;
            }

            // Get properties listed in the last 30 days
            Date thirtyDaysAgo = Date.today().addDays(-30);

            List<Property__c> properties = [
                SELECT Id,
                       Name,
                       Description__c,
                       Address__c,
                       Property_Type__c,
                       Bedrooms__c,
                       Bathrooms__c,
                       Square_footage__c,
                       Listing_price__c,
                       Status__c,
                       Image_URL__c,
                       Location_City__c,
                       Price_Per_SqFt__c,
                       Days_on_Market__c,
                       Listed_Date__c,
                       Have_a_pool__c,
                       Have_a_fireplace__c,
                       Garage_spaces__c,
                       (SELECT Id, Name, Image_Url__c, Type__c
                        FROM Property_Images__r
                        ORDER BY CreatedDate ASC)
                FROM Property__c
                WHERE Status__c = 'Available'
                  AND Listed_Date__c >= :thirtyDaysAgo
                ORDER BY Listed_Date__c DESC
                LIMIT :recordLimit
            ];

            return wrapPropertiesWithImages(properties);

        } catch (Exception e) {
            System.debug('Error fetching new listings: ' + e.getMessage());
            return new List<PropertyWrapper>();
        }
    }
    
    /**
     * Get luxury properties
     * @param recordLimit Number of properties to return
     * @return List of luxury properties with images
     */
    @AuraEnabled(cacheable=true)
    public static List<PropertyWrapper> getLuxuryProperties(Integer recordLimit) {
        try {
            if (recordLimit == null || recordLimit <= 0) {
                recordLimit = 8;
            }

            // Get luxury properties (using the Luxury_Property__c formula field)
            List<Property__c> properties = [
                SELECT Id,
                       Name,
                       Description__c,
                       Address__c,
                       Property_Type__c,
                       Bedrooms__c,
                       Bathrooms__c,
                       Square_footage__c,
                       Listing_price__c,
                       Status__c,
                       Image_URL__c,
                       Location_City__c,
                       Price_Per_SqFt__c,
                       Days_on_Market__c,
                       Listed_Date__c,
                       Have_a_pool__c,
                       Have_a_fireplace__c,
                       Garage_spaces__c,
                       Luxury_Property__c,
                       (SELECT Id, Name, Image_Url__c, Type__c
                        FROM Property_Images__r
                        ORDER BY CreatedDate ASC)
                FROM Property__c
                WHERE Status__c = 'Available'
                  AND Luxury_Property__c = true
                ORDER BY Listing_price__c DESC
                LIMIT :recordLimit
            ];

            return wrapPropertiesWithImages(properties);

        } catch (Exception e) {
            System.debug('Error fetching luxury properties: ' + e.getMessage());
            return new List<PropertyWrapper>();
        }
    }
    
    /**
     * Subscribe to newsletter
     * @param email The email address to subscribe
     * @return Success message
     */
    @AuraEnabled
    public static String subscribeToNewsletter(String email) {
        try {
            if (String.isBlank(email)) {
                throw new AuraHandledException('Email address is required');
            }

            // Validate email format
            if (!isValidEmail(email)) {
                throw new AuraHandledException('Invalid email format');
            }

            // Check for existing subscription
            List<Newsletter_Subscription__c> existingSubscriptions = [
                SELECT Id, Status__c, Email__c, Is_Confirmed__c
                FROM Newsletter_Subscription__c
                WHERE Email__c = :email
                LIMIT 1
            ];

            if (existingSubscriptions.isEmpty()) {
                // Create new subscription
                Newsletter_Subscription__c subscription = new Newsletter_Subscription__c();
                subscription.Email__c = email;
                subscription.Status__c = 'Active';
                subscription.Subscription_Date__c = System.now();
                subscription.Source__c = 'Website';
                subscription.Is_Confirmed__c = false;

                // Generate confirmation token
                subscription.Confirmation_Token__c = generateConfirmationToken();

                // Set default preferences
                subscription.Preferences__c = 'New Properties;Price Drops;Market Updates';

                insert subscription;

                return 'Successfully subscribed! Please check your email for confirmation.';
            } else {
                // Handle existing subscription
                Newsletter_Subscription__c subscription = existingSubscriptions[0];

                if (subscription.Status__c == 'Active') {
                    return 'This email is already subscribed to our newsletter.';
                } else {
                    // Reactivate subscription
                    subscription.Status__c = 'Active';
                    subscription.Subscription_Date__c = System.now();
                    subscription.Unsubscribe_Date__c = null;
                    subscription.Is_Confirmed__c = false;
                    subscription.Confirmation_Token__c = generateConfirmationToken();

                    update subscription;

                    return 'Welcome back! Your subscription has been reactivated.';
                }
            }

        } catch (DmlException e) {
            throw new AuraHandledException('Error saving subscription: ' + e.getDmlMessage(0));
        } catch (Exception e) {
            throw new AuraHandledException('Error subscribing to newsletter: ' + e.getMessage());
        }
    }

    /**
     * Generate a unique confirmation token for email verification
     * @return Random confirmation token
     */
    private static String generateConfirmationToken() {
        Blob randomBlob = Crypto.generateAesKey(128);
        String token = EncodingUtil.convertToHex(randomBlob);
        return token.substring(0, 32); // Return first 32 characters
    }
    
    /**
     * Validate email format
     * @param email The email address to validate
     * @return true if valid, false otherwise
     */
    private static Boolean isValidEmail(String email) {
        String emailRegex = '^[a-zA-Z0-9._|\\\\%#~`=?&/$^*!}{+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$';
        Pattern pattern = Pattern.compile(emailRegex);
        Matcher matcher = pattern.matcher(email);
        return matcher.matches();
    }
}