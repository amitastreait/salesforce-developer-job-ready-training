/**
 * @description Utility class for generating unique usernames in Salesforce
 * @author - Amit Singh
 * @date 27-08-2025
 */
public with sharing class UniqueUsernameGenerator {
    
    private static final String DEFAULT_TEST_DOMAIN = '@pantherschools.com';
    private static final String DEFAULT_SANDBOX_DOMAIN = '@sandbox.training.com';
    
    /**
     * @description Simple timestamp-based unique username generator
     * @param firstName User's first name
     * @param lastName User's last name
     * @return Unique username with timestamp
     */
    public static String generateUniqueUsername(String firstName, String lastName) {
        String baseUsername = firstName.toLowerCase() + '.' + lastName.toLowerCase();
        String timestamp = String.valueOf(System.currentTimeMillis());
        return baseUsername + '.' + timestamp + DEFAULT_TEST_DOMAIN;
    }
    
    /**
     * @description Counter-based username with collision checking
     * @param firstName User's first name
     * @param lastName User's last name
     * @return Unique username with incremental counter
     */
    public static String generateUniqueUsernameWithCounter(String firstName, String lastName) {
        String baseUsername = firstName.toLowerCase() + '.' + lastName.toLowerCase();
        Integer counter = 1;
        String username = baseUsername + counter + DEFAULT_TEST_DOMAIN;
        
        // Check if username exists and increment counter if needed
        while (usernameExists(username)) {
            counter++;
            username = baseUsername + counter + DEFAULT_TEST_DOMAIN;
        }
        
        return username;
    }
    
    /**
     * @description UUID-based username generator (most unique)
     * @param firstName User's first name
     * @param lastName User's last name
     * @return Unique username with UUID component
     */
    public static String generateUniqueUsernameUUID(String firstName, String lastName) {
        String baseUsername = firstName.toLowerCase() + '.' + lastName.toLowerCase();
        String uniqueId = EncodingUtil.convertToHex(Crypto.generateAesKey(128)).substring(0, 8);
        return baseUsername + '.' + uniqueId + DEFAULT_TEST_DOMAIN;
    }
    
    /**
     * @description Test-friendly username with predictable pattern
     * @param firstName User's first name
     * @param lastName User's last name
     * @param testRunId Identifier for test run
     * @return Test-specific unique username
     */
    public static String generateTestUsername(String firstName, String lastName, Integer testRunId) {
        String baseUsername = firstName.toLowerCase() + '.' + lastName.toLowerCase();
        String testSuffix = 'test' + testRunId + '.' + System.currentTimeMillis();
        return baseUsername + '.' + testSuffix + DEFAULT_TEST_DOMAIN;
    }
    
    /**
     * @description Single-line compact username generator
     * @param name Full name (will be processed)
     * @return Compact unique username
     */
    public static String generateQuickUsername(String name) {
        return name.toLowerCase().replace(' ', '.') + '.' + System.currentTimeMillis() + DEFAULT_TEST_DOMAIN;
    }
    
    /**
     * @description Generate multiple unique usernames for bulk operations
     * @param names List of full names
     * @return List of unique usernames
     */
    public static List<String> generateBulkUniqueUsernames(List<String> names) {
        List<String> usernames = new List<String>();
        Long baseTimestamp = System.currentTimeMillis();
        
        for (Integer i = 0; i < names.size(); i++) {
            String cleanName = names[i].toLowerCase().replace(' ', '.');
            String username = cleanName + '.' + (baseTimestamp + i) + DEFAULT_TEST_DOMAIN;
            usernames.add(username);
        }
        
        return usernames;
    }
    
    /**
     * @description Organization-aware unique username
     * @param firstName User's first name
     * @param lastName User's last name
     * @return Username with organization identifier
     */
    public static String generateOrgAwareUsername(String firstName, String lastName) {
        String orgId = UserInfo.getOrganizationId().substring(0, 5);
        String baseUsername = firstName.toLowerCase() + '.' + lastName.toLowerCase();
        String timestamp = String.valueOf(System.currentTimeMillis());
        return baseUsername + '.' + orgId + '.' + timestamp + DEFAULT_TEST_DOMAIN;
    }
    
    /**
     * @description Random string username generator
     * @param baseName Base name for username
     * @return Username with random component
     */
    public static String generateRandomUsername(String baseName) {
        String chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        String randomString = '';
        
        for (Integer i = 0; i < 6; i++) {
            Integer randomIndex = Math.mod(Math.abs(Crypto.getRandomInteger()), chars.length());
            randomString += chars.substring(randomIndex, randomIndex + 1);
        }
        
        return baseName.toLowerCase() + '.' + randomString + DEFAULT_TEST_DOMAIN;
    }
    
    /**
     * @description Generate username with custom domain
     * @param firstName User's first name
     * @param lastName User's last name
     * @param domain Custom domain (e.g., '@mycompany.com')
     * @return Username with specified domain
     */
    public static String generateUsernameWithDomain(String firstName, String lastName, String domain) {
        String baseUsername = firstName.toLowerCase() + '.' + lastName.toLowerCase();
        String timestamp = String.valueOf(System.currentTimeMillis());
        return baseUsername + '.' + timestamp + domain;
    }
    
    /**
     * @description Check if a username already exists
     * @param username Username to check
     * @return True if username exists, false otherwise
     */
    private static Boolean usernameExists(String username) {
        try {
            List<User> existingUsers = [SELECT Id FROM User WHERE Username = :username LIMIT 1];
            return !existingUsers.isEmpty();
        } catch (Exception e) {
            // If query fails, assume username doesn't exist
            return false;
        }
    }
    
    /**
     * @description Generate environment-aware username (sandbox vs production)
     * @param firstName User's first name
     * @param lastName User's last name
     * @return Environment-appropriate username
     */
    public static String generateEnvironmentAwareUsername(String firstName, String lastName) {
        Organization org = [SELECT IsSandbox FROM Organization LIMIT 1];
        String domain = org.IsSandbox ? DEFAULT_SANDBOX_DOMAIN : DEFAULT_TEST_DOMAIN;
        
        String baseUsername = firstName.toLowerCase() + '.' + lastName.toLowerCase();
        String timestamp = String.valueOf(System.currentTimeMillis());
        return baseUsername + '.' + timestamp + domain;
    }
}

/**
 * USAGE EXAMPLES IN DIFFERENT SCENARIOS:
 */

// 1. Simple user creation
// String username = UniqueUsernameGenerator.generateUniqueUsername('John', 'Doe');
// Result: john.doe.1703123456789@testdomain.com

// 2. Test-specific username
// String testUsername = UniqueUsernameGenerator.generateTestUsername('Test', 'User', 1);
// Result: test.user.test1.1703123456789@testdomain.com

// 3. UUID-based (most unique)
// String uuidUsername = UniqueUsernameGenerator.generateUniqueUsernameUUID('Admin', 'User');
// Result: admin.user.a1b2c3d4@testdomain.com

// 4. Quick single-name generation
// String quickUsername = UniqueUsernameGenerator.generateQuickUsername('Jane Smith');
// Result: jane.smith.1703123456789@testdomain.com

// 5. Bulk generation
// List<String> names = new List<String>{'User One', 'User Two'};
// List<String> usernames = UniqueUsernameGenerator.generateBulkUniqueUsernames(names);
// Result: ['user.one.1703123456789@testdomain.com', 'user.two.1703123456790@testdomain.com']

// 6. Custom domain
// String customUsername = UniqueUsernameGenerator.generateUsernameWithDomain('Sales', 'Rep', '@mycompany.com');
// Result: sales.rep.1703123456789@mycompany.com

// 7. Organization-aware
// String orgUsername = UniqueUsernameGenerator.generateOrgAwareUsername('Manager', 'User');
// Result: manager.user.00d01.1703123456789@testdomain.com