trigger AccountTrigger on Account (before insert, after insert) {
    
    List<Account> newAccountList = Trigger.New;
    
    switch on Trigger.operationType {
        WHEN BEFORE_INSERT {
            for(Account acc: newAccountList){
                acc.Name = acc.Name.toUpperCase(); 
                acc.Description = acc.Description?.toUpperCase(); // ?.
                if(String.isBlank(acc.Phone)){
                    acc.Phone.addError('The account Phone can not be blank. Please populate the value', false);
                }
                if(String.isBlank(acc.Fax)){
                    acc.Fax.addError('The account Fax can not be blank. Please populate the value', false);
                }
                if(String.isBlank(acc.Website)){
                    acc.Website.addError('The account Website can not be blank. Please populate the value', false);
                }
                if(String.isBlank(acc.Rating)){
                    acc.Rating.addError('The account Rating can not be blank. Please populate the value', false);
                }
            }
        } WHEN AFTER_INSERT {
            List<Task> tasksTobeCreated = new List<Task>();
            for(Account acc: newAccountList){
                /** Prepare the Task Record **/
                Task taskRecord = new Task();
                taskRecord.Subject = 'The task is created from apex trigger '+acc.Name;
                taskRecord.Description = 'The task is created from apex trigger '+acc.Name;
                taskRecord.ActivityDate = System.today().addDays(7); // Today + 7
                taskRecord.Status = 'Not Started';
                taskRecord.Priority = 'High';
                taskRecord.WhatId = acc.Id; // null, ''
                taskRecord.ownerId = acc.OwnerId;
                tasksTobeCreated.add(taskRecord);
            }
            insert tasksTobeCreated;
        } WHEN ELSE {
            System.debug('No Event is implemented!');
        }
    }
}