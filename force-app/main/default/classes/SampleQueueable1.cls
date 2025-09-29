/**
 * Sample queueable class implementing IQueueableChainable with finalizer support
 */
public class SampleQueueable1 implements System.Queueable, IQueueableChainable {
    
    private Map<String, Object> configParameters;
    private Map<String, Object> runtimeParameters;
    private Id currentJobId;
    
    // Constructor with optional parameters
    public SampleQueueable1() {
        this.configParameters = new Map<String, Object>();
        this.runtimeParameters = new Map<String, Object>();
    }
    
    public SampleQueueable1(Map<String, Object> params) {
        this.configParameters = params != null ? params : new Map<String, Object>();
        this.runtimeParameters = new Map<String, Object>();
    }
    
    public void execute(QueueableContext context) {
        this.currentJobId = context.getJobId();

        Queueable_Chain_Config__mdt config = getQueueableConfig();
        try {
            onBeforeExecution();
            
            // Your queueable logic here
            processAccounts();
            
            // Call post-execution logic
            onAfterExecution(currentJobId);
            
            // Continue the chain only if not using finalizer
            if (config == null || !config.Use_Finalizer__c) {
                QueueableChainExecutor.getInstance().continueChain(getCurrentQueueableName(), currentJobId);
            }
            // Note: If using finalizer, chain continuation will be handled by the finalizer
            
        } catch (Exception e) {
            onExecutionError(e);
            
            // Re-throw to trigger finalizer if configured
            if (config != null && config.Use_Finalizer__c) {
                throw e; // Finalizer will handle chain continuation
            } else {
                // Handle chain continuation based on Continue_On_Failure__c
                if (config != null && config.Continue_On_Failure__c) {
                    QueueableChainExecutor.getInstance().continueChain(getCurrentQueueableName(), currentJobId);
                }
                throw e;
            }
        }
    }
    
    /**
     * Business logic for processing accounts
     */
    private void processAccounts() {
        Map<String, Object> effectiveParams = getEffectiveParameters();
        
        Integer recordLimit = effectiveParams.containsKey('recordLimit') ? 
                             (Integer) effectiveParams.get('recordLimit') : 100;
        
        String accountType = effectiveParams.containsKey('accountType') ? 
                            (String) effectiveParams.get('accountType') : null;
        
        String query = 'SELECT Id FROM Account';
        if (String.isNotBlank(accountType)) {
            query += ' WHERE Type = :accountType';
        }
        query += ' LIMIT :recordLimit';
        
        List<Account> accounts = Database.query(query);
        
        System.debug('SampleQueueable1: Processing ' + accounts.size() + ' accounts of type: ' + accountType);
        
        for (Account acc : accounts) {
            // Your business logic here
            acc.Description = 'Processed by SampleQueueable1 at ' + System.now() + 
                             ' with params: ' + JSON.serialize(effectiveParams);
        }
        
        if (!accounts.isEmpty()) {
            update accounts;
        }
    }
    
    // IQueueableChainable implementation
    public Queueable_Chain_Config__mdt getQueueableConfig() {
        return QueueableChainExecutor.getInstance().getQueueableConfig(getCurrentQueueableName());
    }
    
    public void onBeforeExecution() {
        System.debug('SampleQueueable1: Starting execution');
    }
    
    public void onAfterExecution(Id jobId) {
        System.debug('SampleQueueable1: Post-execution logic');
        System.debug('SampleQueueable1: Job ID: ' + jobId);
        System.debug('SampleQueueable1: Execution completed successfully');
    }
    
    public String getCurrentQueueableName() {
        return 'SampleQueueable1';
    }
    
    public void onExecutionError(Exception e) {
        System.debug(LoggingLevel.ERROR, 'SampleQueueable1: Execution error: ' + e.getMessage());
        // Handle error logic here
    }
    
    public void onFinalizerComplete(System.FinalizerContext result) {
        System.debug('SampleQueueable1: Finalizer completed');
        System.debug('SampleQueueable1: Finalizer Job ID: ' + result.getAsyncApexJobId());
        System.debug('SampleQueueable1: Finalizer Request ID: ' + result.getRequestId());
        
        // Additional cleanup or logging can be done here
    }
    
    public void setRuntimeParameters(Map<String, Object> runtimeParameters) {
        this.runtimeParameters = runtimeParameters != null ? runtimeParameters : new Map<String, Object>();
        System.debug('SampleQueueable1: Runtime parameters set: ' + this.runtimeParameters);
    }
    
    public Map<String, Object> getEffectiveParameters() {
        Map<String, Object> effectiveParams = new Map<String, Object>();
        
        // Start with config parameters
        if (configParameters != null) {
            effectiveParams.putAll(configParameters);
        }
        
        // Override with runtime parameters (runtime takes precedence)
        if (runtimeParameters != null) {
            effectiveParams.putAll(runtimeParameters);
        }
        
        return effectiveParams;
    }
}