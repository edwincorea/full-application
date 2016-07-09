import $ from "jquery";
import {ComponentBase} from "../../lib/component";

import "./playlist.scss";

import * as services from "../../services";

import {PlaylistListComponent} from "./list";
import {PlaylistToolbarComponent} from "./toolbar";
import {PlaylistContextMenuComponent} from "./context-menu";
import {PlaylistChromeComponent} from "./chrome";

//Playlist has two subcomponents: chat list and chat form.
//That's why it inherits from ComponentBase.
class PlaylistComponent extends ComponentBase {
    constructor(playlistStore, usersStore) {
        super();
        this._playlist = playlistStore;
        this._users = usersStore;
    }
    
    _onAttach() {
        const $title = this._$mount.find("> h1");
        $title.text("Playlist");
        
        const toolbar = new PlaylistToolbarComponent(this._playlist);
        toolbar.attach(this._$mount); //attach toolbar to mount point (playlist)
        
        this._$chrome = $(`<div class="chrome" />`).appendTo(this._$mount); //append chrome element to mount point (playlist) 
        this._$scrollArea = $(`<div class="scroll-area" />`).appendTo(this._$chrome); //append scroll area to chrome element
        
        const list = new PlaylistListComponent(this._playlist, this._users);
        list.attach(this._$scrollArea); //attach list to scroll area
        
        const contextMenu = new PlaylistContextMenuComponent();
        contextMenu.attach(this._$scrollArea); //attach list to scroll area
        
        const chrome = new PlaylistChromeComponent();
        chrome.attach(this._$chrome); //attach chrome component to chrome div
        
        this.children.push(toolbar, list, contextMenu, chrome);
    }
    
    _onDetach() {
        this._$chrome.remove(); //remove chrome div
    }
}

let component;
try {
    component = new PlaylistComponent(services.playlistStore, services.usersStore);
    component.attach($("section.playlist"));
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