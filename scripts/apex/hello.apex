// CursorExample.pagination(6, 10);

Account myAcc = new Account(Name='123');
FormulaEval.FormulaInstance ff = Formula.builder()
    .withType(Schema.Account.class)
    .withReturnType(FormulaEval.FormulaReturnType.STRING)
    .withFormula('{!name} ({!website}) - {!TEXT(Industry)}')
    .parseAsTemplate(true)
    .build();

//Use the list of field names returned by the getReferenced method to generate dynamic soql
String fieldNameList = String.join(ff.getReferencedFields(),',');
System.debug(fieldNameList);
String queryStr = 'select ' + fieldNameList + ' from Account LIMIT 1'; //select name, website, Industry from Account
Account s = Database.query(queryStr);
system.debug(ff.evaluate(s));

FormulaEvaluator.evaluate(new Account(Site='Test'));