import $ from "jquery";
import {ComponentBase} from "../../lib/component";

import "./chat.scss";

import {ChatListComponent} from "./list";
import {ChatFormComponent} from "./form";

//Chat has two subcomponents: chat list and chat form.
//That's why it inherits from ComponentBase.
class ChatComponent extends ComponentBase {
    constructor() {
        super();
    }
    
    _onAttach() {
        const $title = this._$mount.find("> h1");
        $title.text("");  
        
        const list = new ChatListComponent();
        list.attach(this._$mount);
        this.children.push(list);

        const form = new ChatFormComponent();
        form.attach(this._$mount);
        this.children.push(form);              
    }
}

let component;
try {
    component = new ChatComponent();
    component.attach($("section.chat"));
} catch(e) {
    console.error(e);
    if(component)
        component.detach();
}
finally {
    //HMR code for live reloading
    if (module.hot) {
        module.hot.accept();
        module.hot.dispose(() => component && component.detach());
    }
}