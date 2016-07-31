import {Observable} from "rxjs";

import {ElementComponent} from "../../../lib/component";

export class YoutubePlayer extends ElementComponent {
    get currentTime() {
        return 0;
    }

    constructor() {
        super("div");
    }

    _onAttach() {
        this.$element.addClass("player youtube");        
    }

    init$() {
        this.$element.hide();

        return new Observable(observer => {
            observer.complete();
        }); 
    }

    play(source, time) {
        console.log(`Youtube: Playing ${source.title} at ${time}`);
        this.$element.show();
    }

    stop() {
        console.log(`Youtube: Stopping`);
        this.$element.hide();
    }

    seek(time) {
        console.log(`Youtube: Seeking to ${time}`);
    }
}