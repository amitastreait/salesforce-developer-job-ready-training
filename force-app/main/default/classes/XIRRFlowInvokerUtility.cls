/**
 * @description Utility class to dynamically invoke Salesforce Flows
 * @author - Amit Singh
 * @date 2025
 */
public class XIRRFlowInvokerUtility {
    
    /**
     * @description Invocable method to call the XIRR Opportunity Auto Launched Approval Flow
     * This method can be called from Process Builder or Flow as an Apex Action
     * @param requests List of FlowInvokerRequest containing the input parameters
     * @return List<FlowInvokerResponse> containing the results of flow execution
     */
    @InvocableMethod(
        label='Invoke Approval Flow' 
        description='Dynamically invokes the specified flow with provided parameters'
        category='Flow Management'
        iconName ='slds:custom:custom76'
    )
    public static List<FlowInvokerResponse> invokeApprovalFlow(List<FlowInvokerRequest> requests) {
        List<FlowInvokerResponse> responses = new List<FlowInvokerResponse>();
        
        for (FlowInvokerRequest request : requests) {
            FlowInvokerResponse response = new FlowInvokerResponse();
            response.recordId = request.recordId;
            
            try {
                // Validate required inputs
                validateInputs(request);
                
                // Prepare flow input variables
                Map<String, Object> flowInputs = new Map<String, Object>();
                flowInputs.put('recordId', request.recordId);
                flowInputs.put('submissionComments', request.submissionComments);
                flowInputs.put('discountPercentage', request.discountPercentage);
                flowInputs.put('submitter', request.submitter);
                
                // Create and start the flow interview
                Flow.Interview flowInterview = Flow.Interview.createInterview(request.flowApiName, flowInputs);
                
                if (flowInterview != null) {
                    flowInterview.start();
                    
                    response.isSuccess = true;
                    response.message = 'Successfully invoked flow: ' + request.flowApiName;
                    response.flowApiName = request.flowApiName;
                    
                    System.debug('Successfully started flow: ' + request.flowApiName + ' for record: ' + request.recordId);
                    
                } else {
                    response.isSuccess = false;
                    response.message = 'Failed to create flow interview for: ' + request.flowApiName;
                    response.errorCode = 'FLOW_CREATION_FAILED';
                }
                
            } catch (Exception e) {
                response.isSuccess = false;
                response.message = 'Error invoking flow: ' + e.getMessage();
                response.errorCode = 'EXECUTION_ERROR';
                response.stackTrace = e.getStackTraceString();
                System.debug(LoggingLevel.ERROR, 'Error invoking flow for record ' + request.recordId + ': ' + e.getMessage());
            }
            
            responses.add(response);
        }
        return responses;
    }
    
    /**
     * @description Validates the input parameters
     * @param request The FlowInvokerRequest to validate
     */
    private static void validateInputs(FlowInvokerRequest request) {
        List<String> errors = new List<String>();
        
        if (String.isBlank(request.flowApiName)) {
            errors.add('Flow API Name cannot be blank');
        }
        
        if (request.recordId == null) {
            errors.add('Record ID cannot be null');
        }
        
        // Optional: Add more validation rules as needed
        if (request.discountPercentage != null && request.discountPercentage < 0) {
            errors.add('Discount Percentage cannot be negative');
        }
        
        if (!errors.isEmpty()) {
            throw new FlowInvokerException(String.join(errors, '; '));
        }
    }
    
    /**
     * @description Input class for the invocable method
     */
    public class FlowInvokerRequest {
        @InvocableVariable(label='Flow API Name' description='The API name of the flow to invoke' required=true)
        public String flowApiName;
        
        @InvocableVariable(label='Record ID' description='The record ID to process' required=true)
        public Id recordId;
        
        @InvocableVariable(label='Submission Comments' description='Comments for the approval submission' required=false)
        public String submissionComments;
        
        @InvocableVariable(label='Discount Percentage' description='The discount percentage being requested' required=false)
        public Decimal discountPercentage;
        
        @InvocableVariable(label='Submitter' description='User submitting the approval' required=false)
        public String submitter;
    }
    
    /**
     * @description Output class for the invocable method
     */
    public class FlowInvokerResponse {
        @InvocableVariable(label='Success' description='Whether the flow was invoked successfully')
        public Boolean isSuccess;
        
        @InvocableVariable(label='Message' description='Success or error message')
        public String message;
        
        @InvocableVariable(label='Record ID' description='The record ID that was processed')
        public Id recordId;
        
        @InvocableVariable(label='Flow API Name' description='The flow that was invoked')
        public String flowApiName;
        
        @InvocableVariable(label='Error Code' description='Error code if execution failed')
        public String errorCode;
        
        @InvocableVariable(label='Stack Trace' description='Stack trace if execution failed')
        public String stackTrace;
    }
    
    /**
     * @description Custom exception class for flow invoker errors
     */
    public class FlowInvokerException extends Exception {}
}