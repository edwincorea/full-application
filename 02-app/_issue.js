var Rx = require("rxjs");

//solution for unsafe subscriptions issue
Rx.Observable.prototype.safeSubscribe = function(next, error, complete) {
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

//simulate an event handler on a socket.io connection 
const hot = Rx.Observable.interval(1000)
    .publish();

hot.connect();

hot.subscribe(i => console.log(`One: ${i}`));    
hot.subscribe(i => console.log(`Two: ${i}`));

setTimeout(() => {
    hot.subscribe(i => console.log(`Three: ${i}`));
}, 3000);

// setTimeout(() => {
     //this subscription gets terminated but it shouldn't affect others
//     hot.subscribe(() => {
//         throw new Error("What Now?");
//     });
// }, 3000);

//that's false. The error thrown was propagated back up the call stack

//... so how to throw an error without affecting the other subscriptions?
//Safe Subscribe 

setTimeout(() => {
    //this subscription gets terminated but it shouldn't affect others
    hot.safeSubscribe(() => {
        throw new Error("What Now?");
    });
}, 3000);
