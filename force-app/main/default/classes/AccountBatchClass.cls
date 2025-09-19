public class AccountBatchClass implements Database.Batchable<sObject>, Database.Stateful {

    public Integer totalRecords = 0;
    public Integer failedRecords = 0;
    public Integer successRecords = 0;
    
    public Database.QueryLocator start(Database.BatchableContext batchContext){
        String query = 'SELECT Id, Name, Active__c FROM Account';
        //return Database.getQueryLocator(query);
        return Database.getQueryLocator([SELECT Id, Name, Active__c, Phone FROM Account WHERE Active__c = 'Yes']); // 50M
    }
    
    public void execute(Database.BatchableContext batchContext, List<Account> scope){
        Id childJobId = batchContext.getChildJobId();
        Id jobId = batchContext.getJobId();
        System.debug('Job Id '+ jobId+' Child Job Id '+childJobId);
        totalRecords += scope.size();
        for(Account acc: scope){
            acc.Description = 'Updated from the batch apex';
            acc.Fax = acc.Phone;
            //totalRecords = totalRecords + 1;
            // totalRecords++;
        }
        //update scope;
        List<Database.SaveResult> saveResults = Database.update(scope, false);
        for(Database.SaveResult sr: saveResults){
            if(sr.isSuccess()){
                successRecords++;
            }else{
                failedRecords++;
            }
        }
    }
    
    public void finish(Database.BatchableContext batchContext){
        Id jobId = batchContext.getJobId();
        System.debug('Job Id in finish Method '+ jobId);
        System.debug('totalRecords '+ totalRecords);
        System.debug('failedRecords '+ failedRecords);
        System.debug('successRecords '+ successRecords);
        
        List<Messaging.SingleEmailMessage> emails = new List<Messaging.SingleEmailMessage>();
        
        String completionMessage = 
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
        '                        🎯 BATCH PROCESSING COMPLETED                        \n' +
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
        '📋 Batch Class: AccountBatchClass\n' +
        '📅 Completion Date: ' + System.today().format() + '\n\n' +
        '📊 PROCESSING SUMMARY:\n' +
        '   ├─ 📈 Total Records Processed: ' + totalRecords + '\n' +
        '   ├─ ✅ Successfully Processed: ' + successRecords + '\n' +
        '   └─ ❌ Failed Records: ' + failedRecords + '\n\n';
        
        // Add success rate calculation
        if (totalRecords > 0) {
            Decimal successRate = (successRecords * 100.0) / totalRecords;
            completionMessage += '📈 Success Rate: ' + successRate.setScale(2) + '%\n\n';
        }
        
        // Add status indicator
        if (failedRecords == 0) {
            completionMessage += '🎉 STATUS: ALL RECORDS PROCESSED SUCCESSFULLY!\n\n';
        } else if (failedRecords > 0 && successRecords > 0) {
            completionMessage += '⚠️  STATUS: COMPLETED WITH SOME FAILURES\n\n';
        } else {
            completionMessage += '🚨 STATUS: PROCESSING FAILED - PLEASE REVIEW\n\n';
        }
        
        completionMessage += 
            '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
            '                              Thanks & Regards,                              \n' +
            '                               Team PantherSchools                           \n' +
            '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
        
        String htmlFormattedMessage = 
        '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa;">' +
            '<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">' +
                '<h2 style="margin: 0; font-size: 24px;">🎯 Batch Processing Completed</h2>' +
            '</div>' +
            '<div style="padding: 30px; background-color: white; margin: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">' +
                '<h3 style="color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px;">Processing Summary</h3>' +
                '<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">' +
                    '<tr style="background-color: #f8f9fa;">' +
                        '<td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold;">Batch Class:</td>' +
                        '<td style="padding: 12px; border: 1px solid #dee2e6;">AccountBatchClass</td>' +
                    '</tr>' +
                    '<tr>' +
                        '<td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold;">Completion Date:</td>' +
                        '<td style="padding: 12px; border: 1px solid #dee2e6;">' + System.today().format() + '</td>' +
                    '</tr>' +
                    '<tr style="background-color: #f8f9fa;">' +
                        '<td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold;">📈 Total Records:</td>' +
                        '<td style="padding: 12px; border: 1px solid #dee2e6; font-size: 18px; font-weight: bold;">' + totalRecords + '</td>' +
                    '</tr>' +
                    '<tr>' +
                        '<td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold; color: #28a745;">✅ Successful:</td>' +
                        '<td style="padding: 12px; border: 1px solid #dee2e6; font-size: 18px; font-weight: bold; color: #28a745;">' + successRecords + '</td>' +
                    '</tr>' +
                    '<tr style="background-color: #f8f9fa;">' +
                        '<td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold; color: #dc3545;">❌ Failed:</td>' +
                        '<td style="padding: 12px; border: 1px solid #dee2e6; font-size: 18px; font-weight: bold; color: #dc3545;">' + failedRecords + '</td>' +
                    '</tr>' +
                '</table>' +
            '</div>' +
            '<div style="text-align: center; padding: 20px; background-color: #667eea; color: white; margin: 20px; border-radius: 8px;">' +
                '<p style="margin: 0; font-size: 16px;">Thanks & Regards,<br><strong>Team PantherSchools</strong></p>' +
            '</div>' +
        '</div>';
        
        Messaging.SingleEmailMessage email = new Messaging.SingleEmailMessage();
        // to emails, cc, bcc
        // subject
        // body - plain text, html
        List<String> toEmails = new List<String>();
        toEmails.add('documents.pantherschools@gmail.com');
        
        email.setSubject('AccountBatchClass is completed '+System.today());
        /* email.setPlainTextBody('AccountBatchClass is completed '+System.today()+' totalRecords '
                               + totalRecords+' failedRecords '
                               + failedRecords+' successRecords '+ successRecords
                               +'Thanks & Regards, Team PantherSchools'
                              ); */
        email.setPlainTextBody(completionMessage);
        //email.setHTMLBody(htmlFormattedMessage);
        email.setToAddresses(toEmails);
        
        emails.add(email);
        
        List<Messaging.SendEmailResult> results = Messaging.sendEmail(emails, false);
        
    }
}