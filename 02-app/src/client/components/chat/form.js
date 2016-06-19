import $ from "jquery";
import {Observable} from "rxjs";

import {ElementComponent} from "../../lib/component";

export class ChatFormComponent extends ElementComponent {
    constructor(usersStore) {
        super("div");
        this._users = usersStore;
        this.$element.addClass("chat-form");
    }    

    _onAttach() {
        this._$error = $(`<div class="chat-error" />`).appendTo(this.$element);
        this._$input = $(`<input type="text" class="chat-input" />`).appendTo(this.$element);
        
        this._users.currentUser$.componentSubscribe(this, user => {
            this._$input.attr("placeholder", user.isLoggedIn ? "" : "Enter a username");
        }); 

        Observable.fromEvent(this._$input, "keydown")
            // Get Value
            .filter(e => e.keyCode === 13 /* keycode for enter */)
            .do(e => e.preventDefault())
            .map(e => e.target.value.trim())
            .filter(e => e.length)

            // Login or send message
            .withLatestFrom(this._users.currentUser$)
            .flatMap(([value, user]) => {
                return user.isLoggedIn ? this._sendMessage$(value) : this._login$(value);    
            })

            // Display message
            .componentSubscribe(this, response => {
                if (response && response.error)
                    this._$error.show().text(response.error.message);
                else
                    this._$error.hide();
            });
    }

    //By convention, we appenb $ to functions or methods which return a stream
    _sendMessage$() {
        return Observable.empty();
    }

    _login$(username) {
        this._$input.attr("disabled", "disabled");
        return this._users.login$(username).catchWrap()
            .do(() => this._$input.val(""))
            .finally(() => {
                this._$input.attr("disabled", null);
                this._$input.focus();
            });
    }
}