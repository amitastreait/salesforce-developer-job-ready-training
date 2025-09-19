public abstract class Animal {

    protected String name;
    protected String color;
    
    public Animal(String name, String color){
        this.name = name;
        this.color = color;
    }
    
    public virtual void makeSound(){
        System.debug('Making Sound in parent class');
    }
    
    public abstract void sleep();
    
}