trigger CourseTrigger on Course__c (before insert, before update) {
    TriggerManager.run('Course__c');
}