const NodeHelper = require("node_helper");
const axios = require("axios");
const Log = require("logger");

module.exports = NodeHelper.create({
    loaded: function () {
        Log.log(this.name + ' is loaded!');
    },

    start: function () {
        Log.log(this.name + ' is started!');
    },

    getStationArrivalInfo: function (payload) {
        const url = payload.apiURLFront + payload.apiKey + payload.apiURLBack + encodeURI(payload.statnNm);
        Log.log(`Requesting...`);
        let upLine = [];
        let dnLine = [];
        const previousStation = new Set();
        const nextStation = new Set();

        axios.get(url)
            .then(response => {
                if (response.status === 200) {
                    const result = response.data;
                    result.realtimeArrivalList.forEach(element => {
                        const { trainLineNm, arvlMsg2 } = element;
                        const [trainLineName, direction] = trainLineNm.split(' - ');
                        const arrivalMessage = ((msg) => {
                            const regex = /^\[.+/;
                            if (regex.test(msg)) {
                                return msg.replace(/\[(\d+)\]번째 전역.+/, '$1번째 전역');
                            }
                            return msg.replace(/역 도착/, '');
                        })(arvlMsg2);
                        const updnDirection = ((e) => {
                            const regex = /방면.*$/;
                            return e.replace(regex, "");
                        })(direction);


                        switch (element.updnLine) {
                            case "상행":
                                upLine = [...upLine, {
                                    trainLineName,
                                    arrivalMessage
                                }];
                                nextStation.add(updnDirection);
                                break;

                            case "하행":
                                dnLine = [...dnLine, {
                                    trainLineName,
                                    arrivalMessage
                                }];
                                previousStation.add(updnDirection);
                                break;
                        }
                    });
                    this.sendSocketNotification("STATION_ARRIVAL_INFO", { upLine, dnLine, previousStation: [...previousStation], nextStation: [...nextStation] });
                }
            })
            .catch(error => {
                console.error("Error fetching station arrival info:", error);
            });
    },

    socketNotificationReceived: function (notification, payload) {
        switch (notification) {
            case "GET_STATION_ARRIVAL_INFO":
                this.getStationArrivalInfo(payload);
                break;
        }
    },
});