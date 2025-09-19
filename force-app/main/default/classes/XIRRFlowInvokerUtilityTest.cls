@IsTest
public class XIRRFlowInvokerUtilityTest {
    
    // Test data setup
    @TestSetup
    static void setupTestData() {
        // Create test account
        Account testAccount = new Account(
            Name = 'Test Account for Flow Invoker',
            Type = 'Prospect',
            Industry = 'Technology',
            Phone = '98765432',
            Fax = '98765432',
            Website = 'www.pantherschools.com',
            Rating = 'Hot'
        );
        insert testAccount;
        
        // Create test opportunities
        List<Opportunity> testOpportunities = new List<Opportunity>();
        for (Integer i = 0; i < 5; i++) {
            testOpportunities.add(new Opportunity(
                Name = 'Test Opportunity ' + i,
                AccountId = testAccount.Id,
                StageName = 'Prospecting',
                CloseDate = Date.today().addDays(30),
                Amount = 100000 + (i * 10000)
            ));
        }
        insert testOpportunities;
    }
    
    /**
     * @description Test successful flow invocation with all required parameters
     */
    @isTest
    static void testInvokeApprovalFlow_Success() {
        // Get test data
        Opportunity testOpp = [SELECT Id FROM Opportunity LIMIT 1];
        
        // Prepare request
        XIRRFlowInvokerUtility.FlowInvokerRequest request = new XIRRFlowInvokerUtility.FlowInvokerRequest();
        request.flowApiName = 'XIRR_Opportunity_Auto_Launched_Approval_Flow';
        request.recordId = testOpp.Id;
        request.submissionComments = 'Test submission comments for approval via invocable method';
        request.discountPercentage = 12.5;
        request.submitter = UserInfo.getUserId();
        
        List<XIRRFlowInvokerUtility.FlowInvokerRequest> requests = new List<XIRRFlowInvokerUtility.FlowInvokerRequest>{request};
        
        Test.startTest();
        
        List<XIRRFlowInvokerUtility.FlowInvokerResponse> responses = XIRRFlowInvokerUtility.invokeApprovalFlow(requests);
        
        Test.stopTest();
        
        // Verify response
        Assert.areEqual(1, responses.size(), 'Should return one response');
        XIRRFlowInvokerUtility.FlowInvokerResponse response = responses[0];
        Assert.areEqual(testOpp.Id, response.recordId, 'Record ID should match');
    }
    
    /**
     * @description Test invocable method with blank flow API name
     */
    @isTest
    static void testInvokeApprovalFlow_BlankFlowName() {
        Opportunity testOpp = [SELECT Id FROM Opportunity LIMIT 1];
        
        XIRRFlowInvokerUtility.FlowInvokerRequest request = new XIRRFlowInvokerUtility.FlowInvokerRequest();
        request.flowApiName = ''; // Blank flow name
        request.recordId = testOpp.Id;
        request.submissionComments = 'Test with blank flow name';
        request.discountPercentage = 10.0;
        request.submitter = UserInfo.getUserId();
        
        List<XIRRFlowInvokerUtility.FlowInvokerRequest> requests = new List<XIRRFlowInvokerUtility.FlowInvokerRequest>{request};
        
        Test.startTest();
        
        List<XIRRFlowInvokerUtility.FlowInvokerResponse> responses = XIRRFlowInvokerUtility.invokeApprovalFlow(requests);
        
        Test.stopTest();
        
        // Verify validation error
        Assert.areEqual(1, responses.size(), 'Should return one response');
        XIRRFlowInvokerUtility.FlowInvokerResponse response = responses[0];
        Assert.isFalse(response.isSuccess, 'Should fail validation');
        Assert.isTrue(response.message.contains('Flow API Name cannot be blank'), 'Should validate flow API name');
        Assert.areEqual('EXECUTION_ERROR', response.errorCode, 'Should have execution error code');
    }
    
    /**
     * @description Test invocable method with null record ID
     */
    @isTest
    static void testInvokeApprovalFlow_NullRecordId() {
        XIRRFlowInvokerUtility.FlowInvokerRequest request = new XIRRFlowInvokerUtility.FlowInvokerRequest();
        request.flowApiName = 'XIRR_Opportunity_Auto_Launched_Approval_Flow';
        request.recordId = null; // Null record ID
        request.submissionComments = 'Test with null record ID';
        request.discountPercentage = 5.0;
        request.submitter = UserInfo.getUserId();
        
        List<XIRRFlowInvokerUtility.FlowInvokerRequest> requests = new List<XIRRFlowInvokerUtility.FlowInvokerRequest>{request};
        
        Test.startTest();
        
        List<XIRRFlowInvokerUtility.FlowInvokerResponse> responses = XIRRFlowInvokerUtility.invokeApprovalFlow(requests);
        
        Test.stopTest();
        
        // Verify validation error
        XIRRFlowInvokerUtility.FlowInvokerResponse response = responses[0];
        Assert.isFalse(response.isSuccess, 'Should fail validation');
        Assert.isTrue(response.message.contains('Record ID cannot be null'), 'Should validate record ID');
    }
    
    /**
     * @description Test invocable method with negative discount percentage
     */
    @isTest
    static void testInvokeApprovalFlow_NegativeDiscount() {
        Opportunity testOpp = [SELECT Id FROM Opportunity LIMIT 1];
        
        XIRRFlowInvokerUtility.FlowInvokerRequest request = new XIRRFlowInvokerUtility.FlowInvokerRequest();
        request.flowApiName = 'Test_Flow';
        request.recordId = testOpp.Id;
        request.submissionComments = 'Test with negative discount';
        request.discountPercentage = -5.0; // Negative discount
        request.submitter = UserInfo.getUserId();
        
        List<XIRRFlowInvokerUtility.FlowInvokerRequest> requests = new List<XIRRFlowInvokerUtility.FlowInvokerRequest>{request};
        
        Test.startTest();
        
        List<XIRRFlowInvokerUtility.FlowInvokerResponse> responses = XIRRFlowInvokerUtility.invokeApprovalFlow(requests);
        
        Test.stopTest();
        
        // Verify validation error
        XIRRFlowInvokerUtility.FlowInvokerResponse response = responses[0];
        Assert.isFalse(response.isSuccess, 'Should fail validation');
        Assert.isTrue(response.message.contains('Discount Percentage cannot be negative'), 'Should validate discount percentage');
    }
}