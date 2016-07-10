import {Observable} from "rxjs";

//Service class for using YT API and getting information about the Video.
export class YoutubeService {
    
    //mock up service
    process$(url) {
        return Observable.of({
            title: `Test1 - ${url}`,
            type: "youtube",
            url: url,
            totalTime: 500
        }).delay(400);
    }
}