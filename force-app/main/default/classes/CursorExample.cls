// https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_cursors.htm
public with sharing class CursorExample {
    
    @AuraEnabled
    public static CursorResponse pagination(Integer startPosition, Integer batchSize) {
        // Create a new instance of the class to get fresh cursor
        Database.Cursor locator = Database.getCursor('SELECT Id, Name, Email, Phone, Title FROM Contact ORDER BY Id');
        
        // Fetch records using the cursor
        List<Contact> records = locator.fetch(startPosition, batchSize);
        
        // Get total count of records
        Integer totalCount = [SELECT COUNT() FROM Contact];
        
        // Check if there are more records
        Boolean hasNext = false;
        if (records.size() == batchSize) {
            // Try to fetch one more record to see if there are more
            List<Contact> nextRecords = locator.fetch(startPosition + batchSize, 1);
            hasNext = !nextRecords.isEmpty();
        }
        
        // Check if there are previous records
        Boolean hasPrevious = startPosition > 0;
        
        // Return the response with records and pagination info
        CursorResponse response = new CursorResponse();
        response.records = records;
        response.totalCount = totalCount;
        response.hasPrevious = hasPrevious;
        response.hasNext = hasNext;
        response.currentPosition = startPosition;
        response.batchSize = batchSize;
        
        return response;
    }
    
    // Inner class to hold the response data
    public class CursorResponse {
        @AuraEnabled public List<Contact> records;
        @AuraEnabled public Integer totalCount;
        @AuraEnabled public Boolean hasPrevious;
        @AuraEnabled public Boolean hasNext;
        @AuraEnabled public Integer currentPosition;
        @AuraEnabled public Integer batchSize;
    }
}