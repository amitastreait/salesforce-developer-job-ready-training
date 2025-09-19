public with sharing class RecallApprovalSubmissionController {
    
    public static String fetchUserSessionId(){
        String sessionId = '';
        PageReference reportPage = Page.Session_Id;
        String vfContent = Test.isRunningTest() ? 'Start_Of_Session_Id{!$Api.Session_ID}End_Of_Session_Id' : reportPage.getContent().toString();
        Integer startP = vfContent.indexOf('Start_Of_Session_Id') + 'Start_Of_Session_Id'.length(), endP = vfContent.indexOf('End_Of_Session_Id');
        sessionId = vfContent.substring(startP, endP);
        return sessionId;
    }

    @AuraEnabled(cacheable=true)
    public static OutputWrapper getApprovalSubmissionId(String recordId) {
        OutputWrapper wrapper = new OutputWrapper();
        if (String.isNotBlank(recordId)) {
            try {
                ApprovalWorkItem workItem = [
                    SELECT Id, approvalSubmissionId
                    FROM ApprovalWorkItem
                    WHERE Id = :recordId
                    LIMIT 1
                ];

                wrapper.approvalSubmissionId = String.valueOf(workItem.approvalSubmissionId);
                wrapper.success = true;
            } catch (Exception e) {
                wrapper.message = 'Could not retrieve Approval Submission ID: ' + e.getMessage();
                wrapper.success = false;
            }
        }
        return wrapper;
    }

    @AuraEnabled
    public static OutputWrapper recallApprovalSubmission(String approvalSubmissionId, String comment) {
        OutputWrapper wrapper = new OutputWrapper();
        if (String.isBlank(approvalSubmissionId)) {
            wrapper.message = 'Approval Submission ID not found.';
            wrapper.success = false;
            return wrapper;
        }

        try {
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            request.setEndpoint(URL.getOrgDomainUrl().toExternalForm() + '/services/data/v64.0/actions/standard/recallApprovalSubmission');
            request.setMethod('POST');
            request.setHeader('Authorization', 'Bearer ' + fetchUserSessionId());
            request.setHeader('Content-Type', 'application/json');
			/**
                {
                  "inputs": [
                    {
                      "approvalSubmissionId": "9iPxx00000001lhEBA",
                      "comments": "Recall comments."
                    }
                  ]
                }
			 */ 
            String body = JSON.serialize(new Map<String, Object>{
                'inputs' => new List<Map<String, String>>{
                    new Map<String, String>{
                        'approvalSubmissionId' => approvalSubmissionId,
                        'comments' => comment
                    }
                }
            });
			System.debug(body); // {"inputs":[{"comments":"Recall test using Lighting Web Component!","approvalSubmissionId":"9iPgL000000PqppUAC"}]}
            request.setBody(body);
            HttpResponse response = http.send(request);

            if (response.getStatusCode() == 200 || response.getStatusCode() == 204) {
                wrapper.message = '✅ Approval submission recalled successfully.';
                wrapper.success = true;
            } else {
                wrapper.message = '❌ Failed to recall approval submission: ' + response.getBody();
                wrapper.success = false;
            }
        } catch (Exception e) {
            wrapper.message = 'Callout error: ' + e.getMessage();
            wrapper.success = false;
        }

        return wrapper;
    }
    public class OutputWrapper {
        @AuraEnabled
        public String message;
        @AuraEnabled
        public String approvalSubmissionId;
        @AuraEnabled
        public Boolean success;
    }
}