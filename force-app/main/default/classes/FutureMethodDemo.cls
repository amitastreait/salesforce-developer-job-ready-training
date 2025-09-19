public class FutureMethodDemo {

    // FutureMethodDemo.myMethod()
    @future(callout=true)
    public static void myMethod(Set<Id> recordIdSet){
        System.debug('inside my method');
        //myMethod1();
    }
    
    @future
    public static void myMethod1(){
        System.debug('inside my method');
    }
}