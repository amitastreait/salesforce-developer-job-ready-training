public with sharing abstract class TriggerHandler {
    /** Part 1 **/
    protected List<SObject> newRecords;
    protected Map<Id, SObject> oldMap;
    protected Map<Id, SObject> newMap;
    protected System.TriggerOperation triggerOperation;
    
    public TriggerHandler(){
        this.newRecords = Trigger.New;
        this.oldMap = Trigger.oldMap;
        this.newMap = Trigger.newMap;
        this.triggerOperation = Trigger.OperationType;
    }
    public abstract List<SObject> filterRecords(); // Filter the Records
    public abstract void execute(List<SObject> records); // Main Business Logic
    
    public virtual Boolean hasFieldChanged(String fieldName) {
        if(oldMap == null) return true; // Insert operation
        
        for(SObject newRecord : newRecords) {
            SObject oldRecord = oldMap.get(newRecord.Id);
            if(newRecord.get(fieldName) != oldRecord.get(fieldName)) {
                return true;
            }
        }
        return false;
    }
    
    public virtual List<SObject> getChangedRecords(String fieldName) {
        List<SObject> changedRecords = new List<SObject>();
        
        if(oldMap == null) return newRecords; // Insert operation
        
        for(SObject newRecord : newRecords) {
            SObject oldRecord = oldMap.get(newRecord.Id);
            if(newRecord.get(fieldName) != oldRecord.get(fieldName)) {
                changedRecords.add(newRecord);
            }
        }
        return changedRecords;
    }
}