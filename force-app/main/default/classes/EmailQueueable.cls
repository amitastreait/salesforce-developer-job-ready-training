public class EmailQueueable implements System.Queueable, Database.AllowsCallouts {
    
    final Integer DELAY_IN_MINUTES = 1;
    List<String> emails;
    String emailSubject;
    String emailBody;
    
    public EmailQueueable(){}
    
    public EmailQueueable(List<String> emails, String emailSubject, String emailBody){
        this.emails = emails;
        this.emailSubject = emailSubject;
        this.emailBody = emailBody;
    }
    
    public void addParams(List<String> emails, String emailSubject, String emailBody){
        this.emails = emails;
        this.emailSubject = emailSubject;
        this.emailBody = emailBody;
    }
    
	/*
	 	// Method 1 - Not recommended
	 	EmailQueueable queuable = new EmailQueueable();
	 	queuable.execute(null);

		// Method 2 - recommended
		EmailQueueable queuable = new EmailQueueable();
		Id jobId = System.enqueueJob(queuable);
		// jobId - to track the job
	 */ 
    public void execute(System.QueueableContext context){
        // Business Logic
        System.debug('Queueable Apex');
        System.debug('emails '+emails);
        System.debug('emailSubject '+emailSubject);
        System.debug('emailBody '+emailBody);
        
        try{
            Id jobId = context.getJobId();
            AsyncApexJob jobInformation = [SELECT Id, ApexClass.Name, CompletedDate, CreatedDate, ExtendedStatus, 
                                           Status, JobItemsProcessed, JobType 
                                           FROM 
                                            AsyncApexJob 
                                           WHERE 
                                            Id =:jobId
                                           ];
            System.debug(jobInformation);
        } catch(System.Exception ex){
            // Prepare Log Records
        } finally {
            // Cleanup
        }
        
        try {
            
        } finally {
            
        }
        
        try {
            
        } catch(System.Exception ex){
            // Prepare Log Records
        }
        
        FutureMethodDemo.myMethod(null);
        Id childJobId = System.enqueueJob(new SMSQueueable(), DELAY_IN_MINUTES); // Flex Queue after 1 minute
        FutureMethodDemo.myMethod1();
        //Id loggerJobId = System.enqueueJob(new LoggerQueueable());
    }
}