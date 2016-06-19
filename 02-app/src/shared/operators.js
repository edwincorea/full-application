import {Observable} from "rxjs";

//solution for unsafe subscriptions issue
Observable.prototype.safeSubscribe = function(next, error, complete) {
    const subscription = this.subscribe(
        item => {
            try {
                next(item);
            } catch(e) {
                console.error(e.stack || e);
                subscription.unsubscribe();
            }

        }, 
        error, 
        complete);

    return subscription;
};

Observable.prototype.catchWrap = function() {
    return this.catch(error => Observable.of({error: error}));
};
