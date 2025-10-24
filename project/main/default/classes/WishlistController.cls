public without sharing class WishlistController {

    /**
     * Get or create wishlist for the current user
     * @return Map containing wishlist information or null if no wishlist exists
     */
    @AuraEnabled(cacheable=false)
    public static Map<String, Object> getUserWishlist() {
        try {
            Id userId = UserInfo.getUserId();

            // For authenticated users, find wishlist by User ID
            List<Wishlist__c> wishlists = [
                SELECT Id, Name, User__c, Wishlist_Name__c, Total_Items__c
                FROM Wishlist__c
                WHERE User__c = :userId
                ORDER BY CreatedDate DESC
                LIMIT 1
            ];

            if (!wishlists.isEmpty()) {
                Wishlist__c wishlist = wishlists[0];
                return new Map<String, Object>{
                    'exists' => true,
                    'wishlistId' => wishlist.Id,
                    'wishlistName' => wishlist.Wishlist_Name__c,
                    'totalItems' => wishlist.Total_Items__c != null ? wishlist.Total_Items__c : 0
                };
            } else {
                return new Map<String, Object>{
                    'exists' => false
                };
            }

        } catch (Exception e) {
            throw new AuraHandledException('Error getting wishlist: ' + e.getMessage());
        }
    }

    /**
     * Create a new wishlist for the user
     * @param wishlistName The name of the wishlist
     * @return Map containing the new wishlist information
     */
    @AuraEnabled
    public static Map<String, Object> createWishlist(String wishlistName) {
        try {
            if (String.isBlank(wishlistName)) {
                throw new AuraHandledException('Wishlist name cannot be empty');
            }

            Id userId = UserInfo.getUserId();

            Wishlist__c wishlist = new Wishlist__c(
                Wishlist_Name__c = wishlistName,
                User__c = userId,
                Total_Items__c = 0,
                Status__c = 'Active'
            );

            insert wishlist;

            return new Map<String, Object>{
                'success' => true,
                'wishlistId' => wishlist.Id,
                'wishlistName' => wishlist.Wishlist_Name__c,
                'message' => 'Wishlist created successfully'
            };

        } catch (Exception e) {
            throw new AuraHandledException('Error creating wishlist: ' + e.getMessage());
        }
    }

    /**
     * Add property to wishlist
     * @param propertyId The ID of the property to add
     * @param wishlistId The ID of the wishlist (optional, uses default if not provided)
     * @return Map containing success status and message
     */
    @AuraEnabled
    public static Map<String, Object> addToWishlist(String propertyId, String wishlistId) {
        try {
            // If no wishlistId provided, get the user's default wishlist
            if (String.isBlank(wishlistId)) {
                Map<String, Object> wishlistInfo = getUserWishlist();
                if ((Boolean)wishlistInfo.get('exists')) {
                    wishlistId = (String)wishlistInfo.get('wishlistId');
                } else {
                    return new Map<String, Object>{
                        'success' => false,
                        'requiresWishlistName' => true,
                        'message' => 'No wishlist found. Please create one first.'
                    };
                }
            }

            // Check if property already in wishlist
            List<Wishlist_Item__c> existingItems = [
                SELECT Id
                FROM Wishlist_Item__c
                WHERE Wishlist__c = :wishlistId
                AND Property__c = :propertyId
                LIMIT 1
            ];

            if (!existingItems.isEmpty()) {
                return new Map<String, Object>{
                    'success' => false,
                    'alreadyExists' => true,
                    'message' => 'Property is already in your wishlist'
                };
            }

            // Get property details
            Property__c property = [
                SELECT Id, Name, Listing_price__c, Image_URL__c, Status__c,
                       (SELECT Id, Image_Url__c
                        FROM Property_Images__r
                        ORDER BY CreatedDate ASC LIMIT 1)
                FROM Property__c
                WHERE Id = :propertyId
                LIMIT 1
            ];

            // Create wishlist item
            Wishlist_Item__c wishlistItem = new Wishlist_Item__c(
                Wishlist__c = wishlistId,
                Property__c = propertyId,
                Property_Name__c = property.Name,
                Property_Price__c = property.Listing_price__c,
                Property_Image_URL__c = (property.Property_Images__r != null && property.Property_Images__r.size() > 0)
                    ? property.Property_Images__r.get(0).Image_Url__c : '',
                Property_Status__c = property.Status__c,
                Added_Date__c = System.now()
            );

            insert wishlistItem;

            // Update wishlist total items count
            Wishlist__c wishlist = [
                SELECT Id, Total_Items__c
                FROM Wishlist__c
                WHERE Id = :wishlistId
                LIMIT 1
            ];

            Integer currentCount = wishlist.Total_Items__c != null ? Integer.valueOf(wishlist.Total_Items__c) : 0;
            wishlist.Total_Items__c = currentCount + 1;
            update wishlist;

            return new Map<String, Object>{
                'success' => true,
                'wishlistItemId' => wishlistItem.Id,
                'message' => 'Property added to wishlist successfully'
            };

        } catch (Exception e) {
            throw new AuraHandledException('Error adding to wishlist: ' + e.getMessage());
        }
    }

    /**
     * Remove property from wishlist
     * @param wishlistItemId The ID of the wishlist item to remove
     */
    @AuraEnabled
    public static Map<String, Object> removeFromWishlist(String wishlistItemId) {
        try {
            Wishlist_Item__c wishlistItem = [
                SELECT Id, Wishlist__c
                FROM Wishlist_Item__c
                WHERE Id = :wishlistItemId
                LIMIT 1
            ];

            String wishlistId = wishlistItem.Wishlist__c;
            delete wishlistItem;

            // Update wishlist total items count
            Wishlist__c wishlist = [
                SELECT Id, Total_Items__c
                FROM Wishlist__c
                WHERE Id = :wishlistId
                LIMIT 1
            ];

            Integer currentCount = wishlist.Total_Items__c != null ? Integer.valueOf(wishlist.Total_Items__c) : 0;
            wishlist.Total_Items__c = Math.max(0, currentCount - 1);
            update wishlist;

            return new Map<String, Object>{
                'success' => true,
                'message' => 'Property removed from wishlist successfully'
            };

        } catch (Exception e) {
            throw new AuraHandledException('Error removing from wishlist: ' + e.getMessage());
        }
    }

}