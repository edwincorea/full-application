import $ from "jquery";
import {Observable} from "rxjs";

//"Hijack" Observable subscribe method, so we destroy subscriptions for components that are detached.
//Clean up our subscriptions for detached components.
Observable.prototype.componentSubscribe = function(component, ...args) {
    let subscription = this.safeSubscribe(...args);
    component._onDetachHandlers.push(() => subscription.unsubscribe());
    return subscription;
};

export class ComponentBase {
    //attach to a DOM mount point
    attach($mount) {
        this._$mount = $mount;
        this._onDetachHandlers = []; //list of event handlers. We are gonna use them when we subscribe to reactive extension observables.
        this.children = [];
        this._onAttach();
    }
    
    detach() {
        this._onDetach();
        
        for(let handler of this._onDetachHandlers)
            handler();
            
        for(let child of this.children)
            child.detach();
            
        this._onDetachHandlers = [];
        this.children = [];
    }
    
    //"protected void methods" 
    _onAttach() {        
    }
    
    _onDetach() {        
    }
} 

//helper subclass of component base
export class ElementComponent extends ComponentBase {
    get $element() { return this._$element; }
    
    constructor(elementType = "div") {
        super();
        this._$element = $(`<${elementType}>`).data("component", this);
    } 
    
    attach($mount) {
        super.attach($mount);
        this.$element.appendTo(this._$mount);
    }
    
    detach() {
        super.detach();
        this.$element.remove();
    }
    
    //helper method
    _setClass(className, isOn) {
        if (isOn)
            this._$element.addClass(className);
        else
            this._$element.removeClass(className);
    }
} 