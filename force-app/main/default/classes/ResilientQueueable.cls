/**
 * Example of a queueable that deliberately fails to demonstrate finalizer usage
 * Clean implementation with all required interface methods
 */
public class ResilientQueueable implements System.Queueable, IQueueableChainable {
    
    private Boolean shouldFail;
    private Map<String, Object> configParameters;
    private Map<String, Object> runtimeParameters;
    
    public ResilientQueueable() {
        this.shouldFail = false;
        this.configParameters = new Map<String, Object>();
        this.runtimeParameters = new Map<String, Object>();
    }
    
    public ResilientQueueable(Boolean shouldFail) {
        this.shouldFail = shouldFail;
        this.configParameters = new Map<String, Object>();
        this.runtimeParameters = new Map<String, Object>();
    }
    
    public void execute(QueueableContext context) {
        try {
            onBeforeExecution();
            
            if (shouldFail) {
                throw new QueueableChainExecutor.QueueableChainException('Deliberate failure for testing finalizer');
            }
            
            // Normal processing
            processData();
            
            onAfterExecution(context.getJobId());
            
            // Chain continuation handled by finalizer if configured
            // Queueable_Chain_Config__mdt config = getQueueableConfig();
            QueueableChainExecutor.getInstance().continueChain(getCurrentQueueableName(), context.getJobId());
            
        } catch (Exception e) {
            onExecutionError(e);
            throw e; // Let finalizer handle chain continuation
        }
    }
    
    /**
     * Business logic for processing data
     */
    private void processData() {
        Map<String, Object> effectiveParams = getEffectiveParameters();
        
        Integer recordLimit = effectiveParams.containsKey('recordLimit') ? (Integer) effectiveParams.get('recordLimit') : 50;
        
        String processingMode = effectiveParams.containsKey('processingMode') ? (String) effectiveParams.get('processingMode') : 'standard';
        
        System.debug('ResilientQueueable: Processing ' + recordLimit + ' records in ' + processingMode + ' mode');
        System.debug('ResilientQueueable: Should fail = ' + shouldFail);
        System.debug('ResilientQueueable: Effective parameters: ' + effectiveParams);
        
        // Simulate processing
        if (processingMode == 'intensive') {
            // Simulate intensive processing
            for (Integer i = 0; i < recordLimit; i++) {
                // Process record logic here
            }
        }
        
        System.debug('ResilientQueueable: Processing completed successfully');
    }
    
    // IQueueableChainable interface implementation
    public Queueable_Chain_Config__mdt getQueueableConfig() {
        return QueueableChainExecutor.getInstance().getQueueableConfig(getCurrentQueueableName());
    }
    
    public void onBeforeExecution() {
        System.debug('ResilientQueueable: Starting execution, shouldFail: ' + shouldFail);
    }
    
    public void onAfterExecution(Id jobId) {
        System.debug('ResilientQueueable: Execution completed successfully');
        System.debug('ResilientQueueable: Job ID: ' + jobId);
    }
    
    public String getCurrentQueueableName() {
        return String.valueOf(this).split(':')[0];
    }
    
    public void onExecutionError(Exception e) {
        System.debug(LoggingLevel.ERROR, 'ResilientQueueable: Error occurred: ' + e.getMessage());
        System.debug(LoggingLevel.ERROR, 'ResilientQueueable: This error was ' + (shouldFail ? 'expected' : 'unexpected'));
    }
    
    public void onFinalizerComplete(System.FinalizerContext result) {
        System.debug('ResilientQueueable: Finalizer executed');
        System.debug('ResilientQueueable: Finalizer Job ID: ' + result.getAsyncApexJobId());
        System.debug('ResilientQueueable: Finalizer Request ID: ' + result.getRequestId());
        System.debug('ResilientQueueable: Chain will continue despite any failures');
    }
    
    public void setRuntimeParameters(Map<String, Object> runtimeParameters) {
        this.runtimeParameters = runtimeParameters != null ? runtimeParameters : new Map<String, Object>();
        
        // Update shouldFail if provided in runtime parameters
        if (this.runtimeParameters.containsKey('shouldFail')) {
            this.shouldFail = (Boolean) this.runtimeParameters.get('shouldFail');
        }
        
        System.debug('ResilientQueueable: Runtime parameters set: ' + this.runtimeParameters);
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