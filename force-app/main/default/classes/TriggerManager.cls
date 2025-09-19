public class TriggerManager {

    public static void run(String objectApiName){
        List<sObjectTriggerAction__mdt> triggerAcctionRecords = getConfigs(objectApiName);
        for(Integer i=0; i< triggerAcctionRecords.size(); i++){
            sObjectTriggerAction__mdt action = triggerAcctionRecords.get(i);
            /** Check for which event the trigger is valid **/
            // Trigger.OperationType - BEFORE_INSERT ~= Is_Before_Insert__c
            // 'Is_'+Trigger.OperationType+'__c' != Is_BEFORE_INSERT__c
            String fieldApiName = 'Is_'+Trigger.OperationType+'__c';
            String bypassUserNames = action.BypassUser__c ?? '' + ','+action.sObject_Trigger_Setting__r.BypassUsers__c ?? '';
            //System.debug(' By Pass User Names '+ bypassUserNames);
            if((Boolean)action.get(fieldApiName) && byPassUser(bypassUserNames) == false ){ // sObject
                TriggerHandler handler = (TriggerHandler)Type.forName(action.HandlerClassName__c).newInstance();
                List<sObject> records = handler.filterRecords();
                if(records?.size()>0){
                    handler.execute(records);
                }
            }
        }
    }
    
    private static Boolean byPassUser(String userNames){
        Boolean isByPass = userNames?.contains(UserInfo.getUserName());
        //System.debug(' By Pass User '+ isByPass);
        return isByPass;
    }
    
    public static List<sObjectTriggerAction__mdt> getConfigs(String objectApiName){
        List<sObjectTriggerAction__mdt> triggerAcctionRecords = [SELECT  HandlerClassName__c, BypassUser__c, 
                                            Is_Before_Insert__c, Is_After_Insert__c, Is_After_Update__c, 
                                            Is_Before_Update__c, Is_After_Undelete__c, Is_After_Delete__c, 
                                            Is_Before_Delete__c, ExecutionOrder__c, sObject_Trigger_Setting__r.BypassUsers__c
                                        FROM 
                                           sObjectTriggerAction__mdt
                                        WHERE 
                                            sObject_Trigger_Setting__r.Object_API_Name__c =: objectApiName AND
                                        	IsActive__c = True AND 
                                            BypassHandler__c = False AND
                                        	sObject_Trigger_Setting__r.Is_Active__c = True AND 
                                        	sObject_Trigger_Setting__r.Bypass__c = False
                                        ORDER BY 
                                            ExecutionOrder__c ASC NULLS LAST
                                    ];
        return triggerAcctionRecords;
    }
}