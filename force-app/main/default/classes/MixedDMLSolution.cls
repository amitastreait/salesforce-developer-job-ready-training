public class MixedDMLSolution {

    public static void createAccountAndUser() { 
        // Insert non-setup object in current transaction
        Account testAccount = new Account(
            Name = 'Test Account for Flow Invoker',
            Type = 'Prospect',
            Industry = 'Technology',
            Phone = '98765432',
            Fax = '98765432',
            Website = 'www.pantherschools.com',
            Rating = 'Hot'
        );
        insert testAccount;
        
        // Insert setup object in future transaction
        UserCreationHelper.createUser();
    }
}