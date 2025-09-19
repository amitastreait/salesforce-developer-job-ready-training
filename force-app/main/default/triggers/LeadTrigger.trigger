trigger LeadTrigger on Lead (before insert, before update) {
    LeadTriggerDispatcher.dispatch(Trigger.OperationType);
}