import {Observable} from "rxjs";

/*eslint no-unused-vars: "off"*/

export class ModuleBase {
    //callback methods
    init$() {
        return Observable.empty();
    }
    
    registerClient(client) {
        
    }
    
    clientRegistered(client) {
        
    }
}