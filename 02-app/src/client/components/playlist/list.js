import {ElementComponent} from "../../lib/component";

import {PlaylistSortComponent} from "./sort";

export class PlaylistListComponent extends ElementComponent {
    constructor(playlistStore, usersStore) {
        super("ul");
        this._playlist = playlistStore;
        this._users = usersStore;
        this.$element.addClass("playlist-list");
    }
    
    _onAttach() {
        // ---------------------
        // Child Components
        const sort = new PlaylistSortComponent();
        sort.attach(this._$mount);
        this.children.push(sort);

        // ---------------------
        // Playlist

        //debug
        // this._playlist.state$.componentSubscribe(this, state => {
        //     console.log(state);
        // });
    }
}