import $ from "jquery";
import moment from "moment";

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
        const $list = this.$element;
        let itemsMap = {};


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

        this._playlist.state$
            .filter(a => a.type === "list")
            .componentSubscribe(this, ({state}) => {
                $list.empty();
                itemsMap = {};
                for(let source of state.list) {
                    const component = new PlaylistItemComponent(source);
                    itemsMap[source.id] = component;
                    component.attach($list);
                }
            });
    }
}

class PlaylistItemComponent extends ElementComponent {
    constructor(source) {
        super("li");
        this._source = source;

        //thumbnail
        const $thumb = $(`<div class="thumb-wrapper" />`).append(
            $(`<img class="thumb" />`).attr("src", source.thumb));

        //details
        const $details = 
            $(`<div class="details" />`).append([
                $(`<span class="title" />`).attr("title", source.title).text(source.title),
                $(`<time />`).text(moment.duration(source.totalTime, "seconds").format())
            ]);

        this._$progress = $(`<span class="progress" />`);
        this.$element.append($(`<div class="inner" />`).append([
            $thumb, 
            $details, 
            this._$progress]));
    }
}  