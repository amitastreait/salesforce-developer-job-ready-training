public without sharing class CartController {

    /**
     * Get cart summary for the current user (guest or authenticated)
     * Creates cart if it doesn't exist
     * @return Map containing itemCount, totalAmount, cartId, and cartUUID
     */
    @AuraEnabled(cacheable=false)
    public static Map<String, Object> getCartSummary() {
        try {
            Boolean isGuest = UserInfo.getUserType() == 'Guest';
            Cart__c cart = getOrCreateCart(isGuest);

            // Get cart items count and total
            List<Cart_Item__c> cartItems = [
                SELECT Id, Total_Price__c
                FROM Cart_Item__c
                WHERE Cart__c = :cart.Id
            ];

            Decimal totalAmount = 0;
            for (Cart_Item__c item : cartItems) {
                if (item.Total_Price__c != null) {
                    totalAmount += item.Total_Price__c;
                }
            }

            // Update cart totals
            cart.Total_Items__c = cartItems.size();
            cart.Total_Amount__c = totalAmount;
            cart.Last_Modified_Date_Time__c = System.now();
            update cart;

            return new Map<String, Object>{
                'itemCount' => cartItems.size(),
                'totalAmount' => totalAmount,
                'cartId' => cart.Id,
                'cartUUID' => cart.Cart_UUID__c,
                'cartNumber' => cart.Name,
                'isGuest' => isGuest
            };

        } catch (Exception e) {
            throw new AuraHandledException('Error getting cart summary: ' + e.getMessage());
        }
    }

    /**
     * Get or create cart based on user type
     * For guest users: Uses IP address to find/create cart
     * For authenticated users: Uses User ID to find/create cart
     * @param isGuest Boolean indicating if user is guest
     * @return Cart__c Active cart for the user
     */
    private static Cart__c getOrCreateCart(Boolean isGuest) {
        Cart__c cart;
        String ipAddress = getClientIpAddress();
        Id userId = UserInfo.getUserId();

        if (isGuest) {
            // For guest users, find cart by IP address (Session_Id__c)
            List<Cart__c> existingCarts = [
                SELECT Id, Name, Cart_UUID__c, Total_Items__c, Total_Amount__c,
                       Status__c, Session_Id__c, Last_Modified_Date_Time__c
                FROM Cart__c
                WHERE Session_Id__c = :ipAddress
                AND Status__c = 'Active'
                ORDER BY LastModifiedDate DESC
                LIMIT 1
            ];

            if (!existingCarts.isEmpty()) {
                cart = existingCarts[0];
            } else {
                // Create new guest cart
                cart = new Cart__c(
                    Session_Id__c = ipAddress,
                    Cart_UUID__c = generateUUID(),
                    Status__c = 'Active',
                    Total_Items__c = 0,
                    Total_Amount__c = 0,
                    Last_Modified_Date_Time__c = System.now()
                );
                insert cart;
            }
        } else {
            // For authenticated users, find cart by User ID
            List<Cart__c> existingCarts = [
                SELECT Id, Name, Cart_UUID__c, Total_Items__c, Total_Amount__c,
                       Status__c, User__c, Last_Modified_Date_Time__c
                FROM Cart__c
                WHERE User__c = :userId
                AND Status__c = 'Active'
                ORDER BY LastModifiedDate DESC
                LIMIT 1
            ];

            if (!existingCarts.isEmpty()) {
                cart = existingCarts[0];
            } else {
                // Create new authenticated user cart
                cart = new Cart__c(
                    User__c = userId,
                    Cart_UUID__c = generateUUID(),
                    Status__c = 'Active',
                    Total_Items__c = 0,
                    Total_Amount__c = 0,
                    Last_Modified_Date_Time__c = System.now()
                );
                insert cart;
            }
        }

        return cart;
    }

    /**
     * Get client IP address from request headers
     * @return String IP address or session-based identifier
     */
    private static String getClientIpAddress() {
        String ipAddress = '';

        try {
            // Try to get headers from ApexPages (works in Visualforce context)
            if (ApexPages.currentPage() != null) {
                Map<String, String> headers = ApexPages.currentPage().getHeaders();

                if (headers != null) {
                    // Check X-Forwarded-For header first (common in proxy setups)
                    if (headers.containsKey('X-Forwarded-For')) {
                        ipAddress = headers.get('X-Forwarded-For');
                        // X-Forwarded-For can contain multiple IPs, take the first one
                        if (ipAddress.contains(',')) {
                            ipAddress = ipAddress.split(',')[0].trim();
                        }
                    }
                    // Fallback to True-Client-IP
                    else if (headers.containsKey('True-Client-IP')) {
                        ipAddress = headers.get('True-Client-IP');
                    }
                    // Fallback to X-Real-IP
                    else if (headers.containsKey('X-Real-IP')) {
                        ipAddress = headers.get('X-Real-IP');
                    }
                    // Fallback to standard remote address
                    else if (headers.containsKey('X-Salesforce-SIP')) {
                        ipAddress = headers.get('X-Salesforce-SIP');
                    }
                }
            }
        } catch (Exception e) {
            System.debug('Error getting IP from headers: ' + e.getMessage());
        }

        // If no IP found from headers, use session-based identifier
        // This works for Experience Cloud / LWC where ApexPages is not available
        if (String.isBlank(ipAddress)) {
            String sessionId = UserInfo.getSessionId();
            if (String.isNotBlank(sessionId) && sessionId.length() >= 15) {
                ipAddress = 'SESSION_' + sessionId.substring(0, 15);
            } else {
                // Ultimate fallback: Use User ID or timestamp-based identifier
                ipAddress = 'GUEST_' + String.valueOf(System.now().getTime()).substring(0, 13);
            }
        }

        return ipAddress;
    }

    /**
     * Generate a UUID for cart identification
     * @return String UUID in standard format
     */
    private static String generateUUID() {
        return System.UUID.randomUUID().toString();
    }
    
    /**
     * Get all cart items with details
     * @return Map containing cart items and summary information
     */
    @AuraEnabled(cacheable=false)
    public static Map<String, Object> getCartItems() {
        try {
            Boolean isGuest = UserInfo.getUserType() == 'Guest';
            Cart__c cart = getOrCreateCart(isGuest);

            // Get all cart items with property details
            List<Cart_Item__c> cartItems = [
                SELECT Id, Name, Property__c, Property_Name__c, Property_Price__c,
                       Property_Image_URL__c, Property_Status__c, Quantity__c,
                       Subtotal__c, Discount_Amount__c, Discount_Percentage__c,
                       Total_Price__c, Added_Date__c,
                       Property__r.Name, Property__r.Listing_price__c,
                       Property__r.Image_URL__c, Property__r.Status__c,
                       Property__r.Address__c, Property__r.Location_Site__r.City__c,
                       Property__r.Location_Site__r.State__c
                FROM Cart_Item__c
                WHERE Cart__c = :cart.Id
                ORDER BY Added_Date__c DESC
            ];

            // Transform to simplified format for LWC
            List<Map<String, Object>> items = new List<Map<String, Object>>();
            Decimal subtotal = 0;

            for (Cart_Item__c item : cartItems) {
                Map<String, Object> itemMap = new Map<String, Object>{
                    'id' => item.Id,
                    'name' => item.Name,
                    'propertyId' => item.Property__c,
                    'propertyName' => item.Property_Name__c != null ? item.Property_Name__c : item.Property__r?.Name,
                    'propertyPrice' => item.Property_Price__c,
                    'propertyImage' => item.Property_Image_URL__c != null ? item.Property_Image_URL__c : item.Property__r?.Image_URL__c,
                    'propertyStatus' => item.Property_Status__c != null ? item.Property_Status__c : item.Property__r?.Status__c,
                    'quantity' => item.Quantity__c,
                    'subtotal' => item.Subtotal__c,
                    'discount' => item.Discount_Amount__c,
                    'discountPercent' => item.Discount_Percentage__c,
                    'total' => item.Total_Price__c,
                    'addedDate' => item.Added_Date__c,
                    'location' => (item.Property__r?.Location_Site__r?.City__c != null ?
                                  item.Property__r.Location_Site__r.City__c + ', ' +
                                  item.Property__r.Location_Site__r.State__c : '')
                };
                items.add(itemMap);

                if (item.Total_Price__c != null) {
                    subtotal += item.Total_Price__c;
                }
            }

            return new Map<String, Object>{
                'items' => items,
                'itemCount' => cartItems.size(),
                'subtotal' => subtotal,
                'tax' => 0, // Calculate tax based on your business logic
                'shipping' => 0, // Calculate shipping based on your business logic
                'total' => subtotal,
                'cartId' => cart.Id,
                'cartUUID' => cart.Cart_UUID__c,
                'cartNumber' => cart.Name
            };

        } catch (Exception e) {
            throw new AuraHandledException('Error getting cart items: ' + e.getMessage());
        }
    }
    
    /**
     * Update cart item quantity
     * @param cartItemId The ID of the cart item to update
     * @param quantity The new quantity
     */
    @AuraEnabled
    public static void updateCartItemQuantity(String cartItemId, Integer quantity) {
        try {
            if (quantity <= 0) {
                throw new AuraHandledException('Quantity must be greater than 0');
            }

            Cart_Item__c cartItem = [
                SELECT Id, Property_Price__c, Discount_Percentage__c
                FROM Cart_Item__c
                WHERE Id = :cartItemId
                LIMIT 1
            ];

            // Update quantity and recalculate totals
            cartItem.Quantity__c = quantity;
            cartItem.Subtotal__c = cartItem.Property_Price__c * quantity;

            // Calculate discount
            if (cartItem.Discount_Percentage__c != null && cartItem.Discount_Percentage__c > 0) {
                cartItem.Discount_Amount__c = (cartItem.Subtotal__c * cartItem.Discount_Percentage__c) / 100;
            } else {
                cartItem.Discount_Amount__c = 0;
            }

            cartItem.Total_Price__c = cartItem.Subtotal__c - cartItem.Discount_Amount__c;

            update cartItem;

            // Publish platform event for cart change
            publishCartChangeEvent();

        } catch (Exception e) {
            throw new AuraHandledException('Error updating cart item: ' + e.getMessage());
        }
    }

    /**
     * Remove item from cart
     * @param cartItemId The ID of the cart item to remove
     */
    @AuraEnabled
    public static void removeCartItem(String cartItemId) {
        try {
            Cart_Item__c cartItem = [
                SELECT Id
                FROM Cart_Item__c
                WHERE Id = :cartItemId
                LIMIT 1
            ];

            delete cartItem;

            // Publish platform event for cart change
            publishCartChangeEvent();

        } catch (Exception e) {
            throw new AuraHandledException('Error removing cart item: ' + e.getMessage());
        }
    }

    /**
     * Clear all items from cart
     */
    @AuraEnabled
    public static void clearCart() {
        try {
            Boolean isGuest = UserInfo.getUserType() == 'Guest';
            Cart__c cart = getOrCreateCart(isGuest);

            List<Cart_Item__c> cartItems = [
                SELECT Id
                FROM Cart_Item__c
                WHERE Cart__c = :cart.Id
            ];

            if (!cartItems.isEmpty()) {
                delete cartItems;
            }

            // Update cart totals
            cart.Total_Items__c = 0;
            cart.Total_Amount__c = 0;
            cart.Last_Modified_Date_Time__c = System.now();
            update cart;

            // Publish platform event for cart change
            publishCartChangeEvent();

        } catch (Exception e) {
            throw new AuraHandledException('Error clearing cart: ' + e.getMessage());
        }
    }

    /**
     * Add property to cart
     * @param propertyId The ID of the property to add
     * @param quantity Quantity to add (default 1)
     * @return Map containing success status and cart item ID
     */
    @AuraEnabled
    public static Map<String, Object> addToCart(String propertyId, Integer quantity) {
        try {
            if (quantity == null || quantity <= 0) {
                quantity = 1;
            }

            Boolean isGuest = UserInfo.getUserType() == 'Guest';
            Cart__c cart = getOrCreateCart(isGuest);

            // Get property details
            Property__c property = [
                SELECT Id, Name, Listing_price__c, Image_URL__c, Status__c,
                       Address__c, Location_Site__r.City__c, Location_Site__r.State__c
                FROM Property__c
                WHERE Id = :propertyId
                LIMIT 1
            ];

            // Check if property already in cart
            List<Cart_Item__c> existingItems = [
                SELECT Id, Quantity__c
                FROM Cart_Item__c
                WHERE Cart__c = :cart.Id
                AND Property__c = :propertyId
                LIMIT 1
            ];

            Cart_Item__c cartItem;
            if (!existingItems.isEmpty()) {
                // Update existing item quantity
                cartItem = existingItems[0];
                cartItem.Quantity__c += quantity;
            } else {
                // Create new cart item
                cartItem = new Cart_Item__c(
                    Cart__c = cart.Id,
                    Property__c = propertyId,
                    Property_Name__c = property.Name,
                    Property_Price__c = property.Listing_price__c,
                    Property_Image_URL__c = property.Image_URL__c,
                    Property_Status__c = property.Status__c,
                    Quantity__c = quantity,
                    Added_Date__c = System.now()
                );
            }

            // Calculate totals
            cartItem.Subtotal__c = property.Listing_price__c * cartItem.Quantity__c;
            cartItem.Discount_Amount__c = 0;
            cartItem.Discount_Percentage__c = 0;
            cartItem.Total_Price__c = cartItem.Subtotal__c;

            upsert cartItem;

            // Publish platform event for cart change
            publishCartChangeEvent();

            return new Map<String, Object>{
                'success' => true,
                'cartItemId' => cartItem.Id,
                'message' => 'Property added to cart successfully'
            };

        } catch (Exception e) {
            throw new AuraHandledException('Error adding to cart: ' + e.getMessage());
        }
    }
    
    /**
     * Publish platform event when cart changes
     */
    private static void publishCartChangeEvent() {
        // Platform event publishing for real-time cart updates
        // Note: You need to create Cart_Changed__e platform event with fields:
        // - User_Id__c (Text)
        // - Change_Time__c (DateTime)
        // Then uncomment the code below

        /*
        try {
            Cart_Changed__e cartEvent = new Cart_Changed__e(
                User_Id__c = UserInfo.getUserId(),
                Change_Time__c = System.now()
            );
            EventBus.publish(cartEvent);
        } catch (Exception e) {
            // Silently fail if platform event doesn't exist
            System.debug('Platform event not published: ' + e.getMessage());
        }
        */
    }
}