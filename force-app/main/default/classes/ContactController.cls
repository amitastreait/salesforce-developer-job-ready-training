public with sharing class ContactController {
    
    // Apex methods that are to be cached must be marked as @AuraEnabled(cacheable=true)
    @AuraEnabled(cacheable=true)
    public static List<Contact> getAllContacts(){
        List<Contact> contactList = [SELECT Id, Name, Email, Phone, Title, Account.Name FROM Contact WHERE Email <> null LIMIT 10];
        Contact newConact = new Contact(
            FirstName = 'Amit',
            LastName = 'Singh',
            Email = 'asigh@gmail.com',
            Title = 'Salesforce Architect'
        );
        // insert newConact;
        return contactList;
    }

    @AuraEnabled(cacheable=true)
    public static List<Contact> getContactsByAccountId(Id accountId, String accountName){
        List<Contact> contactList = [SELECT Id, Name, Email, Phone, Title, Account.Name 
            FROM Contact
            WHERE 
                AccountId =: accountId
            LIMIT 10
        ];
        return contactList;
    }

    @AuraEnabled
    public static void createContact(Id accountId, String firstName, String lastName, String email, String title){

    }
}