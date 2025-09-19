trigger AssetTrigger on Asset (before insert, after insert, before update, after update, before delete, after delete, after undelete) {
    TriggerManager.run('Assert');
    System.debug('');
}