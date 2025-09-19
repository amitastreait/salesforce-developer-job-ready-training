public class LoggerQueueable implements System.Queueable {
    public void execute(System.QueueableContext context){
        System.debug(' LoggerQueueable ');
        // Database.getQueryLocator , 10K Records
        // Database.query - 50K Records
        Integer BATCH_SIZE = 20;
        AccountBatchClass batch = new AccountBatchClass();
        Id jobId = Database.executeBatch(batch, BATCH_SIZE); // instance of batch, batch size
    }
}