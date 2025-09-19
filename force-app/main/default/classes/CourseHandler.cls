public with sharing class CourseHandler {
    
    public void createCourse(){
        Course__c course = new Course__c(
            Name = 'Salesforce DevOps',
            StartDate__c = System.today(),
            EndDate__c = System.today().addDays(83),
            Price__c = 4343
        );
        
        Database.saveResult sr = Database.insert(course, false, AccessLevel.USER_MODE); // SYSTEM_MODE
        if(sr.isSuccess()){
            // success
        } else {
           List<Database.Error> errors = sr.getErrors();
           System.debug( System.JSON.serializePretty(errors) );
        }
        /* try{
            insert as user course; // inser as sysem course
        }catch(System.DMLException ex){
            System.debug('DmlFieldNames \n '+ ex.getDmlFieldNames(0));
            System.debug('getDmlFields  \n '+ ex.getDmlFields(0));
            System.debug('getDmlId  \n '+ ex.getDmlId(0));
            System.debug('getDmlMessage  \n '+ ex.getDmlMessage(0));
            System.debug('getDmlStatusCode   \n '+ ex.getDmlStatusCode (0));
            System.debug('getDmlType   \n '+ ex.getDmlType(0));
        }catch(System.Exception ex){
            
        } */
    }
    
    public void listCourse(){
        List<Course__c> courseList = [SELECT Id, Name, StartDate__c, Price__c, CourseDuration__c
         	FROM Course__c
        ];
        System.debug( JSON.serializePretty(courseList) );
    }

    public List<Course__c> listCourseQueryWithBinds(Decimal price){
        Map<String, Object> bindVariables = new Map<String, Object>{
            'price' => price
        };
        String query = 'SELECT Id, Name, StartDate__c, Price__c, CourseDuration__c '
        +'FROM Course__c WHERE Price__c <> null AND Price__c >=: price LIMIT 10';
        List<Course__c> courseList;
        try{
            courseList = query(query, bindVariables);
            System.debug( JSON.serializePretty(courseList) );
        }catch(System.QueryException ex){
            // Create the Object of Application Log Record
        }catch(System.Exception ex){
            // Create the Object of Application Log Record
        }
        return courseList;
    }
    private List<Course__c> query(String query, Map<String, Object> bindVariables){
        List<Course__c> courseList = Database.queryWithBinds(query, bindVariables, AccessLevel.USER_MODE);
        return courseList;
    }
    public List<Course__c> listCoursesWithDatabaseQuery(){
        String query = 'SELECT Id, Name, StartDate__c, Price__c, CourseDuration__c FROM Course__c WHERE Price__c <> null LIMIT 1';
        List<Course__c> courseList = Database.Query(query, AccessLevel.USER_MODE);
        System.debug( JSON.serializePretty(courseList) );
        return courseList;
    }
    public List<Course__c> listCoursesWithUserMode(){
        List<Course__c> courseList = new List<Course__c>();
        try{
            courseList = [SELECT Id, Name, StartDate__c, CourseDuration__c, Price__c
                FROM Course__c
                WHERE Price__c <> null
                WITH USER_MODE
                Order By Price__c DESC
            ];
            System.debug( JSON.serializePretty(courseList) );
        }catch(System.QueryException ex){
            /* Logger Object */
            System.debug('Message \n '+ ex.getMessage());
            System.debug('Stack Trace \n '+ ex.getStackTraceString());
            System.debug('Inaccessible Fields  \n '+ ex.getInaccessibleFields());
        }catch(System.Exception ex){
            
        } finally {
            
        }
        return courseList;
    }
    public List<Course__c> listCoursesWithSecurity(){
        List<Course__c> courseList = new List<Course__c>();
        try{
            courseList = [SELECT Id, Name, StartDate__c, CourseDuration__c
                FROM Course__c
                WHERE Price__c <> null
                WITH SECURITY_ENFORCED
                LIMIT 190
            ];
            System.debug( JSON.serializePretty(courseList) );
        }catch(System.QueryException ex){
            /* Logger Object */
            System.debug('Message \n '+ ex.getMessage());
            System.debug('Stack Trace \n '+ ex.getStackTraceString());
            System.debug('Inaccessible Fields  \n '+ ex.getInaccessibleFields());
        }catch(System.Exception ex){
            
        } finally {
            
        }
        return courseList;
    }
}