public class AccountIntegrationService {
    
    @future(callout=true)
    public static void syncAccountToExternalSystem(List<Id> accountIds) {
        List<Account> accounts = [
            SELECT Id, Name, BillingCity, BillingCountry 
            FROM Account 
            WHERE Id IN :accountIds
        ];
        
        for (Account acc : accounts) {
            try {
                Http http = new Http();
                HttpRequest request = new HttpRequest();
                request.setEndpoint('https://api.external-system.com/accounts');
                request.setMethod('POST');
                request.setHeader('Content-Type', 'application/json');
                
                Map<String, Object> payload = new Map<String, Object>{
                    'salesforceId' => acc.Id,
                    'name' => acc.Name,
                    'city' => acc.BillingCity,
                    'country' => acc.BillingCountry
                };
                
                request.setBody(JSON.serialize(payload));
                
                HttpResponse response = http.send(request);
                
                if (response.getStatusCode() == 200) {
                    System.debug('Account synced successfully: ' + acc.Id);
                } else {
                    System.debug('Failed to sync account: ' + response.getBody());
                }
                
            } catch (Exception e) {
                System.debug('Error syncing account ' + acc.Id + ': ' + e.getMessage());
                // Log error for monitoring
                /* insert new Error_Log__c(
                    Object_Id__c = acc.Id,
                    Error_Message__c = e.getMessage(),
                    Method_Name__c = 'syncAccountToExternalSystem'
                ); */
            }
        }
    }
}