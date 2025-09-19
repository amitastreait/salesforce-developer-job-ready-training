public class SMSQueueable implements System.Queueable {
    /** Email Queueable --> SMS Queueable --> Logger Queueable --> ContactRollupQueueable --> Account External Queueaable Class **/
    public void execute(System.QueueableContext context){
        Id jobId = context.getJobId();
        System.debug(' SMSQueueable '+jobId);
        AsyncApexJob jobInformation = [SELECT Id, ApexClass.Name, CompletedDate, CreatedDate, ExtendedStatus, 
                                       Status, JobItemsProcessed, JobType 
                                       FROM 
                                       	AsyncApexJob 
                                       WHERE 
                                       	Id =:jobId
                                       ];
        Id loggerJobId = System.enqueueJob(new LoggerQueueable());
    }
}