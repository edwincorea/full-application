import $ from "jquery";

import {ElementComponent} from "../../lib/component";

export class ChatListComponent extends ElementComponent {
    constructor(server, userStore, chatStore) {
        super("ul");
        this._server = server;
        this._users = userStore;
        this._chat = chatStore;
        this.$element.addClass("chat-messages");        
    }

    _onAttach() {
        this._chat.messages$.componentSubscribe(this, message => {
            this.$element.append($(`<li />`).text(message.message));
        });
    }
}