/**
 * @description Simple Hello World Invocable Apex for Salesforce Flows
 * @author Amit Singh
 * @date 2025
 */
public class HelloWorldService {
    
    @InvocableMethod(label='Say Hello' description='Returns a hello message' iconName ='slds:custom:custom34')
    public static List<HelloResult> sayHello(List<HelloRequest> requests) {
        List<HelloResult> results = new List<HelloResult>();
        
        for (HelloRequest request : requests) {
            HelloResult result = new HelloResult();
            
            if (String.isBlank(request.name)) {
                result.message = 'Hello, World!';
            } else {
                result.message = 'Hello, ' + request.name + '!';
            }
            
            result.timestamp = DateTime.now();
            results.add(result);
        }
        
        return results;
    }
    
    // Input wrapper class
    public class HelloRequest {
        @InvocableVariable(label='Name' description='Name to greet' required=true)
        public String name;
    }
    
    // Output wrapper class
    public class HelloResult {
        @InvocableVariable(label='Message' description='Hello message')
        public String message;
        
        @InvocableVariable(label='Timestamp' description='When message was created')
        public DateTime timestamp;
    }
}