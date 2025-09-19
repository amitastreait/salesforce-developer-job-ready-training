public class CaseRollupSummaryHandler extends TriggerHandler {

    public override List<SObject> filterRecords(){
        List<SObject> caseRecordToProcess = new List<SObject>();
        for(Case caseRecord: (List<Case>)newMap.values()){
            if(caseRecord.AccountId <> null){
                caseRecordToProcess.add(caseRecord);
            }
        }
        System.debug('Inside the filterRecords Method - '+caseRecordToProcess?.size());
        return caseRecordToProcess;
    }
    public override void execute(List<SObject> records){ /// filtered records
        /** Business Logic **/
        System.debug('Inside the Execute Method - '+records?.size());
    }
}