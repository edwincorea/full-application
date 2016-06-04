import {ModuleBase} from "../lib/module";

export class PlaylistModule extends ModuleBase {
    constructor(io, usersModule, playlistRepository, videoServices) {
        super();
        this._io = io;
        this._users = usersModule; //authentication
        this._repository = playlistRepository; //load and save playlist data to the DB
        this._services = videoServices; //locate videos (YT, Vimeo, etc.)
    }
} 