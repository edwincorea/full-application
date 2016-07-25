import $ from "jquery";
import {Observable} from "rxjs";

import {ComponentBase} from "../../lib/component";

export class PlaylistSortComponent extends ComponentBase {
    constructor(playlistStore, usersStore, $list) {
        super();
        this._playlist = playlistStore;
        this._users = usersStore;
        this._$list = $list;        
        //DOM elements alias
        this._$body = $("body");
        this._$html = $("html");
    }

    _onAttach() {
        const $placeholder = $(`<div class="placeholder">{place here}</div>`).appendTo(this._$mount);
        
        //drags are done through the thumb image of source items 
        const startDrag$ = Observable.fromEvent(this._$list, "mousedown")            
            .filter(() => this._users.isLoggedIn)
            .filter(e => $(e.target).hasClass("thumb"))
            .do(e => e.preventDefault());

        const endDrag$ = Observable.fromEvent(this._$body, "mouseup");
        const mouseMove$ = Observable.fromEvent(this._$body, "mousemove");

        //stream of sort operations
        const sortOperations$ = startDrag$
            .flatMap(startEvent => {                
                //target is thumb, we need to represent the fromElement$ as the li we clicked on 
                const $fromElement = $(startEvent.target).closest("li");
                const fromComponent = $fromElement.data("component"); //component data attribute

                this._$html.addClass("sorting-playlist");
                $fromElement.addClass("dragging");
                $placeholder.text(fromComponent.source.title);

                const halfPlaceholderHeight = $placeholder[0].offsetHeight / 2;
                const halfItemHeight = this._$list[0].firstChild.offsetHeight / 2;
                let target = {
                    from: fromComponent,
                    to: null
                };

                return mouseMove$
                    .startWith(startEvent) //populating the stream with start event
                    .map(e => $(document.elementFromPoint(e.clientX, e.clientY - halfItemHeight).closest("li")))
                    .map($element => {
                        const toComponent = $element.data("component");
                        if(target.to == toComponent)
                            return target;

                        target.to = toComponent;

                        const placeholderPosition = toComponent
                            ? (toComponent.$element[0].offsetTop + toComponent.$element[0].offsetHeight) - halfPlaceholderHeight
                            : -halfPlaceholderHeight;

                        $placeholder.css("top", placeholderPosition);
                        return target;                                                         
                    })
                    .takeUntil(endDrag$)
                    .last()
                    .do(() => {
                        $fromElement.removeClass("dragging");
                        this._$html.removeClass("sorting-playlist");
                    });                    
            });

        //testing sorting stream subscribing to it
        sortOperations$.componentSubscribe(this, result => {
            console.log(result);
        });
    }
}