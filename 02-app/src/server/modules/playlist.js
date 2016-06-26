import {ModuleBase} from "../lib/module";

export class PlaylistModule extends ModuleBase {
    constructor(io, usersModule, playlistRepository, videoServices) {
        super();
        this._io = io;
        this._users = usersModule; //authentication
        this._repository = playlistRepository; //load and save playlist data to the DB
        this._services = videoServices; //locate videos (YT, Vimeo, etc.)

        this._nextSourceId = 1;
        this._playlist = [];
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

    registerClient(client) {
        client.onActions({
            "playlist:list": () => {
                return this._playlist;
            }
        });
    }
} 