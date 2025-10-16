global without sharing class FormulaEvaluator {

    global String name = '';
    global Boolean isAdmin = False;
    global Boolean isException = True;

    public FormulaEvaluator(String name, Boolean isAdmin){
        this.name    = name;
        this.isAdmin = isAdmin;
    }

    // FormulaEvaluator.evaluate(new Account(Site='Test'));
    public static void evaluate(Account accRecord){
        try {
            String expression = 'IF( ISBLANK(Site), \'Null\', \'Not Null\' )';
            FormulaEval.FormulaInstance ff = FormulaBuilder.build('String', Account.SObjectType, expression);
            String siteIsBlank = (String)ff.evaluate( accRecord );
            System.debug(siteIsBlank);
        } catch (System.Exception ex) {
            System.debug(System.LoggingLevel.ERROR, ex.getMessage());
            System.debug(System.LoggingLevel.ERROR, ex.getStackTraceString() );
            System.debug(System.LoggingLevel.ERROR, ex.getCause() );
        } finally {
            System.debug(System.LoggingLevel.DEBUG, 'Finally Executed');
        }
    }
    
    // FormulaEvaluator.evaluate(new FormulaEvaluator('Amit Singh', False) );
    public static void evaluate(FormulaEvaluator cls){
        // IF( (name <> null && isAdmin == True ), \'Admin\', \'NoN-Admin\')
        System.debug(String.isBlank(''));
        String expression = 'IF( ((name <> null && isAdmin == true) || isException ), \'Admin\', \'NoN-Admin\' )';
        try {
            FormulaEval.FormulaInstance ff = FormulaBuilder.build('String', FormulaEvaluator.class, expression );
            String message = (String)ff.evaluate( cls );
            System.debug(System.LoggingLevel.DEBUG, message);
        } catch (System.Exception ex) {
            System.debug(System.LoggingLevel.ERROR, ex.getMessage());
            System.debug(System.LoggingLevel.ERROR, ex.getStackTraceString() );
            System.debug(System.LoggingLevel.ERROR, ex.getCause() );
        } finally {
            System.debug(System.LoggingLevel.DEBUG, 'Finally Executed');
        }
    }
}