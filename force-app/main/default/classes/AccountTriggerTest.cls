@IsTest
public class AccountTriggerTest {
	/**
	 * Which Object - Account
	 * Which Event - before insert, after insert
	 * Are there any SOQL on related object ? 
	 */
    @IsTest
    private static void beforeInsertTest(){
        Account acc = new Account(
        	Name = 'Salesforce.com',
            Industry = 'Education',
            Description = 'This is a test accoun'
        );
        try{
            insert acc;
        }catch(System.Exception ex){
            System.debug(ex.getMessage());
            System.debug(ex.getStackTraceString());
        }
    }
    
    @IsTest
    private static void afterInsertTest(){
        Account acc = new Account(
        	Name = 'Salesforce.com',
            Industry = 'Education',
            Description = 'This is a test accoun',
            Phone = '9874563210',
            Fax = '9874563210',
            WebSite = 'www.pantherschools.com',
            Rating = 'High'
        );
        // 10 - DML Statement ( 150 )
        // 5 - SOQL - (100)
        try{
            Test.startTest(); 
            	insert acc; // Reset the Governor Limits
            Test.stopTest();
        }catch(System.Exception ex){
            System.debug(ex.getMessage());
            System.debug(ex.getStackTraceString());
        }
    }
}