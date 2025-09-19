public class DML {

    // DML.SaveResult
    public class SaveResult {
        public String getId(){
            return null;
        }
    }
    public class Error {
        public String getStatus(){
            return null;
        }
    }
    public static void doInsert(String name, String description, String rating, Decimal annualRevenue, String recordTypeName){
        // CRUD - Create, Read (SOQL), Update, Delete
        /** Create **/
        /** Transaction **/
        /**
         * Initial Operation - Create [STARTED]
         * 	Trigger on account Object [Trigger Executed]
         * 		Flow Executed
         * 	Helper Class executed
         * 		Method of Parent Class
         * Governor Limit SOQL - 100 in a single transction
         * 	Too many DML statements: 151 ( 150 )
         * Too many DML rows: 10001 (10K)
         */ 
        /** Step1: - You get the record type Id **/
        List<Account> accountList = new List<Account>();
        RecordType recordType = [SELECT Id, Name, SobjectType, DeveloperName 
                                 FROM 
                                 	RecordType 
                                 WHERE 
                                 	DeveloperName =: recordTypeName  AND 
                                 	SobjectType = 'Account'
                                 LIMIT 1];
        for(Integer i=0; i<=100; i++){ // 151
            Account accountRecord = new Account();
            accountRecord.Name = name+ ' '+i;
            accountRecord.SLA__c = 'Silver';
            accountRecord.SLAExpirationDate__c = System.Today().addDays(30); // Current Date, Today + 30
            // System.now() --> Current Date Time along with TimeZone
            accountRecord.SLASerialNumber__c = '7889734';
            accountRecord.Description = description;
            accountRecord.Rating = rating;
            accountRecord.Industry = 'Technology';
            accountRecord.AnnualRevenue = annualRevenue;
            
            /** Step2 - Associate the record with RecordType **/
            accountRecord.RecordTypeId = recordType.Id;
            accountList.add(accountRecord);
        }
        insert accountList; // 9000 records
        // insert 1001 > 10000
    }
    public static void doDelete(List<Account> accList){
        delete accList;
    }
    public static void doUpdate(){
        List<Account> accountList = [SELECT Id, Name, RecordTypeId, RecordType.Name 
                                     FROM Account WHERE CreatedDate = TODAY];
        for(Account acc: accountList){
            acc.Name = acc.Name +' Updated ';
        }
        update accountList; // All or None
    }
}