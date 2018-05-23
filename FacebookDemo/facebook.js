const { from, interval, zip } = rxjs;
const { delay } = rxjs.operators;

randomPersonClick = () => {
    setTimeout(() => {
        let input = document.getElementById("person");
        input.value = "Maarten Balliauw";
    }, 900)
}

locationClick = () => {
    setTimeout(() => {
        let input = document.getElementById("location");
        input.value = "Kinepolis Antwerp, room 7";
    }, 2000)
}

rangeChange = (value) => {
    let element = document.getElementById("range");
    element.innerHTML = `${value} km`;
}

hoursChange = (value) => {
    let element = document.getElementById("hoursAgo");
    element.innerHTML = value;
}

startTracking = (value) => {
    let list = document.getElementById("list");
    let startDate = new Date().toDateString();
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

    function addItemToList(item) {
        let li = document.createElement("li");
        li.appendChild(document.createTextNode(item));
        list.appendChild(li);
    }

    var timerObservable = interval(1500);
    var arrayObservable = from(events);
    var zipObservable = zip(timerObservable, arrayObservable, (t, a) => a);
    zipObservable.subscribe(
        (s) => addItemToList(s),
        (e) => addItemToList(e),
        () => addItemToList("Complete")
    );
}