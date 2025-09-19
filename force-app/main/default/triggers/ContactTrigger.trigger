trigger ContactTrigger on Contact (after insert, after delete, after undelete, after update) {

    switch on Trigger.operationType {
        
        WHEN AFTER_INSERT, AFTER_UNDELETE {
            /** Count the total no of contacts under the account */
            // count, sum, min, max, avg --> Aggregate Query
            Set<Id> accountIdsSet = new Set<Id>();
            for(Contact con: Trigger.New){
                if(con.AccountId <> null){
                    accountIdsSet.add(con.AccountId);
                }
            }
            List<AggregateResult> aggregateResults = [SELECT count(Id), count(Email), AccountId FROM Contact WHERE AccountId IN: accountIdsSet GROUP BY AccountId];
            // SELECT count(Id) totalContact, count(Email) totalContactWithEmail, AccountId parentRecordId FROM Contact GROUP BY AccountId
            // Each Row will represent a separate Account 
            // Each row will give you total contact under the account
            
            List<Account> accountListToUpdate = new List<Account>();
            for(AggregateResult ar: aggregateResults){
                Integer totalCount = (Integer)ar.get('expr0'); // Object --> get()
                Integer totalContactsWithEmail = (Integer)ar.get('expr1');
                Id accountId = (Id)ar.get('AccountId');
                accountListToUpdate.add(
                	new Account(
                    	Id = accountId,
                        Total_no_of_Contacts__c = totalCount
                    )
                );
                /*
                 *  Integer totalCount = (Integer)ar.get('totalContact'); // Object --> get()
                    Integer totalContactsWithEmail = (Integer)ar.get('totalContactWithEmail');
                    Id accountId = (Id)ar.get('parentRecordId');
                 * 
                 */ 
            }
            update accountListToUpdate;
        }
        WHEN AFTER_UPDATE {
            /**
				Account can be changed on the Contact Record
					From one account to another account	
					From one account to blank account
			**/
            Set<Id> accountIdsSet = new Set<Id>();
            for(Contact newContact: Trigger.New){
                // Trigger.newMap, Trigger.oldMap
                // Trigger.old, Trigger.oldMap
                Map<Id, Account> idToAccountMap = new Map<Id, Account>();
                Contact oldContact = Trigger.oldMap.get(newContact.Id);
                if(oldContact.AccountId <> newContact.AccountId){
                    if(oldContact.AccountId != null){
                        accountIdsSet.add(oldContact.AccountId); // Decrease number
                    }
                    if(newContact.AccountId != null){
                        accountIdsSet.add(newContact.AccountId);  // Increase number
                    }
                }
                
            }
            System.debug(accountIdsSet);
            List<AggregateResult> aggregateResults = [SELECT count(Id), count(Email), AccountId FROM Contact WHERE AccountId IN: accountIdsSet GROUP BY AccountId];
            List<Account> accountListToUpdate = new List<Account>();
            for(AggregateResult ar: aggregateResults){
                Integer totalCount = (Integer)ar.get('expr0'); // Object --> get()
                Integer totalContactsWithEmail = (Integer)ar.get('expr1');
                Id accountId = (Id)ar.get('AccountId');
                accountListToUpdate.add(
                	new Account(
                    	Id = accountId,
                        Total_no_of_Contacts__c = totalCount
                    )
                );
            }
            update accountListToUpdate;
        }
        WHEN AFTER_DELETE {
            Map<Id, Account> idToAccountMap = new Map<Id, Account>();
            // SOQL Query
            // DML Here
            for(Contact con: Trigger.Old){
                if(con.AccountId != null){
                    idToAccountMap.put(con.AccountId, 
                                       new Account(Id = con.AccountId, Total_no_of_Contacts__c = 0 ) 
                                      ); // Put a blank Account
                }
            }
            ContactTriggerHelper.countContact(idToAccountMap);
        }
    }
}