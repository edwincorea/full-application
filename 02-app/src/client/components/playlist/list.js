import $ from "jquery";
import moment from "moment";
import {Observable} from "rxjs";

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
        const sort = new PlaylistSortComponent(this._playlist, this._users, this.$element);
        sort.attach(this._$mount);
        this.children.push(sort);

        // ---------------------
        // Playlist

        //debug
        // this._playlist.state$.componentSubscribe(this, state => {
        //     console.log(state);
        // });

        Observable.merge(
            this._playlist.state$.first(),
            this._playlist.actions$.filter(a => a.type === "list"))
            .componentSubscribe(this, ({state}) => {
                $list.empty();
                itemsMap = {};
                for (let source of state.list) {
                    const component = new PlaylistItemComponent(source);
                    itemsMap[source.id] = component;
                    component.attach($list);
                }
            });

        this._playlist.actions$
            .filter(a => a.type === "add")
            .componentSubscribe(this, ({source, addAfter}) => {
                const component = new PlaylistItemComponent(source);
                component.attach($list);

                itemsMap[source.id] = component;
                this._addItem(component, addAfter ? itemsMap[addAfter.id] : null);
            });

        this._playlist.actions$
            .filter(a => a.type === "move")
            .componentSubscribe(this, ({fromSource, toSource}) => {
                const fromComponent = itemsMap[fromSource.id];
                const toComponent = toSource ? itemsMap[toSource.id] : null;
                this._moveItem(fromComponent, toComponent);
            });

        this._playlist.actions$
            .filter(a => a.type === "remove")
            .componentSubscribe(this, ({source}) => {
                const component = itemsMap[source.id];
                this._removeItem(component);
            });


        // ---------------------
        // Current Item
        let lastComponent = null;
        this._playlist.serverTime$
            .componentSubscribe(this, current => {
                //there's nothing playing
                if (current.source == null) {
                    if (lastComponent != null) {
                        lastComponent.isPlaying = false;
                        lastComponent = null;
                    }

                    return;
                }

                const currentComponent = itemsMap[current.source.id];
                if (currentComponent == null) {
                    console.error(`Cannot find component for ${current.source.id} / ${current.source.title}`);
                    return;
                }

                if (lastComponent != currentComponent) {
                    if (lastComponent != null)
                        lastComponent.isPlaying = false;

                    lastComponent = currentComponent;
                    currentComponent.isPlaying = true;

                    //animation here for scrolling additional item into view, with two additional items' height as padding
                    const scrollTop = currentComponent.$element.offset().top -
                        this.$element.offset().top +
                        this.$element.scrollTop() -
                        currentComponent.$element.height() * 2;

                    this._$mount.animate({ scrollTop });
                }

                currentComponent.progress = current.progress;
            });
    }

    _addItem(component, addAfterComponent) {
        if (addAfterComponent)
            addAfterComponent.$element.after(component.$element);
        else
            this.$element.prepend(component.$element);

        const oldHeight = component.$element.height();
        component.$element
            .addClass("selected")
            .css({ height: 0, opacity: 0 })
            .animate({ height: oldHeight, opacity: 1 }, 250, () => {
                component.$element
                    .removeClass("selected")
                    .css({ height: "", opacity: "" });
            });
    }

    _moveItem(fromComponent, toComponent) {
        const fromOffsetTop = fromComponent.$element[0].offsetTop;
        let distance = 0; //amount of pixels that we need to offset the item with


        if (toComponent) {
            const toOffsetTop = toComponent.$element[0].offsetTop;
            toComponent.$element.after(fromComponent.$element);

            distance = fromOffsetTop - toOffsetTop;
            if (toOffsetTop < fromOffsetTop)
                distance -= fromComponent.$element.height();
        } else {
            distance = fromOffsetTop;
            this.$element.prepend(fromComponent.$element);
        }

        fromComponent.$element
            .addClass("moving")
            .css({ top: distance })
            .animate({ top: 0 }, 250, () => {
                fromComponent.$element
                    .removeClass("moving")
                    .css({ top: "" });
            });
    }

    _removeItem(component) {
        component.$element
            .addClass("remove")
            .animate({ opacity: 0, height: 0 }, 250, () => {
                component.detach();
            });
    }
}

class PlaylistItemComponent extends ElementComponent {
    set isPlaying(isPlaying) {
        this._setClass("is-playing", isPlaying);
    }

    set isSelected(isSelected) {
        this._setClass("selected", isSelected);
    }

    set progress(progress) {
        this._$progress.css("width", `${progress}%`);
    }

    get source() {
        return this._source;
    }

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