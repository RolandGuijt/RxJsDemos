const { fromEvent, interval, from, Observable } = rxjs;
const { map, filter, distinctUntilChanged, throttle, switchMap } = rxjs.operators;

const input = document.getElementById("input");
const output = document.getElementById("output");

const searchResults = (value) => {
    const startDate = new Date().toDateString();
    let events = [
        `${startDate} 10:11: Phone boot`,
        `${startDate} 10:35: Moved 32 meters SSW`,
        `${startDate} 10:39: Moved 342 m N`,
        `${startDate} 10:49: Moved 412 m NNW`,
        `${startDate} 11:01: Stopped at new location: Antwerp: Lucky Strike Bar`,
        `${startDate} 11:25: Credit card transaction: Eur. 11,10`,
        `${startDate} 11:27: Moved 1.2 km S`,
        `${startDate} 11:35: Moved 302 m S`,
        `${startDate} 11:38: Moved 302 m S`,
        `${startDate} 11:43: Stopped at new location: Antwerp: Nathan's liquor`,
        `${startDate} 11:25: Credit card transaction: Eur. 9,35`,
        `${startDate} 11:55: Moved 365 m N`,
        `${startDate} 11:59: Moved 542 m SSW`,
        `${startDate} 12:02: Stopped at new location: Antwerp: Kinepolis`
    ];
    results = [];
    for (var i = 0; i < events.length; i++) {
        if (events[i].toLowerCase().indexOf(value) !== -1)
            results.push(events[i]);
    }
    output.innerHTML = "";
    return from(results);
}

const observable = fromEvent(input, "keyup").pipe(
    map(() => input.value.toLowerCase()),
    filter(t => t.length > 3),
    distinctUntilChanged(),
    throttle(t => interval(700)),
    //can use mergeMap instead if every hit must complete
    switchMap(searchResults),
    log("Incoming value: ")
);

observable.subscribe(result => {
    output.innerHTML += (result + "<br/>");
});





function log(message) {
    // notice that we return a function here
    return source => {
      return Observable.create(observer => {
        const wrapper = {
            next: value => {
              console.log(message, value);
              observer.next(value);
            },
            error: observer.error,
            complete: observer.complete
          }
  
        return source.subscribe(wrapper);
     });
    }
  }