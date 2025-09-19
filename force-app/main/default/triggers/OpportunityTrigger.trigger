trigger OpportunityTrigger on Opportunity (before insert) {

    Set<Id> accountIdsSet = new Set<Id>();
    for(Opportunity opp: Trigger.New){
        if(opp.AccountId <> null){
            accountIdsSet.add(opp.AccountId);
        }
    }
    /** Map 
    List<Account> accountList = [SELECT Id, Name, Description 
                                 FROM 
                                 	Account 
                                 WHERE Id IN : accountIdsSet
                                ]; // ABC, XYZ**/
    // Map<Id, Account> idToAccountMap = new Map<Id, Account>();
    // .put(key, value); // AccountId, Account Record
    // Everytime you want the Id of object as the key of a Map same as the record Id of the object the SOQL is on
    // MAP based SQOL Query - Recommend
    Map<Id, Account> idToAccountMap = new Map<Id, Account>(
        [ SELECT Id, Name, Description 
             FROM 
                Account 
             WHERE 
                Id IN : accountIdsSet
        ]
    );
    /*
     * keySet() -> Set of recordIds 
     * values() -> List of Values . List<sObject>
     */
    /* 
    for(Account acc: accountList){
        idToAccountMap.put(acc.Id, acc);
    }
    */
    /*
     * Opportunity - AccountId (Hold the account record Id)
     * Account - Id (Hold the account record Id)
     * Map<Id, Account>
     */ 
    for(Opportunity opp: Trigger.New){ // Salesforce.com --> ABC, Google.com --> XYZ
        if(opp.Amount != null && opp.Discount_Percent__c != null){
            Decimal discountAmount = (opp.Amount * opp.Discount_Percent__c)/100;
            Decimal discountedAmount = opp.Amount - discountAmount;
            opp.Amount_After_Discount__c  = discountedAmount;
        }
        if(opp.AccountId <> null){ // ABC
            Account accountRecord = idToAccountMap.get(opp.AccountId);
            opp.Description = accountRecord?.Description;
            /* for(Account acc: accountList){ // XYZ, ABC
                if(acc.Id == opp.AccountId){ // Matching Criteria & Linking Key
                    opp.Description = acc.Description; // Not Work
                }
            } */
        }
    }
}