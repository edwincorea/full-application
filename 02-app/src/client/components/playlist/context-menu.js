import $ from "jquery";
import {Subject, Observable} from "rxjs";

import {ElementComponent} from "../../lib/component";

export class PlaylistContextMenuComponent extends ElementComponent {
    //$list if a reference to ul containing videos
    constructor(playlistStore, usersStore, $list) {
        super("div");
        this.$element.addClass("context-menu");

        this._playlist = playlistStore;
        this._users = usersStore;
        this._$list = $list;
    }

    _onAttach() {
        const $playButton = $(`
            <a href="#" class="play">
                <i class="fa fa-play-circle" /> Play
            </a>
        `).appendTo(this.$element);

        const $deleteButton = $(`
            <a href="#" class="delete">
                <i class="fa fa-trash" /> Delete
            </a>
        `).appendTo(this.$element);

        const selectedItemSubject$ = new Subject();

        const openMenuOnItem$ = Observable.fromEventNoDefault(this._$list, "contextmenu")
            .map(event => $(event.target).closest("li").data("component"));

        const closeMenu$ = Observable.fromEvent($("body"), "mouseup")
            .filter(event => $(event.target).closest("li.selected, .context-menu").length == 0)
            .mapTo(null);

        const selectedItem$ = Observable.merge(openMenuOnItem$, closeMenu$, selectedItemSubject$)
            .filter(() => this._users.isLoggedIn)
            .share();

        let lastItem = null;
        selectedItem$
            .componentSubscribe(this, item => {
                if(lastItem)
                    lastItem.isSelected = false;

                lastItem = item;
                if(!item) {
                    this.$element.removeClass("open");                    
                    return;
                }

                item.isSelected = true;
                this.$element.addClass("open");

                const contextMenuHeight = this.$element.outerHeight();
                const itemHeight = item.$element.outerHeight();
                const itemPosition = item.$element[0].offsetTop;

                //context menu to appear above the item or below the item, depending on reaching the top or bottom of the list
                const targetPosition = itemPosition + itemHeight + contextMenuHeight > this._$list[0].scrollHeight
                    ? itemPosition - contextMenuHeight
                    : itemPosition + itemHeight;

                this.$element.css("top", targetPosition);                    
            });

        //mapping play button event clicks to a function which returns a function which either set current source or delete it (observables). 
        const setCurrentSource$ = Observable.fromEventNoDefault($playButton, "click")
            .map(() => component => this._playlist.setCurrentSource$(component.source));
            //.map(function() { return function(component) { return this._playlist.setCurrentSource$(component.source) } });            

        const deleteSource$ = Observable.fromEventNoDefault($deleteButton, "click")
            .map(() => component => this._playlist.deleteSource$(component.source));                        
            //.map(function() { return function(component) { return this._playlist.deleteSource$(component.source) } });

        Observable.merge(setCurrentSource$, deleteSource$)
            .withLatestFrom(selectedItem$)
            .flatMap(([op, item]) => op(item).catchWrap())
            .componentSubscribe(this, response => {
                if (response && response.error) 
                    alert(response.error.message || "Unknown Error");
                else
                    selectedItemSubject$.next(null);
            });            
    }
}