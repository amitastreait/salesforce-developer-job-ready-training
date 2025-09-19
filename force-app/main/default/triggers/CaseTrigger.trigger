trigger CaseTrigger on Case (after insert, before insert, after update, before update, after delete, before delete) {
    TriggerManager.run('Case'); // Property__c
}