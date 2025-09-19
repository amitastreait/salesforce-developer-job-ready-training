public class AccountBatchClassScheduler implements System.Schedulable, Database.AllowsCallouts {
    
    public Integer batchSize  = 10; 
    public final String CRON_EXP = '0 30 * * * ?';
    public final String CRON_EXP_15 = '0 15 * * * ?';
    String fifteenMinutes = '0 0,15,30,45 * * * ?';
    public AccountBatchClassScheduler(Integer batchSize){
        this.batchSize = batchSize;
    }
    
    public void execute(System.SchedulableContext scheduleContext){
        /* Business Logic **/
        AccountBatchClass batch = new AccountBatchClass();
        Id jobId = Database.executeBatch(batch, 200);
    }
    public void schedule(){
        /** Pre-Cleanup Logic **/
        
        /** Schedule Class **/
		AccountBatchClassScheduler scheduler = new AccountBatchClassScheduler(25);
        String jobID = System.schedule('Account batch Scheduler 30 minutes',fifteenMinutes, scheduler);
        String jobID_1 = System.schedule('Account batch Scheduler 15 minutes',CRON_EXP_15, scheduler);
    }
}