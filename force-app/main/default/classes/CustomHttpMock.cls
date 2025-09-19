/**
* Custom HTTP mock for validating request structure
*/
public class CustomHttpMock implements HttpCalloutMock {
    public HttpResponse respond(HttpRequest request) {
        // Validate request structure
        System.assert(request.getEndpoint().contains('/services/data/v64.0/actions/standard/recallApprovalSubmission'),
                      'Endpoint should contain correct API path');
        System.assertEquals('POST', request.getMethod(), 'Method should be POST');
        System.assertEquals('application/json', request.getHeader('Content-Type'), 'Content-Type should be application/json');
        System.assert(request.getHeader('Authorization').startsWith('Bearer '), 'Authorization header should start with Bearer');
        
        // Validate request body structure
        String body = request.getBody();
        System.assert(body.contains('inputs'), 'Body should contain inputs');
        System.assert(body.contains('approvalSubmissionId'), 'Body should contain approvalSubmissionId');
        System.assert(body.contains('comments'), 'Body should contain comments');
        
        // Return success response
        HttpResponse response = new HttpResponse();
        response.setStatusCode(200);
        response.setBody('{"success": true}');
        return response;
    }
}