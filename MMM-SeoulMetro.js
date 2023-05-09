Module.register("MMM-SeoulMetro", {
    defaults: {
        apiURLFront: "http://swopenapi.seoul.go.kr/api/subway/",
        apiURLBack: "/json/realtimeStationArrival/0/5/",
        Interval: 1000 * 60,
    },

    loaded: function () {
        Log.log(this.name + ' is loaded!');
    },

    start: function () {
        Log.log(this.name + ' is started!');
        this.stationInfo = null;
        this.getStationArrivalInfo();
        setInterval(() => {
            this.getStationArrivalInfo();
        }, this.config.Interval);
    },

    getStationArrivalInfo: function () {
        Log.log("Requesting station arrival info...");
        this.sendSocketNotification("GET_STATION_ARRIVAL_INFO", this.config);
    },

    notificationReceived: function (notification, _, _) {
        switch (notification) {
            case "ALL_MODULES_STARTED":
                this.getStationArrivalInfo();
                Log.log(`${notification} notification received in ${this.name}.`);
                break;
            case "DOM_OBJECT_CREATED":
                setInterval(() => {
                    this.getStationArrivalInfo();
                }, this.config.Interval);
                Log.log(`${notification} notification received in ${this.name}.`);
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
        var wrapper = document.createElement("div");
        var table = document.createElement("table");
        var tableHead = document.createElement("thead");

        var stationNameRow = document.createElement("tr");
        stationNameRow.className = "stationName";
        var prevStation = document.createElement("td");
        prevStation.innerHTML = "보정";
        var station = document.createElement("td");
        station.innerHTML = this.config.statnNm;
        var nextStation = document.createElement("td");
        nextStation.innerHTML = "오리";
        stationNameRow.append(prevStation, station, nextStation)
        tableHead.appendChild(stationNameRow);

        var LineRow1 = document.createElement("tr");
        var upTrain1 = document.createElement("td");
        var dnTrain1 = document.createElement("td");
        var LineRow2 = document.createElement("tr");
        var upTrain2 = document.createElement("td");
        var dnTrain2 = document.createElement("td");
        var empty1 = document.createElement("td");
        var empty2 = document.createElement("td");
        var upTrains = [upTrain1, upTrain2];
        var dnTrains = [dnTrain1, dnTrain2];
        upTrains.forEach((train) => {
            if (this.stationInfo?.upLine) {
                [e, ...rest] = this.stationInfo.upLine;
                if (e) {
                    train.innerHTML = `${e.trainLineNm} ${e.arvlMsg2}`;
                    this.stationInfo.upLine = [...rest];
                }
            }
        });
        dnTrains.forEach((train) => {
            if (this.stationInfo?.dnLine) {
                [e, ...rest] = this.stationInfo.dnLine;
                if (e) {
                    train.innerHTML = `${e.trainLineNm} ${e.arvlMsg2}`;
                    this.stationInfo.upLine = [...rest];
                }
            }
        });
        LineRow1.append(upTrain1, empty1, dnTrain1);
        LineRow2.append(upTrain2, empty2, dnTrain2);

        table.append(tableHead, LineRow1, LineRow2);
        wrapper.appendChild(table);
        return wrapper;
    }
});