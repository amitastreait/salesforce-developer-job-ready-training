/*** Parent Class **/
/** If you want to extend the propery or methods of the class it must be virtual or abstract ***/
public virtual class Car {

    protected String name;
    protected String model;
    protected String makeYear;
    public Car(String name){
        this.name = name;
    }
    public Car(String name, String model){
        this.name = name;
        this.model = model;
    }
    
    public virtual void start(){
        System.debug('The car '+this.name+' is starting');
    }
    
    public virtual void stop(){
        System.debug('The car '+this.name+' has Stoped.');
    }
    public void applyGear(){
        System.debug('The car '+this.name+' is appying gear');
    }
}