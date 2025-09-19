public with sharing class CourseTriggerHandler extends TriggerHandler {

    public override List<SObject> filterRecords(){
        List<SObject> recordsToProcess = new List<SObject>();
        for(Course__c course: (List<Course__c>)newRecords){
            if(course.StartDate__c <> null ){
                recordsToProcess.add(course);
            }
        }
        System.debug('Inside the filterRecords Method - '+recordsToProcess?.size());
        return recordsToProcess;
    }
    public override void execute(List<SObject> records){ /// filtered records
        /** Business Logic **/
        System.debug('Inside the Execute Method - '+records?.size());
        for(Course__c course: (List<Course__c>)records){
            //course.Price__c = 8978;
            if(course.EndDate__c <> null){
                course.CourseDuration__c = course.StartDate__c.daysBetween(course.EndDate__c);
            }
        }
        /*
        CourseHandler handler = new CourseHandler();
        handler.listCourse();
        */
        // new CourseHandler().listCoursesWithSecurity();
        // new CourseHandler().listCoursesWithUserMode();
        // new CourseHandler().listCoursesWithDatabaseQuery();
        
        new CourseHandler().listCourseQueryWithBinds(1000);
    }
}