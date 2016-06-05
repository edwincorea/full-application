import _ from "lodash";
import {Observable} from "rxjs";

export class UsersStore {
    constructor(server) {
        this._server = server;
        
        // Users List
        
        const defaultState = {users: []};
        //events observable
        const events$ = Observable.merge(
            this._server.on$("users:list").map(opList),
            this._server.on$("users:added").map(opAdd));
            
        //state observable
        this.state$ = events$
            // .scan((lastItem, currentOp) => {
            //     return currentOp(lastItem.state);                                                
            // }, {state: defaultState})
            .scan(({state}, currentOp) => currentOp(state), {state: defaultState}) 
            .publishReplay(1);            
                        
        this.state$.connect();    
        
        // Bootstrap
        this._server.on("connect", () => {
            this._server.emit("users:list");
        });    
    }
}

//"reducers", pure functions that mutate state

//responds to "users:list" event
function opList(users) {
    return state => {
        state.users = users;
        state.users.sort((l, r) => l.name.localeCompare(r.name));                 
        return {
            type: "list",
            state: state            
        };
    };
}

//responds to "users:added" event
function opAdd(user) {
    return state => {
        let insertIndex = _.findIndex(state.users, 
            u => u.name.localeCompare(user.name) > 0);
    
        if (insertIndex === -1 )
            insertIndex = state.users.length;            
            
        state.users.splice(insertIndex, 0, user);
        return {
            type: "add",
            user: user,
            state: state
        };
    };
}