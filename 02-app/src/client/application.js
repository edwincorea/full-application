import $ from "jquery";
import "moment-duration-format";

import "shared/operators"; //safe subscriptions

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
const $html = $("html");
services.usersStore.currentUser$.subscribe(user => {
    if (user.isLoggedIn) {
        $html.removeClass("not-logged-in");
        $html.addClass("logged-in");
    }
    else {
        $html.addClass("not-logged-in");
        $html.removeClass("logged-in");        
    }
});

//-------------------------------------
//Components
require("./components/player/player");
require("./components/users/users");
require("./components/chat/chat");
require("./components/playlist/playlist");

//-------------------------------------
//Boostrap
services.socket.connect();

// services.usersStore.currentUser$
//     .subscribe(user => console.log(user));

// services.usersStore.login$("jon-doe")
//     .subscribe(() => {});

// services.usersStore.login$("jon-doe")
//     .subscribe(user => {
//         console.log(user);
//     });

// window.setTimeout(() => {
//     services.usersStore.logout$();
// }, 3000);    

