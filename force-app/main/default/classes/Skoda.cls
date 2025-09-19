public class Skoda extends Car {

    public Skoda(String name, String model, String makeYear, String manufaturer, Decimal price){
        super(name); 
    }
    
    public Skoda(String name, String model){
        super(name, model);
        // super
    }
    
    // override
    public override void start(){
        System.debug('I am inside child class ');
        System.debug('My Car is awesome ');
        System.debug(this.name+' is starting with a music');
        System.debug('The model of my car is '+this.model);
    }
}