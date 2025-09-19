public class SendEmailToContactHandler extends TriggerHandler {

    public override List<SObject> filterRecords(){
        List<SObject> caseRecordToProcess = new List<SObject>();
        for(Case caseRecord: (List<Case>)newMap.values()){
            if(caseRecord.ContactId <> null){
                caseRecordToProcess.add(caseRecord);
            }
        }
        System.debug('SendEmailToContactHandler - Inside the filterRecords Method - '+caseRecordToProcess?.size());
        return caseRecordToProcess;
    }
    public override void execute(List<SObject> records){ /// filtered records
        /** Business Logic **/
        System.debug('SendEmailToContactHandler - Inside the Execute Method - '+records?.size());
    }
}