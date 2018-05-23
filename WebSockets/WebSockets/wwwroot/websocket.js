
const { Observable } = rxjs;
const { webSocket } = rxjs.webSocket;
const { map, retryWhen, scan, takeWhile, delay } = rxjs.operators;

var connectionUrl = document.getElementById("connectionUrl");
var connectButton = document.getElementById("connectButton");
var unsubscribeButton = document.getElementById("unsubscribeButton");
var commsLog = document.getElementById("commsLog");
var socket, observable, subscription;
var scheme = document.location.protocol === "https:" ? "wss" : "ws";
var port = document.location.port ? (`:${document.location.port}`) : "";
connectionUrl.value = scheme + "://" + document.location.hostname + port + "/ws";

unsubscribeButton.onclick = function() {
    console.log(subscription);
    if (subscription)
        subscription.unsubscribe();
}

connectButton.onclick = function() {
    function addItemToList(item) {
        commsLog.innerHTML += `<tr><td class="commslog-data">${item}</td></tr>`;
    }

    //vanilla();

    const observable = getMagicObservable();
    //actually not an observable but a subject
    //observable.next(JSON.stringify("message"))

    //const observable = getDoItYourselfObservable();

    subscription = observable.subscribe(
        nextItem => {
            addItemToList(nextItem);
        },
        (e) => console.log(e),
        () => console.log("Complete")
    );

    //or
    const observer = {
        next(s) {
            addItemToList(s);
        },
        error(e) {
            addItemToList(e);
        },
        complete() {
            addItemToList("Complete");
        }
    };

    //observable.subscribe(observer);

    function vanilla() {
        socket = new WebSocket(connectionUrl.value);
        socket.onerror = () => {
            console.log("Error");
        };

        socket.onmessage = event => {
            addItemToList(event.data);
        };
    }


    function getMagicObservable() {
        return webSocket(connectionUrl.value);
    }

    function retryStrategy({attempts = 4, delay = 1000} = {}) {
        return function(errors) {
            return errors.pipe(
                scan((acc, value) => {
                        acc += 1;
                        if (acc < attempts) {
                            return acc;
                        } else {
                            throw new Error(value);
                        }
                    },
                    0),
                takeWhile(acc => acc < attempts),
                delay(delay)
            );
        }
    }

    function getDoItYourselfObservable() {
        var ws = new WebSocket(connectionUrl.value);

        return Observable.create(observer => {
            ws.onmessage = observer.next.bind(observer);
            ws.onerror = observer.error.bind(observer);
            ws.onclose = observer.complete.bind(observer);

            // Return way to unsubscribe
            return ws.close.bind(ws);
        }).pipe(map(m => JSON.parse(m.data)), retryWhen(retryStrategy()));
    }
};