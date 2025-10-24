public without sharing class PropertyOverviewController {

    /**
     * Get property overview with related details
     */
    @AuraEnabled(cacheable=true)
    public static PropertyOverviewWrapper getPropertyOverview(String propertyId) {
        try {
            if (String.isBlank(propertyId)) {
                throw new AuraHandledException('Property ID is required');
            }

            PropertyOverviewWrapper wrapper = new PropertyOverviewWrapper();

            // Query Property with basic details
            List<Property__c> properties = [
                SELECT Id, Name, Status__c, Property_Type__c, Listing_price__c,
                       Bedrooms__c, Bathrooms__c, Square_footage__c, Built_Year__c,
                       Address__c, Image_URL__c, Description__c,
                       Location_Site__r.Id, Location_Site__r.Name,
                       Location_Site__r.City__c, Location_Site__r.State__c,
                       Location_Site__r.ZIPPostal_code__c, Location_Site__r.Address__c
                FROM Property__c
                WHERE Id = :propertyId
                LIMIT 1
            ];

            if (properties.isEmpty()) {
                throw new AuraHandledException('Property not found');
            }

            Property__c property = properties[0];

            // Map property details
            wrapper.propertyId = property.Id;
            wrapper.propertyName = property.Name;
            wrapper.status = property.Status__c;
            wrapper.propertyType = property.Property_Type__c;
            wrapper.listingPrice = property.Listing_price__c;
            wrapper.bedrooms = property.Bedrooms__c;
            wrapper.bathrooms = property.Bathrooms__c;
            wrapper.sqFt = property.Square_footage__c;
            wrapper.yearBuilt = property.Built_Year__c;
            wrapper.address = property.Address__c;
            wrapper.imageUrl = property.Image_URL__c;
            wrapper.description = property.Description__c;

            // Location details
            if (property.Location_Site__c != null) {
                wrapper.locationId = property.Location_Site__r.Id;
                wrapper.locationName = property.Location_Site__r.Name;
                wrapper.city = property.Location_Site__r.City__c;
                wrapper.state = property.Location_Site__r.State__c;
                wrapper.zipCode = property.Location_Site__r.ZIPPostal_code__c;
                wrapper.street = property.Location_Site__r.Address__c;
            }

            // Query Property Images
            List<Property_Image__c> images = [
                SELECT Id, Image_URL__c, Type__c
                FROM Property_Image__c
                WHERE Property__c = :propertyId
                ORDER BY CreatedDate ASC
                LIMIT 5
            ];
            wrapper.propertyImages = new List<PropertyImageWrapper>();
            for (Property_Image__c img : images) {
                PropertyImageWrapper imgWrapper = new PropertyImageWrapper();
                imgWrapper.id = img.Id;
                imgWrapper.imageUrl = img.Image_URL__c;
                imgWrapper.type = img.Type__c;
                wrapper.propertyImages.add(imgWrapper);
            }

            // Query Property Documents
            Map<Id, PropertyDocument__c> documents = new Map<Id, PropertyDocument__c>([
                SELECT Id, Name, Type__c, Description__c, Status__c,
                       Upload_Date__c, Expiration_Date__c, Required__c
                FROM PropertyDocument__c
                WHERE Property__c = :propertyId
                ORDER BY Upload_Date__c DESC
                LIMIT 10
            ]);
            System.debug(JSON.serializePretty(documents));
            
            Map<Id, Id> documentToFileMap = new Map<Id, Id>();
            if (!documents.isEmpty()) {
                List<ContentVersion> contentVersions = [
                    SELECT ContentDocumentId, FirstPublishLocationId
                    FROM ContentVersion
                    WHERE FirstPublishLocationId IN :documents.keySet()
                    AND IsLatest = true
                    WITH SYSTEM_MODE
                    ORDER BY CreatedDate DESC
                    LIMIT 1
                ];

                for (ContentVersion cv : contentVersions) {
                    documentToFileMap.put(cv.FirstPublishLocationId, cv.ContentDocumentId);
                }
            }
            System.debug(JSON.serializePretty(documentToFileMap));

            wrapper.propertyDocuments = new List<PropertyDocumentWrapper>();
            for (PropertyDocument__c doc : documents.values()) {
                PropertyDocumentWrapper docWrapper = new PropertyDocumentWrapper();
                docWrapper.id = doc.Id;
                docWrapper.name = doc.Name;
                docWrapper.type = doc.Type__c;
                docWrapper.description = doc.Description__c;
                docWrapper.status = doc.Status__c;
                docWrapper.uploadDate = doc.Upload_Date__c;
                docWrapper.expirationDate = doc.Expiration_Date__c;
                docWrapper.required = doc.Required__c;
                docWrapper.fileId = documentToFileMap.get(doc.Id);
                wrapper.propertyDocuments.add(docWrapper);
            }

            // Query Offers
            List<Offer__c> offers = [
                SELECT Id, Name, Status__c, Offered_purchase_price__c,
                       Counter_Offer_Amount__c, Offer_Date__c,
                       Proposed_date_for_closing__c, Deposit_Amount__c,
                       Buyer__r.Name
                FROM Offer__c
                WHERE Property__c = :propertyId
                ORDER BY Offer_Date__c DESC
                LIMIT 10
            ];
            wrapper.offers = new List<OfferWrapper>();
            for (Offer__c offer : offers) {
                OfferWrapper offerWrapper = new OfferWrapper();
                offerWrapper.id = offer.Id;
                offerWrapper.name = offer.Name;
                offerWrapper.status = offer.Status__c;
                offerWrapper.offeredPrice = offer.Offered_purchase_price__c;
                offerWrapper.counterOfferAmount = offer.Counter_Offer_Amount__c;
                offerWrapper.offerDate = offer.Offer_Date__c;
                offerWrapper.proposedClosingDate = offer.Proposed_date_for_closing__c;
                offerWrapper.depositAmount = offer.Deposit_Amount__c;
                offerWrapper.buyerName = offer.Buyer__r?.Name;
                wrapper.offers.add(offerWrapper);
            }

            return wrapper;

        } catch (Exception e) {
            throw new AuraHandledException('Error fetching property overview: ' + e.getMessage());
        }
    }

    // Wrapper Classes
    public class PropertyOverviewWrapper {
        @AuraEnabled public String propertyId { get; set; }
        @AuraEnabled public String propertyName { get; set; }
        @AuraEnabled public String status { get; set; }
        @AuraEnabled public String propertyType { get; set; }
        @AuraEnabled public Decimal listingPrice { get; set; }
        @AuraEnabled public Decimal bedrooms { get; set; }
        @AuraEnabled public Decimal bathrooms { get; set; }
        @AuraEnabled public Decimal sqFt { get; set; }
        @AuraEnabled public Decimal yearBuilt { get; set; }
        @AuraEnabled public String address { get; set; }
        @AuraEnabled public String imageUrl { get; set; }
        @AuraEnabled public String description { get; set; }

        // Location
        @AuraEnabled public String locationId { get; set; }
        @AuraEnabled public String locationName { get; set; }
        @AuraEnabled public String city { get; set; }
        @AuraEnabled public String state { get; set; }
        @AuraEnabled public String zipCode { get; set; }
        @AuraEnabled public String street { get; set; }

        // Related records
        @AuraEnabled public List<PropertyImageWrapper> propertyImages { get; set; }
        @AuraEnabled public List<PropertyDocumentWrapper> propertyDocuments { get; set; }
        @AuraEnabled public List<OfferWrapper> offers { get; set; }
    }

    public class PropertyImageWrapper {
        @AuraEnabled public String id { get; set; }
        @AuraEnabled public String imageUrl { get; set; }
        @AuraEnabled public String type { get; set; }
    }

    public class PropertyDocumentWrapper {
        @AuraEnabled public String id { get; set; }
        @AuraEnabled public String name { get; set; }
        @AuraEnabled public String type { get; set; }
        @AuraEnabled public String description { get; set; }
        @AuraEnabled public String status { get; set; }
        @AuraEnabled public Date uploadDate { get; set; }
        @AuraEnabled public Date expirationDate { get; set; }
        @AuraEnabled public Boolean required { get; set; }
        @AuraEnabled public String fileId { get; set; }
    }

    public class OfferWrapper {
        @AuraEnabled public String id { get; set; }
        @AuraEnabled public String name { get; set; }
        @AuraEnabled public String status { get; set; }
        @AuraEnabled public Decimal offeredPrice { get; set; }
        @AuraEnabled public Decimal counterOfferAmount { get; set; }
        @AuraEnabled public Date offerDate { get; set; }
        @AuraEnabled public Date proposedClosingDate { get; set; }
        @AuraEnabled public Decimal depositAmount { get; set; }
        @AuraEnabled public String buyerName { get; set; }
    }
}