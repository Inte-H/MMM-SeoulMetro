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
        let url = payload.apiURLFront + payload.apiKey + payload.apiURLBack + encodeURI(payload.statnNm);
        Log.log(`Requesting ${url} ...`);
        let upLine = [];
        let dnLine = [];

        axios.get(url)
            .then(response => {
                if (response.status === 200) {
                    let result = response.data;
                    result.realtimeArrivalList.forEach(element => {
                        let { trainLineNm, arvlMsg2 } = element;
                        trainLineNm = trainLineNm.split(' - ')[0];
                        arvlMsg2 = ((msg) => {
                            const regex = /^\[.+/;
                            if (regex.test(msg)) {
                                return msg.replace(/\[(\d+)\]번째 전역.+/, '$1번째 전역');
                            }
                            return msg.replace(/역 도착/, '');
                        })(arvlMsg2);
                        Log.log(trainLineNm, arvlMsg2);
                        switch (element.updnLine) {
                            case "상행":
                                upLine = [...upLine, {
                                    trainLineNm,
                                    arvlMsg2
                                }];
                                break;

                            case "하행":
                                dnLine = [...dnLine, {
                                    trainLineNm,
                                    arvlMsg2
                                }];
                                break;
                        }
                        this.sendSocketNotification("STATION_ARRIVAL_INFO", { upLine, dnLine });
                    });
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