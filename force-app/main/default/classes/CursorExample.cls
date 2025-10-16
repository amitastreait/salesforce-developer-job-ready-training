// https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_cursors.htm
public with sharing class CursorExample {
    private static Database.Cursor locator = Database.getCursor('SELECT Id, Name, Email, Phone, Title FROM Contact');
    public CursorExample() {

    }
    @AuraEnabled
    public static List<SObject> pagination(Integer position, Integer lastIndex){
        List<Contact> scope = locator.fetch(position, lastIndex);
        position += scope.size();
        System.debug(System.JSON.serializePretty(scope));
        return scope;
    }
}