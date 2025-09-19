public class UserCreationHelper {

    @future
    public static void createUser() {
        Profile p = [SELECT Id FROM Profile WHERE Name='Standard Platform User']; // Chatter Free User
        UserRole r = [SELECT Id FROM UserRole WHERE Name='CEO'];
        User usr = new User(
            alias = 'test', 
            email='test@example.com',
            emailencodingkey='UTF-8', 
            lastname='TestUser', 
            languagelocalekey='en_US', 
            localesidkey='en_US', 
            profileid = p.Id, 
            userroleid = r.Id, 
            timezonesidkey='America/Los_Angeles', 
            username='test@example.com.panther1'
        );
        insert usr; // Now executes in separate transaction
        /** - Update DML
         	UserRoleId
            IsActive
            ForecastEnabled
            IsPortalEnabled
            Username
            ProfileId
         */  
    }
}