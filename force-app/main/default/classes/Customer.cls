public class Customer {
    /** Default is private **/
    /** Instance or Object Variables **/
    String firstName;
    String lastName;
    String email;
    Decimal totalPurchases;
    Boolean isNewUser;
    
    
    /** Static Method */
    /**
     [access modifier] [static] [return type] methodName([parameters]) {
          // Method body
          return [value]; // if return type is not void
       }
     */ 
    // Customer newCustomer = Customer.getInstance();
    // newCustomer.sayHello();
    public static Customer getInstance(){
        /** Must Needs - Instance of an Apex Class **/
        Customer newCustomer = new Customer();
        return new Customer();
    }
    
    public static Customer getInstance(String firstName, String lastName){
        /** Must Needs - Instance of an Apex Class **/
        return new Customer(firstName, lastName);
    }
    
    public static Customer getInstance(String firstName, Integer age){
        /** Must Needs - Instance of an Apex Class **/
        return new Customer();
    }
    
    /** Default Constructor*/
    //Customer newCustomer = new Customer(); 
    private Customer(){
        
    }
    /** Paramaterized Constructor **/
    private Customer(String firstName, String lastName, String email, Boolean isNewUser){
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.isNewUser = isNewUser;
        System.debug(this.firstName);
    }
    
    private Customer(String fName, String lName){
        firstName = fName;
        lastName = lName;
        System.debug(firstName +' '+lastName);
    }
    
    /** Class Variable / Static Variables */
    public static String address; // Customer.address = '1234 Main Street';
    
    public void sayHello(){
        System.debug(this);
        this.greetings();
        System.debug('WITHOUT USING THIS KEYWORD');
        greetings();
        add(90,34,34);
    }
    
    /** Instance or Object Methods */
    private void greetings(){
        System.debug('Hello I am from a method');
        System.debug('Below are the Customer Details ');
        System.debug('firstName , '+this.firstName);
        System.debug('lastName, '+this.lastName);
        System.debug('email '+this.email);
        System.debug('address '+address);
        System.debug('totalPurchases '+this.totalPurchases);
    }
    public String hello(String name){
        String message = 'Hello, '+name;
        return message;
    }
    
    /** Class Method / Static Method */
    public static Integer add(Integer a, Integer b, Integer c){
        System.debug(address);
        return a + b + c;
    }
}