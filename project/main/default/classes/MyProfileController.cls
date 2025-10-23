public without sharing class MyProfileController {

    /**
     * Get complete user profile information
     */
    @AuraEnabled(cacheable=true)
    public static ProfileDataWrapper getProfileData() {
        try {
            ProfileDataWrapper wrapper = new ProfileDataWrapper();

            // Get current user
            User currentUser = [
                SELECT Id, Name, Email, Phone, MobilePhone, Title, Department,
                       Street, City, State, PostalCode, Country,
                       CompanyName, AboutMe, SmallPhotoUrl, FullPhotoUrl
                FROM User
                WHERE Id = :UserInfo.getUserId()
                LIMIT 1
            ];

            wrapper.personalInfo = new PersonalInfo();
            wrapper.personalInfo.name = currentUser.Name;
            wrapper.personalInfo.email = currentUser.Email;
            wrapper.personalInfo.phone = currentUser.Phone;
            wrapper.personalInfo.mobile = currentUser.MobilePhone;
            wrapper.personalInfo.title = currentUser.Title;
            wrapper.personalInfo.department = currentUser.Department;
            wrapper.personalInfo.company = currentUser.CompanyName;
            wrapper.personalInfo.aboutMe = currentUser.AboutMe;
            wrapper.personalInfo.photoUrl = currentUser.FullPhotoUrl;

            // Address Information
            wrapper.address = new AddressInfo();
            wrapper.address.street = currentUser.Street;
            wrapper.address.city = currentUser.City;
            wrapper.address.state = currentUser.State;
            wrapper.address.postalCode = currentUser.PostalCode;
            wrapper.address.country = currentUser.Country;

            // Get associated Contact if exists
            List<Contact> contacts = [
                SELECT Id, AccountId, Account.Name, Birthdate, MailingStreet,
                       MailingCity, MailingState, MailingPostalCode, MailingCountry
                FROM Contact
                WHERE Email = :currentUser.Email
                LIMIT 1
            ];

            if (!contacts.isEmpty()) {
                Contact userContact = contacts[0];
                wrapper.contactId = userContact.Id;
                wrapper.accountId = userContact.AccountId;
                wrapper.accountName = userContact.Account?.Name;
                wrapper.personalInfo.birthdate = userContact.Birthdate;

                // Override address with contact mailing address if available
                if (String.isNotBlank(userContact.MailingStreet)) {
                    wrapper.address.street = userContact.MailingStreet;
                    wrapper.address.city = userContact.MailingCity;
                    wrapper.address.state = userContact.MailingState;
                    wrapper.address.postalCode = userContact.MailingPostalCode;
                    wrapper.address.country = userContact.MailingCountry;
                }
            }

            return wrapper;

        } catch (Exception e) {
            throw new AuraHandledException('Error fetching profile data: ' + e.getMessage());
        }
    }

    /**
     * Get user's recent orders (if Order object exists)
     */
    @AuraEnabled(cacheable=true)
    public static List<OrderWrapper> getRecentOrders() {
        try {
            List<OrderWrapper> orderList = new List<OrderWrapper>();

            // Get Contact Id for current user
            User currentUser = [SELECT Id, ContactId FROM User WHERE Id = :UserInfo.getUserId() LIMIT 1];

            if (currentUser.ContactId == null) {
                return orderList;
            }

            // Query Orders - adjust fields based on your Order object structure
            List<Order> orders = [
                SELECT Id, OrderNumber, Status, TotalAmount,
                       EffectiveDate, CreatedDate, Type,
                       Account.Name, PoNumber
                FROM Order
                WHERE CustomerAuthorizedById = :currentUser.ContactId
                   OR BillToContactId = :currentUser.ContactId
                ORDER BY CreatedDate DESC
                LIMIT 10
            ];

            for (Order ord : orders) {
                OrderWrapper ow = new OrderWrapper();
                ow.id = ord.Id;
                ow.orderNumber = ord.OrderNumber;
                ow.status = ord.Status;
                ow.totalAmount = ord.TotalAmount;
                ow.orderDate = ord.EffectiveDate != null ? ord.EffectiveDate : ord.CreatedDate;
                ow.type = ord.Type;
                ow.accountName = ord.Account?.Name;
                ow.poNumber = ord.PoNumber;
                orderList.add(ow);
            }

            return orderList;

        } catch (Exception e) {
            // Return empty list if Order object doesn't exist or query fails
            return new List<OrderWrapper>();
        }
    }

    /**
     * Get user's cart information from Cart__c custom object
     */
    @AuraEnabled(cacheable=false)
    public static CartDataWrapper getCartData() {
        try {
            CartDataWrapper cartWrapper = new CartDataWrapper();
            Boolean isGuest = UserInfo.getUserType() == 'Guest';
            Id userId = UserInfo.getUserId();

            // Find active cart for the current user
            List<Cart__c> carts = [
                SELECT Id, Name, Cart_UUID__c, Total_Items__c, Total_Amount__c,
                       Status__c, Last_Modified_Date_Time__c, CreatedDate
                FROM Cart__c
                WHERE User__c = :userId
                AND Status__c = 'Active'
                ORDER BY LastModifiedDate DESC
                LIMIT 1
            ];

            if (carts.isEmpty()) {
                // No active cart found
                cartWrapper.hasCart = false;
                cartWrapper.cartItems = new List<CartItemWrapper>();
                cartWrapper.totalItems = 0;
                cartWrapper.totalAmount = 0;
                return cartWrapper;
            }

            Cart__c cart = carts[0];
            cartWrapper.cartId = cart.Id;
            cartWrapper.cartNumber = cart.Name;
            cartWrapper.cartUUID = cart.Cart_UUID__c;
            cartWrapper.totalItems = Integer.valueOf(cart.Total_Items__c != null ? cart.Total_Items__c : 0);
            cartWrapper.totalAmount = cart.Total_Amount__c != null ? cart.Total_Amount__c : 0;
            cartWrapper.hasCart = true;

            // Get cart items
            List<Cart_Item__c> items = [
                SELECT Id, Name, Property__c, Property_Name__c, Property_Price__c,
                       Property_Image_URL__c, Property_Status__c, Quantity__c,
                       Subtotal__c, Discount_Amount__c, Total_Price__c, Added_Date__c,
                       Property__r.Name, Property__r.Listing_price__c,
                       Property__r.Image_URL__c, Property__r.Status__c,
                       Property__r.Address__c, Property__r.Location_Site__r.City__c,
                       Property__r.Location_Site__r.State__c
                FROM Cart_Item__c
                WHERE Cart__c = :cart.Id
                ORDER BY Added_Date__c DESC
            ];

            List<CartItemWrapper> cartItems = new List<CartItemWrapper>();
            for (Cart_Item__c item : items) {
                CartItemWrapper ciw = new CartItemWrapper();
                ciw.id = item.Id;
                ciw.name = item.Name;
                ciw.propertyId = item.Property__c;
                ciw.propertyName = item.Property_Name__c != null ? item.Property_Name__c : item.Property__r?.Name;
                ciw.propertyPrice = item.Property_Price__c;
                ciw.propertyImage = item.Property_Image_URL__c != null ? item.Property_Image_URL__c : item.Property__r?.Image_URL__c;
                ciw.propertyStatus = item.Property_Status__c != null ? item.Property_Status__c : item.Property__r?.Status__c;
                ciw.quantity = Integer.valueOf(item.Quantity__c != null ? item.Quantity__c : 1);
                ciw.subtotal = item.Subtotal__c;
                ciw.discount = item.Discount_Amount__c;
                ciw.total = item.Total_Price__c;
                ciw.addedDate = item.Added_Date__c;

                String location = '';
                if (item.Property__r?.Location_Site__r?.City__c != null) {
                    location = item.Property__r.Location_Site__r.City__c;
                    if (item.Property__r.Location_Site__r.State__c != null) {
                        location += ', ' + item.Property__r.Location_Site__r.State__c;
                    }
                }
                ciw.location = location;

                cartItems.add(ciw);
            }

            cartWrapper.cartItems = cartItems;

            return cartWrapper;

        } catch (Exception e) {
            throw new AuraHandledException('Error fetching cart data: ' + e.getMessage());
        }
    }

    /**
     * Remove item from cart
     */
    @AuraEnabled
    public static String removeFromCart(String cartItemId) {
        try {
            Cart_Item__c cartItem = [
                SELECT Id, Cart__c
                FROM Cart_Item__c
                WHERE Id = :cartItemId
                LIMIT 1
            ];

            delete cartItem;

            // Update cart totals
            updateCartTotals(cartItem.Cart__c);

            return 'Success';

        } catch (Exception e) {
            throw new AuraHandledException('Error removing item from cart: ' + e.getMessage());
        }
    }

    /**
     * Update cart item quantity
     */
    @AuraEnabled
    public static String updateCartQuantity(String cartItemId, Integer quantity) {
        try {
            if (quantity <= 0) {
                throw new AuraHandledException('Quantity must be greater than 0');
            }

            Cart_Item__c cartItem = [
                SELECT Id, Property_Price__c, Discount_Percentage__c, Cart__c
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

            // Update cart totals
            updateCartTotals(cartItem.Cart__c);

            return 'Success';

        } catch (Exception e) {
            throw new AuraHandledException('Error updating cart quantity: ' + e.getMessage());
        }
    }

    /**
     * Helper method to update cart totals
     */
    private static void updateCartTotals(Id cartId) {
        List<Cart_Item__c> cartItems = [
            SELECT Id, Total_Price__c
            FROM Cart_Item__c
            WHERE Cart__c = :cartId
        ];

        Decimal totalAmount = 0;
        for (Cart_Item__c item : cartItems) {
            if (item.Total_Price__c != null) {
                totalAmount += item.Total_Price__c;
            }
        }

        Cart__c cart = new Cart__c(
            Id = cartId,
            Total_Items__c = cartItems.size(),
            Total_Amount__c = totalAmount,
            Last_Modified_Date_Time__c = System.now()
        );
        update cart;
    }

    /**
     * Get user's wishlist information from Wishlist__c custom object
     */
    @AuraEnabled(cacheable=false)
    public static WishlistDataWrapper getWishlistData() {
        try {
            WishlistDataWrapper wishlistWrapper = new WishlistDataWrapper();
            Id userId = UserInfo.getUserId();

            // Find active wishlist for the current user
            List<Wishlist__c> wishlists = [
                SELECT Id, Name, Wishlist_Name__c, Total_Items__c,
                       Status__c, Description__c, CreatedDate
                FROM Wishlist__c
                WHERE User__c = :userId
                AND Status__c = 'Active'
                ORDER BY CreatedDate DESC
                LIMIT 1
            ];

            if (wishlists.isEmpty()) {
                // No active wishlist found
                wishlistWrapper.hasWishlist = false;
                wishlistWrapper.wishlistItems = new List<WishlistItemWrapper>();
                wishlistWrapper.totalItems = 0;
                return wishlistWrapper;
            }

            Wishlist__c wishlist = wishlists[0];
            wishlistWrapper.wishlistId = wishlist.Id;
            wishlistWrapper.wishlistNumber = wishlist.Name;
            wishlistWrapper.wishlistName = wishlist.Wishlist_Name__c;
            wishlistWrapper.totalItems = Integer.valueOf(wishlist.Total_Items__c != null ? wishlist.Total_Items__c : 0);
            wishlistWrapper.description = wishlist.Description__c;
            wishlistWrapper.hasWishlist = true;

            // Get wishlist items
            List<Wishlist_Item__c> items = [
                SELECT Id, Name, Property__c, Property_Name__c, Property_Price__c,
                       Property_Image_URL__c, Property_Status__c, Added_Date__c, Notes__c,
                       Property__r.Name, Property__r.Listing_price__c,
                       Property__r.Image_URL__c, Property__r.Status__c,
                       Property__r.Address__c, Property__r.Location_Site__r.City__c,
                       Property__r.Location_Site__r.State__c, Property__r.Property_Type__c,
                       Property__r.Bedrooms__c, Property__r.Bathrooms__c
                FROM Wishlist_Item__c
                WHERE Wishlist__c = :wishlist.Id
                ORDER BY Added_Date__c DESC
            ];

            List<WishlistItemWrapper> wishlistItems = new List<WishlistItemWrapper>();
            for (Wishlist_Item__c item : items) {
                WishlistItemWrapper wiw = new WishlistItemWrapper();
                wiw.id = item.Id;
                wiw.name = item.Name;
                wiw.propertyId = item.Property__c;
                wiw.propertyName = item.Property_Name__c != null ? item.Property_Name__c : item.Property__r?.Name;
                wiw.propertyPrice = item.Property_Price__c != null ? item.Property_Price__c : item.Property__r?.Listing_price__c;
                wiw.propertyImage = item.Property_Image_URL__c != null ? item.Property_Image_URL__c : item.Property__r?.Image_URL__c;
                wiw.propertyStatus = item.Property_Status__c != null ? item.Property_Status__c : item.Property__r?.Status__c;
                wiw.propertyType = item.Property__r?.Property_Type__c;
                wiw.bedrooms = item.Property__r?.Bedrooms__c;
                wiw.bathrooms = item.Property__r?.Bathrooms__c;
                wiw.addedDate = item.Added_Date__c;
                wiw.notes = item.Notes__c;

                String location = '';
                if (item.Property__r?.Location_Site__r?.City__c != null) {
                    location = item.Property__r.Location_Site__r.City__c;
                    if (item.Property__r.Location_Site__r.State__c != null) {
                        location += ', ' + item.Property__r.Location_Site__r.State__c;
                    }
                }
                wiw.location = location;

                wishlistItems.add(wiw);
            }

            wishlistWrapper.wishlistItems = wishlistItems;

            return wishlistWrapper;

        } catch (Exception e) {
            throw new AuraHandledException('Error fetching wishlist data: ' + e.getMessage());
        }
    }

    /**
     * Add property to wishlist
     */
    @AuraEnabled
    public static String addToWishlist(String propertyId, String notes) {
        try {
            Id userId = UserInfo.getUserId();

            // Get or create active wishlist
            List<Wishlist__c> wishlists = [
                SELECT Id, Total_Items__c
                FROM Wishlist__c
                WHERE User__c = :userId
                AND Status__c = 'Active'
                ORDER BY CreatedDate DESC
                LIMIT 1
            ];

            Wishlist__c wishlist;
            if (wishlists.isEmpty()) {
                // Create new wishlist
                wishlist = new Wishlist__c(
                    User__c = userId,
                    Wishlist_Name__c = 'My Wishlist',
                    Status__c = 'Active',
                    Total_Items__c = 0
                );
                insert wishlist;
            } else {
                wishlist = wishlists[0];
            }

            // Check if property already in wishlist
            List<Wishlist_Item__c> existingItems = [
                SELECT Id
                FROM Wishlist_Item__c
                WHERE Wishlist__c = :wishlist.Id
                AND Property__c = :propertyId
                LIMIT 1
            ];

            if (!existingItems.isEmpty()) {
                return 'Property already in wishlist';
            }

            // Get property details
            Property__c property = [
                SELECT Id, Name, Listing_price__c, Image_URL__c, Status__c
                FROM Property__c
                WHERE Id = :propertyId
                LIMIT 1
            ];

            // Create wishlist item
            Wishlist_Item__c wishlistItem = new Wishlist_Item__c(
                Wishlist__c = wishlist.Id,
                Property__c = propertyId,
                Property_Name__c = property.Name,
                Property_Price__c = property.Listing_price__c,
                Property_Image_URL__c = property.Image_URL__c,
                Property_Status__c = property.Status__c,
                Added_Date__c = System.now(),
                Notes__c = notes
            );
            insert wishlistItem;

            // Update wishlist total items
            updateWishlistTotals(wishlist.Id);

            return 'Success';

        } catch (Exception e) {
            throw new AuraHandledException('Error adding to wishlist: ' + e.getMessage());
        }
    }

    /**
     * Remove item from wishlist
     */
    @AuraEnabled
    public static String removeFromWishlist(String wishlistItemId) {
        try {
            Wishlist_Item__c wishlistItem = [
                SELECT Id, Wishlist__c
                FROM Wishlist_Item__c
                WHERE Id = :wishlistItemId
                LIMIT 1
            ];

            Id wishlistId = wishlistItem.Wishlist__c;
            delete wishlistItem;

            // Update wishlist totals
            updateWishlistTotals(wishlistId);

            return 'Success';

        } catch (Exception e) {
            throw new AuraHandledException('Error removing from wishlist: ' + e.getMessage());
        }
    }

    /**
     * Update wishlist item notes
     */
    @AuraEnabled
    public static String updateWishlistNotes(String wishlistItemId, String notes) {
        try {
            Wishlist_Item__c wishlistItem = new Wishlist_Item__c(
                Id = wishlistItemId,
                Notes__c = notes
            );
            update wishlistItem;

            return 'Success';

        } catch (Exception e) {
            throw new AuraHandledException('Error updating wishlist notes: ' + e.getMessage());
        }
    }

    /**
     * Helper method to update wishlist totals
     */
    private static void updateWishlistTotals(Id wishlistId) {
        List<Wishlist_Item__c> wishlistItems = [
            SELECT Id
            FROM Wishlist_Item__c
            WHERE Wishlist__c = :wishlistId
        ];

        Wishlist__c wishlist = new Wishlist__c(
            Id = wishlistId,
            Total_Items__c = wishlistItems.size()
        );
        update wishlist;
    }

    /**
     * Update user profile information
     */
    @AuraEnabled
    public static String updateProfileInfo(String personalInfoJson, String addressInfoJson) {
        try {
            User currentUser = [SELECT Id, ContactId FROM User WHERE Id = :UserInfo.getUserId() LIMIT 1];

            // Parse JSON
            Map<String, Object> personalData = (Map<String, Object>) JSON.deserializeUntyped(personalInfoJson);
            Map<String, Object> addressData = (Map<String, Object>) JSON.deserializeUntyped(addressInfoJson);

            // Update User record
            User userToUpdate = new User(Id = currentUser.Id);
            if (personalData.containsKey('phone')) userToUpdate.Phone = (String) personalData.get('phone');
            if (personalData.containsKey('mobile')) userToUpdate.MobilePhone = (String) personalData.get('mobile');
            if (personalData.containsKey('title')) userToUpdate.Title = (String) personalData.get('title');
            if (personalData.containsKey('department')) userToUpdate.Department = (String) personalData.get('department');
            if (personalData.containsKey('aboutMe')) userToUpdate.AboutMe = (String) personalData.get('aboutMe');

            if (addressData.containsKey('street')) userToUpdate.Street = (String) addressData.get('street');
            if (addressData.containsKey('city')) userToUpdate.City = (String) addressData.get('city');
            if (addressData.containsKey('state')) userToUpdate.State = (String) addressData.get('state');
            if (addressData.containsKey('postalCode')) userToUpdate.PostalCode = (String) addressData.get('postalCode');
            if (addressData.containsKey('country')) userToUpdate.Country = (String) addressData.get('country');

            update userToUpdate;

            // Update Contact if exists
            if (currentUser.ContactId != null) {
                Contact contactToUpdate = new Contact(Id = currentUser.ContactId);
                if (addressData.containsKey('street')) contactToUpdate.MailingStreet = (String) addressData.get('street');
                if (addressData.containsKey('city')) contactToUpdate.MailingCity = (String) addressData.get('city');
                if (addressData.containsKey('state')) contactToUpdate.MailingState = (String) addressData.get('state');
                if (addressData.containsKey('postalCode')) contactToUpdate.MailingPostalCode = (String) addressData.get('postalCode');
                if (addressData.containsKey('country')) contactToUpdate.MailingCountry = (String) addressData.get('country');

                update contactToUpdate;
            }

            return 'Success';

        } catch (Exception e) {
            throw new AuraHandledException('Error updating profile: ' + e.getMessage());
        }
    }

    // Wrapper Classes
    public class ProfileDataWrapper {
        @AuraEnabled public PersonalInfo personalInfo { get; set; }
        @AuraEnabled public AddressInfo address { get; set; }
        @AuraEnabled public String contactId { get; set; }
        @AuraEnabled public String accountId { get; set; }
        @AuraEnabled public String accountName { get; set; }
    }

    public class PersonalInfo {
        @AuraEnabled public String name { get; set; }
        @AuraEnabled public String email { get; set; }
        @AuraEnabled public String phone { get; set; }
        @AuraEnabled public String mobile { get; set; }
        @AuraEnabled public String title { get; set; }
        @AuraEnabled public String department { get; set; }
        @AuraEnabled public String company { get; set; }
        @AuraEnabled public String aboutMe { get; set; }
        @AuraEnabled public String photoUrl { get; set; }
        @AuraEnabled public Date birthdate { get; set; }
    }

    public class AddressInfo {
        @AuraEnabled public String street { get; set; }
        @AuraEnabled public String city { get; set; }
        @AuraEnabled public String state { get; set; }
        @AuraEnabled public String postalCode { get; set; }
        @AuraEnabled public String country { get; set; }
    }

    public class OrderWrapper {
        @AuraEnabled public String id { get; set; }
        @AuraEnabled public String orderNumber { get; set; }
        @AuraEnabled public String status { get; set; }
        @AuraEnabled public Decimal totalAmount { get; set; }
        @AuraEnabled public DateTime orderDate { get; set; }
        @AuraEnabled public String type { get; set; }
        @AuraEnabled public String accountName { get; set; }
        @AuraEnabled public String poNumber { get; set; }
    }

    public class CartDataWrapper {
        @AuraEnabled public String cartId { get; set; }
        @AuraEnabled public String cartNumber { get; set; }
        @AuraEnabled public String cartUUID { get; set; }
        @AuraEnabled public Integer totalItems { get; set; }
        @AuraEnabled public Decimal totalAmount { get; set; }
        @AuraEnabled public Boolean hasCart { get; set; }
        @AuraEnabled public List<CartItemWrapper> cartItems { get; set; }
    }

    public class CartItemWrapper {
        @AuraEnabled public String id { get; set; }
        @AuraEnabled public String name { get; set; }
        @AuraEnabled public String propertyId { get; set; }
        @AuraEnabled public String propertyName { get; set; }
        @AuraEnabled public Decimal propertyPrice { get; set; }
        @AuraEnabled public String propertyImage { get; set; }
        @AuraEnabled public String propertyStatus { get; set; }
        @AuraEnabled public Integer quantity { get; set; }
        @AuraEnabled public Decimal subtotal { get; set; }
        @AuraEnabled public Decimal discount { get; set; }
        @AuraEnabled public Decimal total { get; set; }
        @AuraEnabled public DateTime addedDate { get; set; }
        @AuraEnabled public String location { get; set; }
    }

    public class WishlistDataWrapper {
        @AuraEnabled public String wishlistId { get; set; }
        @AuraEnabled public String wishlistNumber { get; set; }
        @AuraEnabled public String wishlistName { get; set; }
        @AuraEnabled public Integer totalItems { get; set; }
        @AuraEnabled public String description { get; set; }
        @AuraEnabled public Boolean hasWishlist { get; set; }
        @AuraEnabled public List<WishlistItemWrapper> wishlistItems { get; set; }
    }

    public class WishlistItemWrapper {
        @AuraEnabled public String id { get; set; }
        @AuraEnabled public String name { get; set; }
        @AuraEnabled public String propertyId { get; set; }
        @AuraEnabled public String propertyName { get; set; }
        @AuraEnabled public Decimal propertyPrice { get; set; }
        @AuraEnabled public String propertyImage { get; set; }
        @AuraEnabled public String propertyStatus { get; set; }
        @AuraEnabled public String propertyType { get; set; }
        @AuraEnabled public Decimal bedrooms { get; set; }
        @AuraEnabled public Decimal bathrooms { get; set; }
        @AuraEnabled public DateTime addedDate { get; set; }
        @AuraEnabled public String notes { get; set; }
        @AuraEnabled public String location { get; set; }
    }
}
