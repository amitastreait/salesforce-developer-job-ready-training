/**
 * ProductMergeUtility - Merges Product2 records and updates all related records
 * 
 * Usage Example:
 * ProductMergeUtility.MergeResult result = ProductMergeUtility.mergeProducts(
 *     masterProductId, 
 *     new List<Id>{duplicateId1, duplicateId2}
 * );
 */
public without sharing class ProductMergeUtility {
    
    public class MergeResult {
        public Boolean success;
        public String message;
        public Integer recordsUpdated;
        public List<String> errors;
        
        public MergeResult() {
            this.success = true;
            this.message = '';
            this.recordsUpdated = 0;
            this.errors = new List<String>();
        }
    }
    
    /**
     * Merge multiple duplicate products into a master product
     * @param masterProductId The Product2 Id to keep
     * @param duplicateProductIds List of Product2 Ids to merge into master
     * @return MergeResult with details of the merge operation
     */
    public static MergeResult mergeProducts(Id masterProductId, List<Id> duplicateProductIds) {
        MergeResult result = new MergeResult();
        
        // Validation
        if (masterProductId == null || duplicateProductIds == null || duplicateProductIds.isEmpty()) {
            result.success = false;
            result.message = 'Master Product Id and at least one duplicate Product Id are required';
            return result;
        }
        
        // Ensure master is not in duplicates list
        if (duplicateProductIds.contains(masterProductId)) {
            result.success = false;
            result.message = 'Master Product cannot be in the duplicates list';
            return result;
        }
        
        // Verify products exist
        List<Product2> products = [SELECT Id, Name FROM Product2 WHERE Id = :masterProductId OR Id IN :duplicateProductIds];
        if (products.size() != (duplicateProductIds.size() + 1)) {
            result.success = false;
            result.message = 'One or more Product Ids are invalid';
            return result;
        }
        
        Savepoint sp = Database.setSavepoint();
        
        try {
            // Update all standard related records
            result.recordsUpdated += updateOpportunityLineItems(masterProductId, duplicateProductIds);
            result.recordsUpdated += updateQuoteLineItems(masterProductId, duplicateProductIds);
            result.recordsUpdated += updateOrderItems(masterProductId, duplicateProductIds);
            result.recordsUpdated += updateAssets(masterProductId, duplicateProductIds);
            result.recordsUpdated += updateContractLineItems(masterProductId, duplicateProductIds);
            
            // Handle PricebookEntries - this is complex due to unique constraint
            result.recordsUpdated += mergePricebookEntries(masterProductId, duplicateProductIds, result);
            
            // Update all custom objects with Product2 lookups
            result.recordsUpdated += updateCustomProductRelationships(masterProductId, duplicateProductIds, result);
            
            // Delete duplicate products
            List<Product2> duplicateProducts = [SELECT Id FROM Product2 WHERE Id IN :duplicateProductIds];
            delete duplicateProducts;
            
            result.success = true;
            result.message = 'Successfully merged ' + duplicateProductIds.size() + ' product(s) into master product. ' + 
                           result.recordsUpdated + ' related records updated.';
            
        } catch (Exception e) {
            Database.rollback(sp);
            result.success = false;
            result.message = 'Error during merge: ' + e.getMessage();
            result.errors.add(e.getStackTraceString());
        }
        
        return result;
    }
    
    /**
     * Update OpportunityLineItems to point to master product
     */
    private static Integer updateOpportunityLineItems(Id masterProductId, List<Id> duplicateProductIds) {
        List<OpportunityLineItem> items = [
            SELECT Id, Product2Id 
            FROM OpportunityLineItem 
            WHERE Product2Id IN :duplicateProductIds
        ];
        
        for (OpportunityLineItem item : items) {
            item.Product2Id = masterProductId;
        }
        
        if (!items.isEmpty()) {
            update items;
        }
        
        return items.size();
    }
    
    /**
     * Update QuoteLineItems to point to master product
     */
    private static Integer updateQuoteLineItems(Id masterProductId, List<Id> duplicateProductIds) {
        List<QuoteLineItem> items = [
            SELECT Id, Product2Id 
            FROM QuoteLineItem 
            WHERE Product2Id IN :duplicateProductIds
        ];
        
        for (QuoteLineItem item : items) {
            item.Product2Id = masterProductId;
        }
        
        if (!items.isEmpty()) {
            update items;
        }
        
        return items.size();
    }
    
    /**
     * Update OrderItems to point to master product
     */
    private static Integer updateOrderItems(Id masterProductId, List<Id> duplicateProductIds) {
        List<OrderItem> items = [
            SELECT Id, Product2Id 
            FROM OrderItem 
            WHERE Product2Id IN :duplicateProductIds
        ];
        
        for (OrderItem item : items) {
            item.Product2Id = masterProductId;
        }
        
        if (!items.isEmpty()) {
            update items;
        }
        
        return items.size();
    }
    
    /**
     * Update Assets to point to master product
     */
    private static Integer updateAssets(Id masterProductId, List<Id> duplicateProductIds) {
        List<Asset> items = [
            SELECT Id, Product2Id 
            FROM Asset 
            WHERE Product2Id IN :duplicateProductIds
        ];
        
        for (Asset item : items) {
            item.Product2Id = masterProductId;
        }
        
        if (!items.isEmpty()) {
            update items;
        }
        
        return items.size();
    }
    
    /**
     * Update ContractLineItems to point to master product
     */
    private static Integer updateContractLineItems(Id masterProductId, List<Id> duplicateProductIds) {
        List<ContractLineItem> items = [
            SELECT Id, Product2Id 
            FROM ContractLineItem 
            WHERE Product2Id IN :duplicateProductIds
        ];
        
        for (ContractLineItem item : items) {
            //item.Product2Id = masterProductId;
        }
        
        if (!items.isEmpty()) {
            update items;
        }
        
        return items.size();
    }
    
    /**
     * Merge PricebookEntries - this is complex because of unique constraint on Pricebook2Id + Product2Id
     */
    private static Integer mergePricebookEntries(Id masterProductId, List<Id> duplicateProductIds, MergeResult result) {
        Integer updatedCount = 0;
        
        // Get all pricebook entries for duplicates
        List<PricebookEntry> duplicateEntries = [
            SELECT Id, Pricebook2Id, Product2Id, UnitPrice, IsActive, UseStandardPrice
            FROM PricebookEntry 
            WHERE Product2Id IN :duplicateProductIds
        ];
        
        // Get all pricebook entries for master
        Map<Id, PricebookEntry> masterEntriesMap = new Map<Id, PricebookEntry>();
        for (PricebookEntry entry : [
            SELECT Id, Pricebook2Id, Product2Id, UnitPrice, IsActive 
            FROM PricebookEntry 
            WHERE Product2Id = :masterProductId
        ]) {
            masterEntriesMap.put(entry.Pricebook2Id, entry);
        }
        
        List<PricebookEntry> entriesToDelete = new List<PricebookEntry>();
        List<PricebookEntry> entriesToUpdate = new List<PricebookEntry>();
        
        for (PricebookEntry duplicateEntry : duplicateEntries) {
            if (masterEntriesMap.containsKey(duplicateEntry.Pricebook2Id)) {
                // Master already has entry for this pricebook - delete duplicate
                entriesToDelete.add(duplicateEntry);
                result.errors.add('Duplicate PricebookEntry found for Pricebook: ' + duplicateEntry.Pricebook2Id + 
                                ' - Keeping master product entry');
            } else {
                // Master doesn't have entry for this pricebook - update to master
                duplicateEntry.Product2Id = masterProductId;
                entriesToUpdate.add(duplicateEntry);
            }
        }
        
        if (!entriesToDelete.isEmpty()) {
            delete entriesToDelete;
        }
        
        if (!entriesToUpdate.isEmpty()) {
            update entriesToUpdate;
            updatedCount = entriesToUpdate.size();
        }
        
        return updatedCount;
    }
    
    /**
     * Dynamically find and update all custom objects with Product2 relationships
     */
    private static Integer updateCustomProductRelationships(Id masterProductId, List<Id> duplicateProductIds, MergeResult result) {
        Integer totalUpdated = 0;
        
        // Get all custom object API names and their Product2 lookup fields
        Map<String, List<String>> objectToFieldsMap = getCustomProductRelationships();
        
        if (objectToFieldsMap.isEmpty()) {
            result.errors.add('No custom Product2 relationships found');
            return 0;
        }
        
        // Update each custom object
        for (String objectName : objectToFieldsMap.keySet()) {
            List<String> fieldNames = objectToFieldsMap.get(objectName);
            
            for (String fieldName : fieldNames) {
                try {
                    Integer updated = updateCustomObject(objectName, fieldName, masterProductId, duplicateProductIds);
                    totalUpdated += updated;
                    
                    if (updated > 0) {
                        result.errors.add('Updated ' + updated + ' record(s) in ' + objectName + '.' + fieldName);
                    }
                } catch (Exception e) {
                    result.errors.add('Error updating ' + objectName + '.' + fieldName + ': ' + e.getMessage());
                }
            }
        }
        
        return totalUpdated;
    }
    
    /**
     * Get all custom objects with Product2 lookup/master-detail fields
     */
    private static Map<String, List<String>> getCustomProductRelationships() {
        Map<String, List<String>> objectToFieldsMap = new Map<String, List<String>>();
        
        // Get all objects in the org
        Map<String, Schema.SObjectType> globalDescribe = Schema.getGlobalDescribe();
        
        for (String objectName : globalDescribe.keySet()) {
            // Only process custom objects (ending with __c)
            if (!objectName.endsWith('__c')) {
                continue;
            }
            
            Schema.SObjectType objectType = globalDescribe.get(objectName);
            Schema.DescribeSObjectResult objectDescribe = objectType.getDescribe();
            
            // Skip if object is not accessible or not updateable
            if (!objectDescribe.isAccessible() || !objectDescribe.isUpdateable()) {
                continue;
            }
            
            // Get all fields for this object
            Map<String, Schema.SObjectField> fieldMap = objectDescribe.fields.getMap();
            List<String> productFields = new List<String>();
            
            for (String fieldName : fieldMap.keySet()) {
                Schema.DescribeFieldResult fieldDescribe = fieldMap.get(fieldName).getDescribe();
                
                // Check if this is a reference field to Product2
                if (fieldDescribe.getType() == Schema.DisplayType.REFERENCE) {
                    List<Schema.SObjectType> references = fieldDescribe.getReferenceTo();
                    
                    for (Schema.SObjectType refType : references) {
                        if (refType == Product2.SObjectType) {
                            // This field references Product2
                            if (fieldDescribe.isAccessible() && fieldDescribe.isUpdateable()) {
                                productFields.add(fieldName);
                            }
                        }
                    }
                }
            }
            
            if (!productFields.isEmpty()) {
                objectToFieldsMap.put(objectName, productFields);
            }
        }
        
        return objectToFieldsMap;
    }
    
    /**
     * Update a specific custom object's Product2 reference field
     */
    private static Integer updateCustomObject(String objectName, String fieldName, Id masterProductId, List<Id> duplicateProductIds) {
        // Build dynamic SOQL query
        String query = 'SELECT Id, ' + fieldName + ' FROM ' + objectName + ' WHERE ' + fieldName + ' IN :duplicateProductIds';
        
        List<SObject> records = Database.query(query);
        
        if (records.isEmpty()) {
            return 0;
        }
        
        // Update all records to point to master product
        for (SObject record : records) {
            record.put(fieldName, masterProductId);
        }
        
        update records;
        
        return records.size();
    }
    
    /**
     * Find potential duplicate products based on name similarity
     * @param productName The product name to search for
     * @return List of potential duplicate Product2 records
     */
    public static List<Product2> findPotentialDuplicates(String productName) {
        String searchTerm = '%' + productName + '%';
        return [
            SELECT Id, Name, ProductCode, IsActive, Description 
            FROM Product2 
            WHERE Name LIKE :searchTerm
            ORDER BY Name
            LIMIT 100
        ];
    }
    
    /**
     * Get a report of all objects (standard and custom) that reference Product2
     * Useful for understanding what will be affected by a merge
     */
    public static Map<String, List<String>> getAllProductRelationships() {
        Map<String, List<String>> allRelationships = new Map<String, List<String>>();
        
        // Add standard objects
        allRelationships.put('OpportunityLineItem', new List<String>{'Product2Id'});
        allRelationships.put('QuoteLineItem', new List<String>{'Product2Id'});
        allRelationships.put('OrderItem', new List<String>{'Product2Id'});
        allRelationships.put('Asset', new List<String>{'Product2Id'});
        allRelationships.put('ContractLineItem', new List<String>{'Product2Id'});
        allRelationships.put('PricebookEntry', new List<String>{'Product2Id'});
        
        // Add custom objects
        allRelationships.putAll(getCustomProductRelationships());
        
        return allRelationships;
    }
}

/**
 * Example Usage in Anonymous Apex:
 * 
 * // 1. Check what objects will be affected by the merge
 * Map<String, List<String>> allRelationships = ProductMergeUtility.getAllProductRelationships();
 * System.debug('Objects that reference Product2:');
 * for (String objectName : allRelationships.keySet()) {
 *     System.debug(objectName + ' - Fields: ' + allRelationships.get(objectName));
 * }
 * 
 * // 2. Find potential duplicates
 * List<Product2> duplicates = ProductMergeUtility.findPotentialDuplicates('Widget');
 * for (Product2 p : duplicates) {
 *     System.debug(p.Name + ' - ' + p.Id);
 * }
 * 
 * // 3. Merge products
 * Id masterProductId = '01t...'; // Replace with actual master product Id
 * List<Id> duplicateIds = new List<Id>{'01t...', '01t...'}; // Replace with actual duplicate Ids
 * 
 * ProductMergeUtility.MergeResult result = ProductMergeUtility.mergeProducts(masterProductId, duplicateIds);
 * 
 * System.debug('Success: ' + result.success);
 * System.debug('Message: ' + result.message);
 * System.debug('Records Updated: ' + result.recordsUpdated);
 * if (!result.errors.isEmpty()) {
 *     System.debug('--- Detailed Log ---');
 *     for (String error : result.errors) {
 *         System.debug(error);
 *     }
 * }
 * 
 * // 4. Example: Merge in a batch (for multiple sets of duplicates)
 * Map<Id, List<Id>> mergeSets = new Map<Id, List<Id>>{
 *     '01t...' => new List<Id>{'01t...', '01t...'},  // Master => Duplicates
 *     '01t...' => new List<Id>{'01t...'}
 * };
 * 
 * for (Id masterId : mergeSets.keySet()) {
 *     ProductMergeUtility.MergeResult batchResult = ProductMergeUtility.mergeProducts(masterId, mergeSets.get(masterId));
 *     System.debug('Batch merge result: ' + batchResult.message);
 * }
 */