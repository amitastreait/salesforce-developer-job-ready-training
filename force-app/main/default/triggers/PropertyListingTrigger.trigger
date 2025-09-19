trigger PropertyListingTrigger on Property_Listing__c (before insert) {
    Set<Id> propertyIdsSet = new Set<Id>();
    for(Property_Listing__c listing: Trigger.New){
        if(listing.Property__c == null){
            listing.Property__c.addError('Property Can not be blank while creating the Listing Record!');
        } else {
            propertyIdsSet.add(listing.Property__c);
        }
    }
    Map<Id, Property__c> propertyMap = new Map<Id, Property__c>([
       SELECT Id, Name, Listing_price__c, CurrencyIsoCode FROM Property__c WHERE Id IN: propertyIdsSet
    ]);
    for(Property_Listing__c listing: Trigger.New){
        listing.Name = propertyMap.get(listing.Id).Name;
        listing.Listing_Price__c = propertyMap.get(listing.Id).Listing_price__c;
        listing.CurrencyIsoCode  = propertyMap.get(listing.Id).CurrencyIsoCode;
    }
}