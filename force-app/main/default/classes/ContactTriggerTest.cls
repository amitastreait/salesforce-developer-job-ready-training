@IsTest
public class ContactTriggerTest {

    @TestSetup
    private static void setupMethod(){
        Account accountRecord = new Account(
            Name = 'Salesforce.com', 
            Rating = 'High', 
            Website = 'www.salesforce.com', 
            Phone = '9874563210', 
            Fax ='9874563210', 
            Industry = 'Technology'
        );
        insert accountRecord;
    }
    
    @IsTest
    private static void afterInsertTest(){
        // insert statement
        Account accountRecord = [SELECT Id, Name FROM Account 
                       WHERE Name = 'Salesforce.com' 
                       AND Rating = 'High' 
                       AND Industry ='Technology' LIMIT 1];
        Contact con = new Contact(
        	FirstName = 'Jane',
            LastName = 'Smith',
            Email = 'jane.smith@gmail.com',
            Phone = '9874563210',
            AccountId = accountRecord.Id
        );
        Test.startTest();
        insert con;
        Test.stopTest();
        Account updateAccountRecord = [SELECT Id, Name, Total_no_of_Contacts__c FROM Account 
                       WHERE Name = 'Salesforce.com' AND Rating = 'High' AND Industry ='Technology' LIMIT 1];
        // Assert Methods
        // Assert.areEqual(1,1);
        Assert.areEqual(1, updateAccountRecord.Total_no_of_Contacts__c, 'The Account should have exactly one contact record!');
    }
    
    @IsTest
    private static void afterUpdateTest(){
        Account accountRecord = [SELECT Id, Name FROM Account 
                       WHERE Name = 'Salesforce.com' 
                       AND Rating = 'High' 
                       AND Industry ='Technology' LIMIT 1];
        Contact con = new Contact(
        	FirstName = 'Jane',
            LastName = 'Smith',
            Email = 'jane.smith@gmail.com',
            Phone = '9874563210',
            AccountId = accountRecord.Id
        );
        insert con;
        
        Account newAccount = new Account(
            Name = 'PantherSchools.com', 
            Rating = 'Low', 
            Website = 'www.PantherSchools.com', 
            Phone = '9874563210', 
            Fax ='9874563210', 
            Industry = 'Education'
        );
        insert newAccount;
        con.AccountId = newAccount.Id;
        Test.startTest();
        update con;
        Test.stopTest();
        
        Account updateAccountRecord = [SELECT Id, Name, Total_no_of_Contacts__c FROM Account 
                       WHERE Name = 'Salesforce.com' AND Rating = 'High' AND Industry ='Technology' LIMIT 1];
        Assert.areEqual(01, updateAccountRecord.Total_no_of_Contacts__c, 'The Account should not have any contact record!');
        
        Account updateRecord = [SELECT Id, Name, Total_no_of_Contacts__c FROM Account 
                       WHERE Name = 'PantherSchools.com' AND Rating = 'Low' AND Industry ='Education' LIMIT 1];
        Assert.areEqual(1, updateRecord.Total_no_of_Contacts__c, 'The Account should have exactly one contact record!');
    }
    
    @IsTest
    private static void afterDeleteTest(){
        Account accountRecord = [SELECT Id, Name FROM Account 
                       WHERE Name = 'Salesforce.com' 
                       AND Rating = 'High' 
                       AND Industry ='Technology' LIMIT 1];
        Contact con = new Contact(
        	FirstName = 'Jane',
            LastName = 'Smith',
            Email = 'jane.smith@gmail.com',
            Phone = '9874563210',
            AccountId = accountRecord.Id
        );
        Contact con1 = new Contact(
        	FirstName = 'John',
            LastName = 'ABC',
            Email = 'john.doe@gmail.com',
            Phone = '4568975631',
            AccountId = accountRecord.Id
        );
        insert new List<Contact>{con, con1};
        Account updateRecord = [SELECT Id, Name, Total_no_of_Contacts__c FROM Account 
                       WHERE Name = 'Salesforce.com' AND Rating = 'High' AND Industry ='Technology' LIMIT 1];
        Assert.areEqual(2, updateRecord.Total_no_of_Contacts__c, 'The Account should have exactly 2 contact record!');
        
        Test.startTest();
        delete con;
        Test.stopTest();
        
        Account updateAccountRecord = [SELECT Id, Name, Total_no_of_Contacts__c FROM Account 
                       WHERE Name = 'Salesforce.com' AND Rating = 'High' AND Industry ='Technology' LIMIT 1];
        Assert.areEqual(1, updateAccountRecord.Total_no_of_Contacts__c, 'The Account should not have any contact record!');
    }
}