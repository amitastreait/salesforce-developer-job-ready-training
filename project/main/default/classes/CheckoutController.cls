public without sharing class CheckoutController {

    /**
     * Get checkout data including cart items and user information
     */
    @AuraEnabled(cacheable=false)
    public static CheckoutDataWrapper getCheckoutData() {
        try {
            CheckoutDataWrapper checkoutData = new CheckoutDataWrapper();
            Id userId = UserInfo.getUserId();

            // Get user information
            User currentUser = [
                SELECT Id, Name, Email, Phone, Street, City, State, PostalCode, Country, ContactId
                FROM User
                WHERE Id = :userId
                LIMIT 1
            ];

            checkoutData.customerName = currentUser.Name;
            checkoutData.customerEmail = currentUser.Email;
            checkoutData.customerPhone = currentUser.Phone;

            // Get contact information if available
            if (currentUser.ContactId != null) {
                Contact contact = [
                    SELECT Id, MailingStreet, MailingCity, MailingState, MailingPostalCode, MailingCountry
                    FROM Contact
                    WHERE Id = :currentUser.ContactId
                    LIMIT 1
                ];

                checkoutData.shippingStreet = contact.MailingStreet;
                checkoutData.shippingCity = contact.MailingCity;
                checkoutData.shippingState = contact.MailingState;
                checkoutData.shippingPostalCode = contact.MailingPostalCode;
                checkoutData.shippingCountry = contact.MailingCountry;
            } else {
                checkoutData.shippingStreet = currentUser.Street;
                checkoutData.shippingCity = currentUser.City;
                checkoutData.shippingState = currentUser.State;
                checkoutData.shippingPostalCode = currentUser.PostalCode;
                checkoutData.shippingCountry = currentUser.Country;
            }

            // Get active cart
            List<Cart__c> carts = [
                SELECT Id, Name, Total_Items__c, Total_Amount__c, Cart_UUID__c
                FROM Cart__c
                WHERE User__c = :userId
                AND Status__c = 'Active'
                ORDER BY LastModifiedDate DESC
                LIMIT 1
            ];

            if (carts.isEmpty()) {
                throw new AuraHandledException('No active cart found');
            }

            Cart__c cart = carts[0];
            checkoutData.cartId = cart.Id;
            checkoutData.cartNumber = cart.Name;

            // Get cart items
            List<Cart_Item__c> items = [
                SELECT Id, Name, Property__c, Property_Name__c, Property_Price__c,
                       Property_Image_URL__c, Quantity__c, Subtotal__c,
                       Discount_Amount__c, Total_Price__c,
                       Property__r.Name, Property__r.Location_Site__r.City__c,
                       Property__r.Location_Site__r.State__c
                FROM Cart_Item__c
                WHERE Cart__c = :cart.Id
                ORDER BY Added_Date__c DESC
            ];

            List<CheckoutItemWrapper> checkoutItems = new List<CheckoutItemWrapper>();
            Decimal subtotal = 0;

            for (Cart_Item__c item : items) {
                CheckoutItemWrapper ciw = new CheckoutItemWrapper();
                ciw.id = item.Id;
                ciw.propertyId = item.Property__c;
                ciw.propertyName = item.Property_Name__c != null ? item.Property_Name__c : item.Property__r?.Name;
                ciw.propertyPrice = item.Property_Price__c;
                ciw.propertyImage = item.Property_Image_URL__c;
                ciw.quantity = Integer.valueOf(item.Quantity__c != null ? item.Quantity__c : 1);
                ciw.subtotal = item.Subtotal__c;
                ciw.discount = item.Discount_Amount__c;
                ciw.total = item.Total_Price__c;
                ciw.cartId = cart.Id;
                ciw.cartUUId = cart.Cart_UUID__c;

                String location = '';
                if (item.Property__r?.Location_Site__r?.City__c != null) {
                    location = item.Property__r.Location_Site__r.City__c;
                    if (item.Property__r.Location_Site__r.State__c != null) {
                        location += ', ' + item.Property__r.Location_Site__r.State__c;
                    }
                }
                ciw.location = location;

                checkoutItems.add(ciw);

                if (item.Total_Price__c != null) {
                    subtotal += item.Total_Price__c;
                }
            }

            checkoutData.items = checkoutItems;
            checkoutData.subtotal = subtotal;

            // Calculate tax (example: 8.5% tax rate)
            checkoutData.taxRate = 8.5;
            checkoutData.tax = (subtotal * checkoutData.taxRate) / 100;

            // Shipping (example: flat rate or free over certain amount)
            checkoutData.shipping = subtotal > 500000 ? 0 : 99.00;

            // Total
            checkoutData.total = subtotal + checkoutData.tax + checkoutData.shipping;

            return checkoutData;

        } catch (Exception e) {
            throw new AuraHandledException('Error fetching checkout data: ' + e.getMessage());
        }
    }

    /**
     * Process checkout and create order
     */
    @AuraEnabled
    public static Map<String, Object> processCheckout(String checkoutDataJson) {
        try {
            Map<String, Object> checkoutInfo = (Map<String, Object>) JSON.deserializeUntyped(checkoutDataJson);
            Id userId = UserInfo.getUserId();
            Map<String, Object> result = new Map<String, Object>();

            // Get user information
            User currentUser = [
                SELECT Id, Name, Email, ContactId, AccountId
                FROM User
                WHERE Id = :userId
                LIMIT 1
            ];

            // Get or create Account (required for Order)
            Id accountId = currentUser.AccountId;
            Id contactId = currentUser.ContactId;
            if (accountId == null) {
                // Create a personal account for the user
                Account personalAccount = new Account(
                    Name = currentUser.Name + ' Personal Account',
                    OwnerId = userId,
                    RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByDeveloperName().get('PersonAccount').getRecordTypeId()
                );
                insert personalAccount;
                accountId = personalAccount.Id;
                contactId = personalAccount.PersonContactId;
            }

            // Get Standard Pricebook (required for Order)
            Pricebook2 standardPricebook = [
                SELECT Id FROM Pricebook2
                WHERE IsStandard = true
                LIMIT 1
            ];

            // Get cart
            List<Cart__c> carts = [
                SELECT Id, Name, Total_Items__c, Total_Amount__c
                FROM Cart__c
                WHERE User__c = :userId
                AND Status__c = 'Active'
                ORDER BY LastModifiedDate DESC
                LIMIT 1
            ];

            if (carts.isEmpty()) {
                throw new AuraHandledException('No active cart found');
            }

            Cart__c cart = carts[0];

            // Get cart items with property information
            List<Cart_Item__c> cartItems = [
                SELECT Id, Property__c, Property_Name__c, Property_Price__c,
                       Quantity__c, Total_Price__c, Subtotal__c
                FROM Cart_Item__c
                WHERE Cart__c = :cart.Id
            ];

            if (cartItems.isEmpty()) {
                throw new AuraHandledException('Cart is empty');
            }

            // Extract shipping and payment information from checkout data
            // The data is flattened from the LWC component
            String shippingStreet = (String) checkoutInfo.get('street');
            String shippingCity = (String) checkoutInfo.get('city');
            String shippingState = (String) checkoutInfo.get('state');
            String shippingPostalCode = (String) checkoutInfo.get('postalCode');
            String shippingCountry = (String) checkoutInfo.get('country');
            String paymentMethod = (String) checkoutInfo.get('paymentMethod');

            // Create Order
            Order newOrder = new Order();
            newOrder.AccountId = accountId;
            newOrder.CustomerAuthorizedById = contactId;
            newOrder.Name = 'ORD-' + String.valueOf(DateTime.now().getTime());
            newOrder.CurrencyIsoCode = 'EUR';
            newOrder.PoDate = Date.today();
            newOrder.PoNumber = newOrder.Name;
            newOrder.Status = 'Draft';
            newOrder.EffectiveDate = Date.today();
            newOrder.Pricebook2Id = standardPricebook.Id;

            // Add shipping address
            newOrder.ShippingStreet = shippingStreet;
            newOrder.ShippingCity = shippingCity;
            newOrder.ShippingState = shippingState;
            newOrder.ShippingPostalCode = shippingPostalCode;
            newOrder.ShippingCountry = shippingCountry;

            // Copy shipping to billing
            newOrder.BillingStreet = shippingStreet;
            newOrder.BillingCity = shippingCity;
            newOrder.BillingState = shippingState;
            newOrder.BillingPostalCode = shippingPostalCode;
            newOrder.BillingCountry = shippingCountry;

            // Add customer contact information
            if (currentUser.ContactId != null) {
                newOrder.CustomerAuthorizedById = currentUser.ContactId;
            }

            // Add order description
            newOrder.Description = 'Order created from Cart: ' + cart.Name + ' - Payment Method: ' + (paymentMethod != null ? paymentMethod : 'Credit Card');

            insert newOrder;

            // Create Order Items
            List<OrderItem> orderItems = new List<OrderItem>();
            Set<Id> propertyIds = new Set<Id>();

            // Collect property IDs from cart items
            for (Cart_Item__c cartItem : cartItems) {
                if (cartItem.Property__c != null) {
                    propertyIds.add(cartItem.Property__c);
                }
            }

            // Get PricebookEntries for products that are related to these properties
            // Each Product2 has a Property__c lookup field linking to Property__c
            Map<Id, PricebookEntry> propertyToPricebookEntry = new Map<Id, PricebookEntry>();
            List<PricebookEntry> existingEntries = [
                SELECT Id, Product2Id, Product2.Property__c, UnitPrice
                FROM PricebookEntry
                WHERE Product2.Property__c IN :propertyIds
                AND Pricebook2Id = :standardPricebook.Id
                AND IsActive = true
                AND CurrencyIsoCode = 'EUR'
            ];

            // Map Property ID to PricebookEntry for easy lookup
            for (PricebookEntry entry : existingEntries) {
                if (entry.Product2.Property__c != null) {
                    propertyToPricebookEntry.put(entry.Product2.Property__c, entry);
                }
            }

            // Create OrderItems using the existing PricebookEntries
            for (Cart_Item__c cartItem : cartItems) {
                if (cartItem.Property__c != null && propertyToPricebookEntry.containsKey(cartItem.Property__c)) {
                    PricebookEntry pbe = propertyToPricebookEntry.get(cartItem.Property__c);

                    OrderItem orderItem = new OrderItem();
                    orderItem.OrderId = newOrder.Id;
                    orderItem.PricebookEntryId = pbe.Id;
                    orderItem.Quantity = cartItem.Quantity__c != null ? Integer.valueOf(cartItem.Quantity__c) : 1;
                    orderItem.UnitPrice = pbe.UnitPrice;
                    orderItem.Description = cartItem.Property_Name__c;
                    orderItems.add(orderItem);
                } else if (cartItem.Property__c != null) {
                    // Log warning if PricebookEntry not found for this property
                    System.debug('Warning: No PricebookEntry found for Property: ' + cartItem.Property__c);
                }
            }

            if (!orderItems.isEmpty()) {
                insert orderItems;
            }

            // Activate the Order
            newOrder.Status = 'Activated';
            update newOrder;

            // Mark cart as completed
            cart.Status__c = 'Completed';
            update cart;

            // Prepare result
            result.put('success', true);
            result.put('orderId', newOrder.Id);
            result.put('orderNumber', newOrder.OrderNumber);
            result.put('message', 'Order placed successfully!');
            result.put('total', checkoutInfo.get('total'));

            return result;

        } catch (Exception e) {
            throw new AuraHandledException('Error processing checkout: ' + e.getMessage());
        }
    }

    /**
     * Validate payment information (mock validation)
     */
    @AuraEnabled
    public static Map<String, Object> validatePayment(String paymentDataJson) {
        try {
            Map<String, Object> paymentData = (Map<String, Object>) JSON.deserializeUntyped(paymentDataJson);
            Map<String, Object> result = new Map<String, Object>();

            // Mock payment validation
            // In a real scenario, you would integrate with a payment gateway

            String cardNumber = (String) paymentData.get('cardNumber');
            String cvv = (String) paymentData.get('cvv');
            String expiryDate = (String) paymentData.get('expiryDate');

            // Basic validation
            if (String.isBlank(cardNumber) || cardNumber.length() < 15) {
                result.put('success', false);
                result.put('message', 'Invalid card number');
                return result;
            }

            if (String.isBlank(cvv) || cvv.length() < 3) {
                result.put('success', false);
                result.put('message', 'Invalid CVV');
                return result;
            }

            // Mock successful payment
            result.put('success', true);
            result.put('transactionId', 'TXN-' + String.valueOf(System.currentTimeMillis()));
            result.put('message', 'Payment authorized successfully');

            return result;

        } catch (Exception e) {
            throw new AuraHandledException('Error validating payment: ' + e.getMessage());
        }
    }

    /**
     * Apply promo code
     */
    @AuraEnabled
    public static Map<String, Object> applyPromoCode(String promoCode) {
        try {
            Map<String, Object> result = new Map<String, Object>();

            // Mock promo code validation
            // In a real scenario, query from a PromoCode__c custom object

            if (promoCode == 'SAVE10') {
                result.put('success', true);
                result.put('discountPercent', 10);
                result.put('message', '10% discount applied');
            } else if (promoCode == 'SAVE20') {
                result.put('success', true);
                result.put('discountPercent', 20);
                result.put('message', '20% discount applied');
            } else {
                result.put('success', false);
                result.put('discountPercent', 0);
                result.put('message', 'Invalid promo code');
            }

            return result;

        } catch (Exception e) {
            throw new AuraHandledException('Error applying promo code: ' + e.getMessage());
        }
    }

    // Wrapper Classes
    public class CheckoutDataWrapper {
        @AuraEnabled public String cartId { get; set; }
        @AuraEnabled public String cartNumber { get; set; }
        @AuraEnabled public String customerName { get; set; }
        @AuraEnabled public String customerEmail { get; set; }
        @AuraEnabled public String customerPhone { get; set; }
        @AuraEnabled public String shippingStreet { get; set; }
        @AuraEnabled public String shippingCity { get; set; }
        @AuraEnabled public String shippingState { get; set; }
        @AuraEnabled public String shippingPostalCode { get; set; }
        @AuraEnabled public String shippingCountry { get; set; }
        @AuraEnabled public List<CheckoutItemWrapper> items { get; set; }
        @AuraEnabled public Decimal subtotal { get; set; }
        @AuraEnabled public Decimal tax { get; set; }
        @AuraEnabled public Decimal taxRate { get; set; }
        @AuraEnabled public Decimal shipping { get; set; }
        @AuraEnabled public Decimal total { get; set; }
    }

    public class CheckoutItemWrapper {
        @AuraEnabled public String id { get; set; }
        @AuraEnabled public String cartId { get; set; }
        @AuraEnabled public String cartUUId { get; set; }
        @AuraEnabled public String propertyId { get; set; }
        @AuraEnabled public String propertyName { get; set; }
        @AuraEnabled public Decimal propertyPrice { get; set; }
        @AuraEnabled public String propertyImage { get; set; }
        @AuraEnabled public Integer quantity { get; set; }
        @AuraEnabled public Decimal subtotal { get; set; }
        @AuraEnabled public Decimal discount { get; set; }
        @AuraEnabled public Decimal total { get; set; }
        @AuraEnabled public String location { get; set; }
    }
}
