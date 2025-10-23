global class LinkedInAuthHandler implements Auth.RegistrationHandler{

    // Static flag to track if this is a new user creation
    private static Boolean isNewUser = false;

    global boolean canCreateUser(Auth.UserData data) {
        return true;
    }

    global User createUser(Id portalId, Auth.UserData data){
        isNewUser = true;
        if(!canCreateUser(data)) {
            return null;
        }
        User u = new User();
        Id userId;
        System.debug(JSON.serializePretty(data));
        if(data.attributeMap.containsKey('sfdc_networkid')) {
            
            Account a = [SELECT Id, Name FROM Account WHERE Name = 'Reality Force'];
            Contact c = new Contact();
            c.accountId = a.Id;
            c.email = data.email;
            c.firstName = data.firstName;
            c.lastName = data.lastName;
            insert(c);

            Profile p = [SELECT Id, Name FROM Profile WHERE Name = 'Customer Community Plus User'];
            u.username = data.email.substringBefore('@') + '@realityforce.com.customer';
            u.email = data.email;
            u.lastName = data.lastName;
            u.firstName = data.firstName;
            String alias = data.email.substringBefore('@');
            if(alias.length() > 8) {
                alias = alias.substring(0, 8);
            }
            u.alias = alias;
            u.languagelocalekey = UserInfo.getLocale();
            u.localesidkey = UserInfo.getLocale();
            u.emailEncodingKey = 'UTF-8';
            u.timeZoneSidKey = 'America/Los_Angeles';
            u.profileId = p.Id;
            u.contactId = c.Id;
            userId = u.Id;
        } else {
            Profile p = [SELECT Id FROM Profile WHERE Name = 'Standard User'];
            
            u.username = data.email.substringBefore('@') + '@myorg.com';
            u.email = data.email;
            u.lastName = data.lastName;
            u.firstName = data.firstName;
            String alias = data.email.substringBefore('@');
            if(alias.length() > 8) {
                alias = alias.substring(0, 8);
            }
            u.alias = alias;
            u.languagelocalekey = UserInfo.getLocale();
            u.localesidkey = UserInfo.getLocale();
            u.emailEncodingKey = 'UTF-8';
            u.timeZoneSidKey = 'America/Los_Angeles';
            u.profileId = p.Id;
            userId = u.Id;
        }
        
        if (isNewUser) {
            enqueuePermissionSetAssignment(userId);
            isNewUser = false; // Reset flag
        }

        return u;
    }
    
    global void updateUser(Id userId, Id portalId, Auth.UserData data){
        User u = new User(id=userId);
        u.email = data.email;
        u.lastName = data.lastName;
        u.firstName = data.firstName;
        String alias = data.username;
        if(alias.length() > 8) {
            alias = alias.substring(0, 8);
        }
        u.alias = alias;
        update(u);

        if (isNewUser) {
            enqueuePermissionSetAssignment(userId);
            isNewUser = false; // Reset flag
        }
    }

    /**
     * Enqueue permission set assignment in a queueable context
     * This is called after user creation to assign the required permission set
     * @param userId The ID of the newly created user
     */
    private static void enqueuePermissionSetAssignment(Id userId) {
        try {
            System.enqueueJob(new PermissionSetAssignmentQueueable(
                userId,
                'Reality_force_Apex_Class_Permission_Sets'
            ));
            System.debug('Successfully enqueued permission set assignment for User: ' + userId);
        } catch (Exception e) {
            System.debug('Error enqueuing permission set assignment: ' + e.getMessage());
        }
    }
}