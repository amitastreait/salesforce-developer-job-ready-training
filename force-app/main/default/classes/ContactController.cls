public with sharing class ContactController {
    
    // Apex methods that are to be cached must be marked as @AuraEnabled(cacheable=true)
    @AuraEnabled(cacheable=true)
    public static List<Contact> getAllContacts(){
        List<Contact> contactList = [SELECT Id, Name, Email, Phone, Title, Account.Name, CreatedDate, Account.AnnualRevenue, Account.CurrencyIsoCode FROM Contact WHERE Email <> null LIMIT 10];
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
    public static Contact createContact(String firstName, String lastName, String email, String phone, String title, String accountId){
        Contact newContact = new Contact(
            FirstName = firstName,
            LastName = lastName,
            Email = email,
            Phone = phone,
            Title = title,
            AccountId = accountId
        );
        insert newContact;
        return newContact;
    }
}