import "./application.scss";

import * as services from "./services";

//-------------------------------------
//PLAYGROUND
//call a login command to the server
services.server
    .emitAction$("login", {username: "foo", password: "bar"})
    .subscribe(user => {
        console.log(`We're logged in: ${user}.`);
    }, error => {
        console.error(error);
    });


//-------------------------------------
//Auth


//-------------------------------------
//Components
require("./components/player/player");


//-------------------------------------
//Boostrap
services.socket.connect();
