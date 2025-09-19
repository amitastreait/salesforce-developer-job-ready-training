public class LeadTriggerHandler {
    
    public static void handlerAfterInsert(List<Lead> newLeadRecords, Map<Id, Lead> mewLeadMap){
        
    }

    public static void checkDuplicateBasedOnCompanyANDEmail(List<Lead> newLeadRecords){
        /* Prevent Duplicate lead record based on the Lead Email & Company */
        Set<String> newCompanyNameSet = new Set<String>();
        Set<String> newEmailSet = new Set<String>();
        // Trigger.New ~= List<SObject> ~= List<Lead>
        for(Lead newLead : newLeadRecords){
            if(!String.isBlank(newLead.Company)){
                newCompanyNameSet.add(newLead.Company);
            }
            if(!String.isBlank(newLead.Email)){
                newEmailSet.add(newLead.Email);
            }
        }
        if(newCompanyNameSet.isEmpty() && newEmailSet.isEmpty()){
            return;
        }
        /** Query the Existing Lead based on the Lead Company & Email */
        /* List<Lead> existingLeadRecords = [SELECT 
                                            Id, Name, Email, Company 
                                          FROM 
                                            Lead  
                                          WHERE Company IN: newCompanyNameSet AND
                                          Email IN: newEmailSet
                                         ];
        */
        Map<String, Lead> existingLeadMap = new Map<String, Lead>();
        for(Lead existingLead: [SELECT Id, Name, Email, Company FROM Lead
                                    WHERE 
                                    Company IN: newCompanyNameSet AND 
                                    Email IN: newEmailSet AND
                                    ID NOT IN : Trigger.New
                                    ALL ROWS
                                ]){
            String key = existingLead.Email +'-'+ existingLead.Company; 
            existingLeadMap.put(key, existingLead);                                
        }
        System.debug(' existingLeadMap '+ existingLeadMap);
        for(Lead newLead : newLeadRecords){ // Records are which getting inserted
            String existingLeadKey = newLead.Email +'-'+ newLead.Company;
            Lead existingLead = existingLeadMap.get(existingLeadKey);
            // Why you have not used containsKey() --> True
            // 	It iterates for the whole map - Performance
            /*
             * Lead 1 - 
             * existingLead = null
             * existingLead != null ~= false
             * Lead 2 - 
             * existingLead = some value
             * existingLead != null ~= true
             */ 
            /***
                // This will be blocked - duplicate of existing lead
                Lead duplicate = new Lead(
                    LastName = 'DOE',                    // Same (case-insensitive)
                    Email = 'JOHN.DOE@EXAMPLE.COM',      // Same (case-insensitive)
                    Phone = '+1 (555) 123-4567',         // Same digits
                    Company = 'New Company'
                );
                
                // This will work - unique combination  
                Lead unique = new Lead(
                    LastName = 'Smith',                  // Different
                    Email = 'JOHN.DOE@EXAMPLE.COM',    // Different
                    Phone = '555-999-8888',              // Different
                    Company = 'New Company'
                );
             */ 
            if(existingLead != null){
                String message = 'Duplicate Lead detected. A Lead with the same Email (' + 
                                       existingLead.Email + '), and Company name (' + existingLead.Company + 
                                       ') already exists. Existing Lead: ' + existingLead.Name + 
                                       ' (ID: ' + existingLead.Id ?? 'Existing Record in Same data set' + ')';
                newLead.Email.addError(message);
                newLead.Company.addError(message);
            } else {
                existingLeadMap.put(existingLeadKey, newLead);
            }
            /** 
            for(Lead existingLead: existingLeadRecords){ // Existing lead Records
                //Check for the duplicate 
                if(newLead.Email == existingLead.Email && newLead.Company == existingLead.Company){
                    newLead.Email.addError('Duplicate Lead detected. A Lead with the same Email (' + 
                                     existingLead.Email + '), and Company name (' + existingLead.Company + 
                                     ') already exists. Existing Lead: ' + existingLead.Name + 
                                     ' (ID: ' + existingLead.Id + ')');
                    newLead.Company.addError('Duplicate Lead detected. A Lead with the same Email (' + 
                                     existingLead.Email + '), and Company name (' + existingLead.Company + 
                                     ') already exists. Existing Lead: ' + existingLead.Name + 
                                     ' (ID: ' + existingLead.Id + ')');
                }
            }**/
        }
    }
}