@IsTest(seeAllData=false)
public class CourseHandlerTest {
    
    @TestSetup
    private static void setupMethod(){
        
        /* Profile standardProfile = [SELECT Id FROM Profile WHERE Name = 'Property Management Admin' LIMIT 1];
        User testUser = new User(
            FirstName = 'John Smith',
            LastName = 'Doe',
            Email = 'testuser@example.com',
            Username = 'testuser@example.com.test.testing',
            Alias = 'tuser',
            TimeZoneSidKey = 'America/New_York',
            LocaleSidKey = 'en_US',
            EmailEncodingKey = 'UTF-8',
            LanguageLocaleKey = 'en_US',
            ProfileId = standardProfile.Id
        );
        insert testUser; */
        User testUser = TestDataFactory.createUser('Property Management Admin', 'Admin', 'User', true);
        System.runAs(testUser){
            /* Course__c course = new Course__c(
                Name = 'Salesforce DevOps',
                StartDate__c = System.today(),
                EndDate__c = System.today().addDays(83),
                Price__c = 4343
            );
            insert course; */
            Course__c course = TestDataFactory.createCourse('Salesforce Test Data Factory', 8234, false);
            course.EndDate__c = System.today().addDays(12);
            insert course;
            
            Account acc = TestDataFactory.createAccount('Salesforce.com', 'Technology', false);
            acc.Description = '';
            acc.Active__c = 'Yes';
            acc.AccountSource = 'Web';
            acc.AccountNumber = '';
            acc.Phone = '';
            insert acc;
        }
    }

    @IsTest(seeAllData=false)
    private static void createCourseTest(){
        Test.startTest();
        new CourseHandler().createCourse();
        Test.stopTest();
    }
    @IsTest
    private static void listCourseQueryWithBindsTest(){
        User testUser = [SELECT Id, Name FROM User WHERE UserName = 'testuser@example.com.test.testing' LIMIT 1];
        Test.startTest();
        System.runAs(testUser){
            List<Course__c> courseList = new CourseHandler().listCourseQueryWithBinds(1000.00);
            System.debug('courseList In Test Class \n '+ courseList);
        }
        Test.stopTest();
    }
    
    @IsTest
    private static void listCourseQueryWithBindsTest1(){
        User testUser = [SELECT Id, Name FROM User WHERE UserName = 'testuser@example.com.test.testing' LIMIT 1];
        Test.startTest();
        System.runAs(testUser){
            List<Course__c> courseList = new CourseHandler().listCourseQueryWithBinds(1000.00);
            System.debug('courseList In Test Class \n '+ courseList);
        }
        Test.stopTest();
    }
    @IsTest
    private static void listCoursesWithUserModeTest(){
        Test.startTest();
        List<Course__c> courseList = new CourseHandler().listCoursesWithUserMode();
        Test.stopTest();
        System.debug('courseList In Test Class \n '+ courseList);
    }
}