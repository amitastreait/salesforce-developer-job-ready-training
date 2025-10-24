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
     * Gets current logged-in user information
     * @return CurrentUserInfo wrapper with user name and email
     */
    @AuraEnabled(cacheable=true)
    public static CurrentUserInfo getCurrentUserInfo() {
        CurrentUserInfo currentUserInfo = new CurrentUserInfo();

        try {
            Id userId = UserInfo.getUserId();
            User currentUser = [
                SELECT Id, Name, Email, ContactId
                FROM User
                WHERE Id = :userId
                LIMIT 1
            ];

            currentUserInfo.name = currentUser.Name;
            currentUserInfo.email = currentUser.Email;
            currentUserInfo.isGuest = currentUser.ContactId == null;

        } catch (Exception e) {
            System.debug('Error fetching user info: ' + e.getMessage());
            currentUserInfo.isGuest = true;
        }

        return currentUserInfo;
    }

    /**
     * Creates an Appointment record for property viewing
     * @param propertyId - The Id of the Property__c record
     * @param appointmentDateTime - DateTime for the appointment
     * @param name - Name of the person scheduling the viewing
     * @param phone - Phone number of the person
     * @return AppointmentResult wrapper with success status and message
     */
    @AuraEnabled
    public static AppointmentResult createAppointment(Id propertyId, String appointmentDateTime, String name, String phone) {
        AppointmentResult result = new AppointmentResult();

        try {
            // Validate required fields
            if (propertyId == null) {
                result.success = false;
                result.message = 'Property ID is required';
                return result;
            }

            if (String.isBlank(appointmentDateTime) || String.isBlank(name) || String.isBlank(phone)) {
                result.success = false;
                result.message = 'All fields are required';
                return result;
            }

            // Parse the date and time
            DateTime appointmentDT;
            try {
                appointmentDT = DateTime.valueOf(appointmentDateTime);
            } catch (Exception e) {
                result.success = false;
                result.message = 'Invalid date/time format';
                return result;
            }

            // Validate appointment is in the future
            if (appointmentDT < DateTime.now()) {
                result.success = false;
                result.message = 'Appointment date/time must be in the future';
                return result;
            }

            // Check if property exists
            List<Property__c> properties = [SELECT Id FROM Property__c WHERE Id = :propertyId LIMIT 1];
            if (properties.isEmpty()) {
                result.success = false;
                result.message = 'Property not found';
                return result;
            }

            // Get current user's Account (Buyer) if exists
            Id buyerId = null;
            List<User> currentUser = [SELECT ContactId FROM User WHERE Id = :UserInfo.getUserId() LIMIT 1];
            if (!currentUser.isEmpty() && currentUser[0].ContactId != null) {
                List<Contact> contacts = [SELECT AccountId FROM Contact WHERE Id = :currentUser[0].ContactId LIMIT 1];
                if (!contacts.isEmpty()) {
                    buyerId = contacts[0].AccountId;
                }
            }

            // Create Appointment__c record
            Appointment__c appointment = new Appointment__c();
            appointment.Property__c = propertyId;
            appointment.Buyer__c = buyerId;
            appointment.Appointment_Date_Time__c = appointmentDT;
            appointment.Status__c = 'Requested'; // Default status
            appointment.Type__c = 'Private'; // Default type - valid values: Private, Virtual Tour, Open House
            appointment.Duration_in_Minutes__c = 60; // Default 1 hour duration
            appointment.Purpose__c = 'Property viewing appointment scheduled by ' + name + ' (Phone: ' + phone + ')';

            insert appointment;

            result.success = true;
            result.message = 'Appointment scheduled successfully';
            result.appointmentId = appointment.Id;

        } catch (DmlException dmlEx) {
            result.success = false;
            result.message = 'Error creating appointment: ' + dmlEx.getDmlMessage(0);
            System.debug('DML Exception: ' + dmlEx.getMessage());
        } catch (Exception e) {
            result.success = false;
            result.message = 'An unexpected error occurred: ' + e.getMessage();
            System.debug('Exception: ' + e.getMessage() + ' - Stack Trace: ' + e.getStackTraceString());
        }

        return result;
    }

    /**
     * Gets appointments for the current logged-in user
     * @return List of Appointment__c records with related property information
     */
    @AuraEnabled(cacheable=true)
    public static List<AppointmentWrapper> getUserAppointments() {
        List<AppointmentWrapper> appointments = new List<AppointmentWrapper>();

        try {
            // Get current user's Account (Buyer) if exists
            Id buyerId = null;
            List<User> currentUser = [SELECT ContactId FROM User WHERE Id = :UserInfo.getUserId() LIMIT 1];
            if (!currentUser.isEmpty() && currentUser[0].ContactId != null) {
                List<Contact> contacts = [SELECT AccountId FROM Contact WHERE Id = :currentUser[0].ContactId LIMIT 1];
                if (!contacts.isEmpty()) {
                    buyerId = contacts[0].AccountId;
                }
            }

            // Query appointments for the current user
            List<Appointment__c> appointmentList = [
                SELECT Id, Name, Appointment_Date_Time__c, Status__c, Type__c,
                       Duration_in_Minutes__c, Purpose__c, Property__c, Property__r.Name,
                       Property__r.Address__c, Property__r.Listing_price__c,
                       Property__r.Property_Type__c, Property__r.Image_URL__c,
                       Property__r.Location_Site__r.City__c, Property__r.Location_Site__r.State__c,
                       CreatedDate, LastModifiedDate
                FROM Appointment__c
                WHERE Buyer__c = :buyerId
                ORDER BY Appointment_Date_Time__c DESC
                LIMIT 100
            ];

            // Convert to wrapper objects
            for (Appointment__c appointment : appointmentList) {
                AppointmentWrapper wrapper = new AppointmentWrapper();
                wrapper.appointment = appointment;
                wrapper.propertyId = appointment.Property__c;
                wrapper.propertyName = appointment.Property__r.Name;
                wrapper.propertyAddress = appointment.Property__r.Address__c;
                wrapper.propertyPrice = appointment.Property__r.Listing_price__c;
                wrapper.propertyType = appointment.Property__r.Property_Type__c;
                wrapper.propertyImage = appointment.Property__r.Image_URL__c;
                wrapper.propertyCity = appointment.Property__r.Location_Site__r.City__c;
                wrapper.propertyState = appointment.Property__r.Location_Site__r.State__c;
                appointments.add(wrapper);
            }

        } catch (Exception e) {
            System.debug('Error fetching user appointments: ' + e.getMessage());
            throw new AuraHandledException('Error fetching appointments: ' + e.getMessage());
        }

        return appointments;
    }

    /**
     * Gets property inquiries for the current logged-in user
     * @return List of PropertyInquiry__c records with related property information
     */
    @AuraEnabled(cacheable=true)
    public static List<InquiryWrapper> getUserInquiries() {
        List<InquiryWrapper> inquiries = new List<InquiryWrapper>();

        try {
            // Get current user's Account (Buyer) if exists
            Id buyerId = null;
            List<User> currentUser = [SELECT ContactId FROM User WHERE Id = :UserInfo.getUserId() LIMIT 1];
            if (!currentUser.isEmpty() && currentUser[0].ContactId != null) {
                List<Contact> contacts = [SELECT AccountId FROM Contact WHERE Id = :currentUser[0].ContactId LIMIT 1];
                if (!contacts.isEmpty()) {
                    buyerId = contacts[0].AccountId;
                }
            }

            // Query inquiries for the current user
            List<PropertyInquiry__c> inquiryList = [
                SELECT Id, Name, Message__c, Inquiry_Date__c, Status__c, Priority__c,
                       Inquiry_Type__c, Response__c, Property__c, Property__r.Name,
                       Property__r.Address__c, Property__r.Listing_price__c,
                       Property__r.Property_Type__c, Property__r.Image_URL__c,
                       Property__r.Location_Site__r.City__c, Property__r.Location_Site__r.State__c,
                       CreatedDate, LastModifiedDate
                FROM PropertyInquiry__c
                WHERE Buyer__c = :buyerId
                ORDER BY CreatedDate DESC
                LIMIT 100
            ];

            // Convert to wrapper objects
            for (PropertyInquiry__c inquiry : inquiryList) {
                InquiryWrapper wrapper = new InquiryWrapper();
                wrapper.inquiry = inquiry;
                wrapper.propertyId = inquiry.Property__c;
                wrapper.propertyName = inquiry.Property__r.Name;
                wrapper.propertyAddress = inquiry.Property__r.Address__c;
                wrapper.propertyPrice = inquiry.Property__r.Listing_price__c;
                wrapper.propertyType = inquiry.Property__r.Property_Type__c;
                wrapper.propertyImage = inquiry.Property__r.Image_URL__c;
                wrapper.propertyCity = inquiry.Property__r.Location_Site__r.City__c;
                wrapper.propertyState = inquiry.Property__r.Location_Site__r.State__c;
                inquiries.add(wrapper);
            }

        } catch (Exception e) {
            System.debug('Error fetching user inquiries: ' + e.getMessage());
            throw new AuraHandledException('Error fetching inquiries: ' + e.getMessage());
        }

        return inquiries;
    }

    /**
     * Creates a Property Inquiry record
     * @param propertyId - The Id of the Property__c record
     * @param name - Name of the person making the inquiry
     * @param email - Email address of the person
     * @param phone - Phone number of the person (optional)
     * @param message - Inquiry message
     * @return InquiryResult wrapper with success status and message
     */
    @AuraEnabled
    public static InquiryResult createPropertyInquiry(Id propertyId, String name, String email, String phone, String message) {
        InquiryResult result = new InquiryResult();

        try {
            // Validate required fields
            if (propertyId == null) {
                result.success = false;
                result.message = 'Property ID is required';
                return result;
            }

            if (String.isBlank(name) || String.isBlank(email) || String.isBlank(message)) {
                result.success = false;
                result.message = 'Name, email, and message are required fields';
                return result;
            }

            // Validate email format
            String emailPattern = '^[a-zA-Z0-9._|\\\\%#~`=?&/$^*!}{+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$';
            Pattern emailRegex = Pattern.compile(emailPattern);
            Matcher emailMatcher = emailRegex.matcher(email);

            if (!emailMatcher.matches()) {
                result.success = false;
                result.message = 'Please provide a valid email address';
                return result;
            }

            // Check if property exists
            List<Property__c> properties = [SELECT Id FROM Property__c WHERE Id = :propertyId LIMIT 1];
            if (properties.isEmpty()) {
                result.success = false;
                result.message = 'Property not found';
                return result;
            }

            // Get current user's Account (Buyer) if exists
            Id buyerId = null;
            List<User> currentUser = [SELECT ContactId FROM User WHERE Id = :UserInfo.getUserId() LIMIT 1];
            if (!currentUser.isEmpty() && currentUser[0].ContactId != null) {
                List<Contact> contacts = [SELECT AccountId FROM Contact WHERE Id = :currentUser[0].ContactId LIMIT 1];
                if (!contacts.isEmpty()) {
                    buyerId = contacts[0].AccountId;
                }
            }

            // Create PropertyInquiry__c record
            PropertyInquiry__c inquiry = new PropertyInquiry__c();
            inquiry.Property__c = propertyId;
            inquiry.Buyer__c = buyerId;
            inquiry.Inquiry_Date__c = System.today();
            inquiry.Status__c = 'New'; // Default status
            inquiry.Priority__c = 'Medium'; // Default priority
            inquiry.Inquiry_Type__c = 'General Info'; // Default type

            // Store contact info and message together
            String fullMessage = 'Contact: ' + name + '\n';
            fullMessage += 'Email: ' + email + '\n';
            if (String.isNotBlank(phone)) {
                fullMessage += 'Phone: ' + phone + '\n';
            }
            fullMessage += '\nMessage:\n' + message;
            inquiry.Message__c = fullMessage;

            insert inquiry;

            result.success = true;
            result.message = 'Inquiry submitted successfully';
            result.inquiryId = inquiry.Id;

        } catch (DmlException dmlEx) {
            result.success = false;
            result.message = 'Error creating inquiry: ' + dmlEx.getDmlMessage(0);
            System.debug('DML Exception: ' + dmlEx.getMessage());
        } catch (Exception e) {
            result.success = false;
            result.message = 'An unexpected error occurred: ' + e.getMessage();
            System.debug('Exception: ' + e.getMessage() + ' - Stack Trace: ' + e.getStackTraceString());
        }

        return result;
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

    /**
     * Wrapper class for inquiry creation result
     */
    public class InquiryResult {
        @AuraEnabled public Boolean success { get; set; }
        @AuraEnabled public String message { get; set; }
        @AuraEnabled public Id inquiryId { get; set; }

        public InquiryResult() {
            this.success = false;
            this.message = '';
            this.inquiryId = null;
        }
    }

    /**
     * Wrapper class for current user information
     */
    public class CurrentUserInfo {
        @AuraEnabled public String name { get; set; }
        @AuraEnabled public String email { get; set; }
        @AuraEnabled public Boolean isGuest { get; set; }

        public CurrentUserInfo() {
            this.name = '';
            this.email = '';
            this.isGuest = true;
        }
    }

    /**
     * Wrapper class for inquiry with related property information
     */
    public class InquiryWrapper {
        @AuraEnabled public PropertyInquiry__c inquiry { get; set; }
        @AuraEnabled public Id propertyId { get; set; }
        @AuraEnabled public String propertyName { get; set; }
        @AuraEnabled public String propertyAddress { get; set; }
        @AuraEnabled public Decimal propertyPrice { get; set; }
        @AuraEnabled public String propertyType { get; set; }
        @AuraEnabled public String propertyImage { get; set; }
        @AuraEnabled public String propertyCity { get; set; }
        @AuraEnabled public String propertyState { get; set; }
    }

    /**
     * Wrapper class for appointment creation result
     */
    public class AppointmentResult {
        @AuraEnabled public Boolean success { get; set; }
        @AuraEnabled public String message { get; set; }
        @AuraEnabled public Id appointmentId { get; set; }

        public AppointmentResult() {
            this.success = false;
            this.message = '';
            this.appointmentId = null;
        }
    }

    /**
     * Wrapper class for appointment with related property information
     */
    public class AppointmentWrapper {
        @AuraEnabled public Appointment__c appointment { get; set; }
        @AuraEnabled public Id propertyId { get; set; }
        @AuraEnabled public String propertyName { get; set; }
        @AuraEnabled public String propertyAddress { get; set; }
        @AuraEnabled public Decimal propertyPrice { get; set; }
        @AuraEnabled public String propertyType { get; set; }
        @AuraEnabled public String propertyImage { get; set; }
        @AuraEnabled public String propertyCity { get; set; }
        @AuraEnabled public String propertyState { get; set; }
    }
}