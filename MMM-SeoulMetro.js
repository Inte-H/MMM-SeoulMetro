Module.register("MMM-SeoulMetro", {
    defaults: {
        apiURLFront: "http://swopenapi.seoul.go.kr/api/subway/",
        apiURLBack: "/json/realtimeStationArrival/0/5/",
        Interval: 1000 * 60,
    },

    getStyles: function () {
        return ["MMM-SeoulMetro.css"]
    },

    loaded: function () {
        Log.log(this.name + ' is loaded!');
    },

    start: function () {
        Log.log(this.name + ' is started!');
        this.stationInfo = {};
        this.getStationArrivalInfo();
        setInterval(() => {
            this.getStationArrivalInfo();
        }, this.config.Interval);
    },

    getStationArrivalInfo: function () {
        Log.log("Requesting station arrival info...");
        this.sendSocketNotification("GET_STATION_ARRIVAL_INFO", this.config);
    },

    notificationReceived: function (notification) {
        switch (notification) {
            case "ALL_MODULES_STARTED":
                this.getStationArrivalInfo();
                break;
            case "DOM_OBJECT_CREATED":
                setInterval(() => {
                    this.getStationArrivalInfo();
                }, this.config.Interval);
                break;
        }
    },

    socketNotificationReceived: function (notification, payload) {
        switch (notification) {
            case "STATION_ARRIVAL_INFO":
                this.stationInfo = payload;
                Log.log(`${notification} socket notification received in ${this.name}.`);
                this.updateDom();
                break;
        }
    },

    getDom: function () {
        let { previousStation, nextStation } = this.stationInfo;
        if (previousStation)
            previousStation = [...previousStation].join(',');
        if (nextStation)
            nextStation = [...nextStation].join(',');
        const container = document.createElement('div');
        container.className = 'container';

        const stationRow = this.createDOMElement('div', 'stationrow');

        const previousTrain = this.createDOMElement('div', 'direction', previousStation);
        const currentStation = this.createDOMElement('div', 'station', this.config.statnNm);
        const nextTrain = this.createDOMElement('div', 'direction', nextStation);

        stationRow.append(previousTrain, currentStation, nextTrain);
        container.appendChild(stationRow);

        for (let i = 0; i < 2; i++) {
            const timetable = this.createTimetableRow(this.stationInfo);
            container.appendChild(timetable);
        }

        return container;
    },

    createTimetableRow: function (stationInfo) {
        const { upLine = [], dnLine = [] } = stationInfo;
        const timetableRow = this.createDOMElement('div', 'timetable');

        const [upLineFirst = {}, ...upLineRest] = upLine;
        const { trainLineName: upTrainLineName = '', arrivalMessage: upArrivalMessage = '' } = upLineFirst;
        this.stationInfo.upLine = upLineRest;

        const timeElem1 = this.createDOMElement('div', 'time', `${upTrainLineName} ${upArrivalMessage}`);

        const station = this.createDOMElement('div', 'station');

        const [dnLineFirst = {}, ...dnLineRest] = dnLine;
        const { trainLineName: dnTrainLineName = '', arrivalMessage: dnArrivalMessage = '' } = dnLineFirst;
        this.stationInfo.dnLine = dnLineRest;

        const timeElem2 = this.createDOMElement('div', 'time', `${dnTrainLineName} ${dnArrivalMessage}`);

        timetableRow.append(timeElem1, station, timeElem2);
        return timetableRow;

    },

    createDOMElement: function (tagName, className, textContent) {
        const element = document.createElement(tagName);
        if (className) {
            element.className = className;
        }
        if (textContent) {
            element.textContent = textContent;
        }
        return element;
    },
});
