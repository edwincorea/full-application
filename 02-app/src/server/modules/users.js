import _ from "lodash";
import {Observable} from "rxjs";

import {ModuleBase} from "../lib/module";
import {validateLogin} from "shared/validation/users";
import {fail} from "shared/observable-socket";

const AuthContext = Symbol("AuthContext");

export class UsersModule extends ModuleBase {
    constructor(io) {
        super();
        this._io = io;
        this._userList = [];
        this._users = {}; //object to keep track of users logged in
    }
    
    getColorForUsername(username) {
        let hash = _.reduce(username, 
            (hash, ch) => ch.charCodeAt(0) + (hash << 6) + (hash << 16) - hash, 0);
            
        hash = Math.abs(hash);
        const hue = hash % 360,
            saturation = hash % 25 + 70,
            lightness = 100 - (hash % 15 + 35);
            
        //hue: 0 - 360: location on the color wheel
        //saturation: how saturated that color is.
        //lightness: how lightness the color has
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;            
                        
    }

    //synchronous
    getUserForClient(client) {
        const auth = client[AuthContext];
        if (!auth)
            return null;

        return auth.isLoggedIn ? auth : null;
    }
    
    //asynchronous
    loginClient$(client, username) {
        username = username.trim();

        const validator = validateLogin(username);

        if(!validator.isValid)
            return validator.throw$();

        if(this._users.hasOwnProperty(username))
            return fail(`Username ${username} is already taken`);

        const auth = client[AuthContext] || (client[AuthContext] = {});
        if(auth.isLoggedIn)
            return fail("You are already logged in");

        auth.name = username;
        auth.color = this.getColorForUsername(username);
        auth.isLoggedIn = true;            

        this._users[username] = client;
        this._userList.push(auth);

        this._io.emit("users:added", auth);
        console.log(`User ${username} logged in`);
        return Observable.of(auth);
    }

    //synchronous
    logoutClient(client) {
        const auth = this.getUserForClient(client);
        if (!auth)
            return;

        const index = this._userList.indexOf(auth);
        this._userList.splice(index, 1); //delete entry
        delete this._users[auth.name];
        delete client[AuthContext];

        this._io.emit("users:removed", auth);
        console.log(`User ${auth.name} logged out`);                
    }

    //Add an user API
    registerClient(client) {
        client.onActions({
            "users:list": () => {
                console.log("Users List");
                return this._userList;
            },
            
            "auth:login": ({name}) => {
                return this.loginClient$(client, name);                
            },
            
            "auth:logout": () => {
                this.logoutClient(client);                
            }            
        });                        

        //event triggered by socket.io when user disconnects 
        client.on("disconnect", () => {
            this.logoutClient(client);
        });
    }    
} 