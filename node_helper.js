const NodeHelper = require("node_helper");
const request = require('request');
const Log = require("logger");

module.exports = NodeHelper.create({
    loaded: function () {
        Log.log(this.name + ' is loaded!');
    },

    start: function () {
        Log.log(this.name + ' is started!');
    },

    getStationArrivalInfo: function (payload) {
        var url = payload.apiURLFront + payload.apiKey + payload.apiURLBack + encodeURI(payload.statnNm);
        Log.log(`Requesting ${url} ...`);
        var upLine = [];
        var dnLine = [];
        request({
            url: url,
            method: 'GET'
        }, (error, response, body) => {
            if (!error & response.statusCode === 200) {
                var result = JSON.parse(body);
                result.realtimeArrivalList.forEach(element => {
                    const { trainLineNm, arvlMsg2 } = element;
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
            } else {

            }
        })
    },

    socketNotificationReceived: function (notification, payload) {
        switch (notification) {
            case "GET_STATION_ARRIVAL_INFO":
                this.getStationArrivalInfo(payload);
                break;
        }
    },
});