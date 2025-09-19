@IsTest
public class AccountBatchClassTest {

    @IsTest
    static void batchTest(){
        List<Account> accountList = new List<Account>();
        for(Integer i=0; i < 350; i++){
            Account acc = new Account(
                Name = 'Salesforce.com '+i,
                Industry = 'Education',
                Description = 'This is a test accoun '+i,
                Phone = '9874563210',
                Fax = '9874563210',
                WebSite = 'www.pantherschools.com',
                Rating = 'High',
                Active__c = 'Yes'
            );
            accountList.add(acc);
        }
        insert accountList;
        Test.startTest();
        Id jobId = Database.executeBatch(new AccountBatchClass(), 400);
        // Id jobId = System.enqueueJob(new EmailQueueable() );
        Test.stopTest();
    }
}