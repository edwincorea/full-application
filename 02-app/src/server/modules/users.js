import _ from "lodash";
import {ModuleBase} from "../lib/module";

export class UsersModule extends ModuleBase {
    constructor(io) {
        super();
        this._io = io;
        //fake userlist
        this._userList = [
            {name: "Foo", color: this.getColorForUsername("Foo")},
            {name: "Bar", color: this.getColorForUsername("Bar")},
            {name: "Baz", color: this.getColorForUsername("Baz")}
        ];
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
    
    //Add a client API
    registerClient(client) {
        //Pretend every two seconds a new user is registered...
        let index = 0;
        setInterval(() => {
            const username = `New user ${index}`;
            const user = {name: username, color: this.getColorForUsername(username)};
            client.emit("users:added", user);
            index++;                        
        }, 2000);
        
        client.onActions({
            "users:list": () => {
                return this._userList;
            },
            
            "auth:login": () => {                
            },
            
            "auth:logout": () => {                
            }            
        });                        
    }    
} 