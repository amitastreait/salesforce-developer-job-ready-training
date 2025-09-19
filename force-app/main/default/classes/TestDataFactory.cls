@IsTest
public class TestDataFactory {
    
    // Counter for unique names
    private static Integer counter = 1;
    
    // Default values constants
    private static final String DEFAULT_INDUSTRY = 'Technology';
    private static final String DEFAULT_STAGE = 'Prospecting';
    private static final Decimal DEFAULT_AMOUNT = 50000;
    
    public static Course__c createCourse(String courseName, Decimal Price, Boolean doInsert){
        Course__c course = new Course__c(
            Name = courseName,
            StartDate__c = System.today(),
            EndDate__c = System.today().addDays(83),
            Price__c = Price
        );
        if(doInsert){
            insert course;
        }
        return course;
    }
    
    /**
     * Creates a single Account with specified parameters
     */
    public static Account createAccount(String name, String industry, Boolean doInsert) {
        Account acc = new Account(
            Name = name,
            Industry = industry != null ? industry : DEFAULT_INDUSTRY,
            AnnualRevenue = 1000000,
            BillingStreet = counter + ' Test Street',
            BillingCity = 'Test City',
            BillingState = 'CA',
            BillingPostalCode = '9410' + String.valueOf(counter).leftPad(1, '0'),
            BillingCountry = 'USA',
            Phone = '(555) 123-' + String.valueOf(1000 + counter),
            Website = 'www.' + name.replace(' ', '').toLowerCase() + '.com'
        );
        
        counter++;
        
        if (doInsert) {
            insert acc;
        }
        
        return acc;
    }
    
    /**
     * Creates multiple accounts with different industries
     */
    public static List<Account> createAccounts(Integer count, Boolean doInsert) {
        List<Account> accounts = new List<Account>();
        List<String> industries = new List<String>{'Technology', 'Healthcare', 'Finance', 'Manufacturing'};
        
        for (Integer i = 0; i < count; i++) {
            String industry = industries[Math.mod(i, industries.size())];
            accounts.add(createAccount('Test Account ' + (counter + i), industry, false));
        }
        
        if (doInsert) {
            insert accounts;
        }
        
        return accounts;
    }
    
    /**
     * Creates contacts for specified accounts
     */
    public static List<Contact> createContacts(List<Account> accounts, Integer contactsPerAccount, Boolean doInsert) {
        List<Contact> contacts = new List<Contact>();
        List<String> titles = new List<String>{'CEO', 'CTO', 'VP Sales', 'Director', 'Manager'};
        
        for (Account acc : accounts) {
            for (Integer i = 0; i < contactsPerAccount; i++) {
                contacts.add(new Contact(
                    FirstName = 'Test',
                    LastName = 'Contact ' + counter,
                    AccountId = acc.Id,
                    Email = 'testcontact' + counter + '@' + acc.Name.replace(' ', '').toLowerCase() + '.com',
                    Phone = '(555) 987-' + String.valueOf(6000 + counter),
                    Title = titles[Math.mod(i, titles.size())],
                    LeadSource = 'Web'
                ));
                counter++;
            }
        }
        
        if (doInsert) {
            insert contacts;
        }
        
        return contacts;
    }
    
    /**
     * Creates opportunities for accounts
     */
    public static List<Opportunity> createOpportunities(List<Account> accounts, Integer oppsPerAccount, Boolean doInsert) {
        List<Opportunity> opportunities = new List<Opportunity>();
        List<String> stages = new List<String>{'Prospecting', 'Qualification', 'Needs Analysis', 'Value Proposition'};
        
        for (Account acc : accounts) {
            for (Integer i = 0; i < oppsPerAccount; i++) {
                opportunities.add(new Opportunity(
                    Name = acc.Name + ' - Opportunity ' + counter,
                    AccountId = acc.Id,
                    StageName = stages[Math.mod(i, stages.size())],
                    CloseDate = Date.today().addDays(30 + (i * 15)),
                    Amount = DEFAULT_AMOUNT + (i * 10000),
                    Probability = 10 + (i * 20),
                    LeadSource = 'Web',
                    Type = 'New Customer'
                ));
                counter++;
            }
        }
        
        if (doInsert) {
            insert opportunities;
        }
        
        return opportunities;
    }
    
    /**
     * Creates a User with specified profile
     */
    public static User createUser(String profileName, String firstName, String lastName, Boolean doInsert) {
        Profile prof = [SELECT Id FROM Profile WHERE Name = :profileName LIMIT 1];
        String uniqueName = UniqueUsernameGenerator.generateUniqueUsername(firstName, lastName);
        
        User testUser = new User(
            FirstName = firstName,
            LastName = lastName,
            Email = uniqueName,
            Username = uniqueName,
            Alias = (firstName.substring(0,1) + lastName.substring(0,1) + counter).substring(0,8),
            TimeZoneSidKey = 'America/New_York',
            LocaleSidKey = 'en_US',
            EmailEncodingKey = 'UTF-8',
            LanguageLocaleKey = 'en_US',
            ProfileId = prof.Id,
            IsActive = true
        );
        
        counter++;
        
        if (doInsert) {
            insert testUser;
        }
        
        return testUser;
    }
    
    /**
     * Creates test data with specific record type
     */
    public static Account createAccountWithRecordType(String recordTypeName, String accountName, Boolean doInsert) {
        Id recordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get(recordTypeName).getRecordTypeId();
        
        Account acc = new Account(
            Name = accountName,
            RecordTypeId = recordTypeId,
            Industry = DEFAULT_INDUSTRY,
            AnnualRevenue = 1000000
        );
        
        if (doInsert) {
            insert acc;
        }
        
        return acc;
    }
    
    /**
     * Helper method to reset counter for predictable test data
     */
    public static void resetCounter() {
        counter = 1;
    }
    
    /**
     * Creates test data with sharing settings
     */
    public static void setupAccountSharing(Account acc, User userToShareWith, String accessLevel) {
        AccountShare accShare = new AccountShare(
            AccountId = acc.Id,
            UserOrGroupId = userToShareWith.Id,
            AccountAccessLevel = accessLevel, // 'Read', 'Edit', etc.
            OpportunityAccessLevel = 'Read'
        );
        
        insert accShare;
    }
}