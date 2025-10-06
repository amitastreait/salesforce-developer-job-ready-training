trigger UpdateTerritoryFieldsOnOpportunity on Opportunity (before insert)
{
    List<String> regionCountyList = new List<String>();
    for(Opportunity opp : Trigger.new)
    {
        if(opp.Customer_Region__c <> null && opp.Customer_Country__c <> null)
        {
            regionCountyList.add(opp.Customer_Region__c);
            regionCountyList.add(opp.Customer_Country__c);
        }
    }
    List<Territory__c> territotyList = [Select Id, Name, Region__c, Territory_Code__c,Country__c, Priority_Level__c, Territory_Manager__c 
                                        FROM Territory__c WHERE Region__c IN : regionCountyList AND Country__c IN: regionCountyList];
    
    Map<String,Territory__c> territoryMap = new Map<String,Territory__c>();
    
    for(Territory__c te : territotyList )
    {
        territoryMap.put(te.Region__c + te.Country__c ,te );
    }
    for(Opportunity opp : Trigger.New)
    {
        Territory__c te = territoryMap.get(opp.Customer_Region__c + opp.Customer_Country__c);
        if(te <> null)
        {
            opp.Territory_Priority__c = te.Priority_Level__c;
            opp.Territory_Code__c = te.Territory_Code__c;
            opp.Assigned_Territory_Manager__c = te.Territory_Manager__c;
        }
    }
}