import {Observable} from "rxjs";
import request from "request";

//helper wrapper function handling Google API JSON responses
export function getJson$(url) {
    return new Observable(observer => {
        request(url, (error, response, body) => {
            if (error) {
                observer.error(error);
                return;
            }

            observer.next(JSON.parse(body));
            observer.complete();
        });
    });
}