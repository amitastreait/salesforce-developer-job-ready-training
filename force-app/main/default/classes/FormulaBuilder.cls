public without sharing class FormulaBuilder {
    
    public static FINAL Map<String, FormulaEval.FormulaReturnType> MAP_RETURN_TYPES_ENUM = new Map<String, FormulaEval.FormulaReturnType>{
        'Boolean'       => FormulaEval.FormulaReturnType.BOOLEAN,
        'String'        => FormulaEval.FormulaReturnType.STRING,
        'Integer'       => FormulaEval.FormulaReturnType.INTEGER,
        'Decimal'       => FormulaEval.FormulaReturnType.DECIMAL,
        'Double'        => FormulaEval.FormulaReturnType.DOUBLE,
        'Id'            => FormulaEval.FormulaReturnType.ID,
        'Date'          => FormulaEval.FormulaReturnType.DATE,
        'Datetime'      => FormulaEval.FormulaReturnType.DATETIME,
        'Time'          => FormulaEval.FormulaReturnType.TIME,
        'Long'          => FormulaEval.FormulaReturnType.LONG
    };

    public static FormulaEval.FormulaInstance build(String returnType, Schema.SObjectType objectType, String formulaExpression){
        FormulaEval.FormulaReturnType formulaReturnType = MAP_RETURN_TYPES_ENUM.get(returnType);
        FormulaEval.FormulaInstance formulaInstance = Formula.builder()
            .withReturnType(formulaReturnType)
            .withType(objectType)
            .withFormula(formulaExpression)
            .build();
        return formulaInstance;
    }

    public static FormulaEval.FormulaInstance build(String returnType, System.Type apexClass, String formulaExpression){
        FormulaEval.FormulaReturnType formulaReturnType = MAP_RETURN_TYPES_ENUM.get(returnType);
        FormulaEval.FormulaInstance formulaInstance = Formula.builder()
            .withReturnType(formulaReturnType)
            .withType(apexClass)
            .withFormula(formulaExpression)
            .build();
        return formulaInstance;
    }

    public static FormulaEval.FormulaInstance build(String returnType, Schema.SObjectType objectType, String formulaExpression, Boolean parseAsTemplate){
        FormulaEval.FormulaReturnType formulaReturnType = MAP_RETURN_TYPES_ENUM.get(returnType);
        FormulaEval.FormulaInstance formulaInstance = Formula.builder()
            .withReturnType(formulaReturnType)
            .withType(objectType)
            .withFormula(formulaExpression)
            .parseAsTemplate(parseAsTemplate)
            .build();
        return formulaInstance;
    }
}