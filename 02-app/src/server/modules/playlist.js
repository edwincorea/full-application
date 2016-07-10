import {Observable} from "rxjs";

import {ModuleBase} from "../lib/module";

import {fail} from "shared/observable-socket";
import {validateAddSource} from "shared/validation/playlist";

export class PlaylistModule extends ModuleBase {
    constructor(io, usersModule, playlistRepository, videoServices) {
        super();
        this._io = io;
        this._users = usersModule; //authentication
        this._repository = playlistRepository; //load and save playlist data to the DB
        this._services = videoServices; //locate videos (YT, Vimeo, etc.)

        this._nextSourceId = 1;
        this._playlist = [];
        
        //properties that determine which item is currently playing
        this._currentIndex = -1;
        this._currentSource = null;
        this._currentTime = 0;
    }

    //every module init method returns a repository sequence 
    init$() {
        return this._repository.getAll$()
        .do(this.setPlaylist.bind(this));
        //.do(playlist => this.setPlaylist(playlist));
    }

    setPlaylist(playlist) {
        this._playlist = playlist;

        for(let source of playlist)
            source.id = this._nextSourceId++;

        this._io.emit("playlist:list", this._playlist);
    }

    setCurrentSource(/*source*/) {
    }

    addSourceFromUrl$(url) {
        const validator = validateAddSource(url);
        if(!validator.isValid)
            return validator.throw$();

        return new Observable(observer => {
            let getSource$ = null;

            for(let service of this._services) {
                getSource$ = service.process$(url);
                
                if(getSource$)
                    break;
            }

            if(!getSource$)
                return fail(`No service accepted url ${url}`);

            getSource$
                //.do(source => this.addSource(source))
                .do(this.addSource.bind(this))
                .subscribe(observer);                             
        });
    }

    addSource(source) {
        source.id = this._nextSourceId++;

        let insertIndex = 0,
            afterId = -1;

        if(this._currentSource) {
            afterId = this._currentSource.id; //id of the item after being added
            insertIndex = this._currentIndex + 1;
        }

        this._playlist.splice(insertIndex, 0, source);
        this._io.emit("playlist:added", { source, afterId });

        if(!this._currentSource)
            this.setCurrentSource(source);

        console.log(`playlist: added ${source.title}`);            
    }

    registerClient(client) {
        const isLoggedIn = () => this._users.getUserForClient(client) !== null;

        client.onActions({
            //action handlers            
            "playlist:list": () => {
                return this._playlist;
            },
            
            "playlist:add": ({url}) => {
                if(!isLoggedIn())
                    return fail("You must be logged in to do that");

                return this.addSourceFromUrl$(url);                    
            }
        });
    }
} 