angular.module('familielejr')

.factory('AuthService',
['$q', '$timeout', '$http',
function ($q, $timeout, $http) {

    // create user variable
    var user = null;
    var role = 2;

    // return available functions for use in the controllers
    return ({
        isLoggedIn: isLoggedIn,
        userRole: userRole,
        getUserStatus: getUserStatus
    });

    function isLoggedIn() {
        if(user) {
            return true;
        } else {
            return false;
        }
    };

    function userRole() {
        if(user) {
            return role;
        } else {
            return 400;
        }
    };

    function getUserStatus() {
        var token;
        if (localStorage.userToken) {
            token = localStorage.userToken;
        } else {
            token = '123';
        };
        return $http({
            method: 'GET',
            url: '/users/me',
            headers: {
                'x-auth': token
            }
        }).then(function(response) {
            // console.log(`getUserStatus: ${response.status}`);
            // console.log(response.data._id, response.data.email, response.data.role);
            if (response.data._id === localStorage.familielejrUserId) {
                user = true;
                role = response.data.role;
                // console.log(`Role: ${role}`);
            } else {
                user = false;
            };
        }, function errorCallback(response) {
            // console.log(`getUserStatus: ${response.status}`);
            user = false;
        });
    };

}])

.factory('listOfItemsML',[function() {
    return({
        prepareList: prepareList,
        addItem: addItem,
        removeItem: removeItem,
        prepareEdit: prepareEdit
    });

    function prepareList(listName, numItems, numTextLines, numNumericLines) {
        itemsL0 = [];
        itemsL1 = [];
        itemL1BtnShow = [];
        itemL1Show = [];
        itemL2BtnShow = [];
        itemL2Show = [];
        for (i=0; i<numItems[0]; i++) {
            itemsL0.push(i+1);
            if (numItems[1] > 0) {
                itemsL10 = [];
                for (j=0; j<numItems[1]; j++) {
                    itemsL10.push(j+1);
                }
            }
        }
        return prepareList;
    };

    function addItem() {
        return addItem;
    };

    function removeItem() {
        return removeItem;
    };

    function prepareEdit() {
        return prepareEdit;
    };
    
}])

.factory('listOfItemsSL',[function() {
    return({
        prepareList: prepareList,
        addItem: addItem,
        removeItem: removeItem,
        prepareEdit: prepareEdit
    });

function prepareList(numItems, subjectStructure) {
    // console.log(`numItems: ${numItems}, subjectStructure: ${subjectStructure}, length: ${subjectStructure.length}`);
    var numItemsUsed = 0;
    var itemsL0 = [];
    var itemL0BtnShow = [];
    var itemL0Show = [];
    var subjects = []
    for (var j=0; j<subjectStructure.length; j++) {
        // console.log(`subject: ${subjectStructure[j]}`);
        var sl = [];
        for (var i=0; i<numItems[0]; i++) {
            sl.push(subjectStructure[j]);
        };
        subjects.push(sl);
        // console.log(`subjects in loop: ${subjects}`);
    };
    // console.log(`${subjects}`);
    for (var i=0; i<numItems[0]; i++) {
        itemsL0.push(i);
        if (i == 0) {
            itemL0BtnShow.push(false);
            itemL0Show.push(true);
        } else if (i == 1) {
            itemL0BtnShow.push(true);
            itemL0Show.push(false);
        } else {
            itemL0BtnShow.push(false);
            itemL0Show.push(false);
        };
    };
    // console.log(`itemsL0: ${itemsL0}`);
    // console.log(`itemL0BtnShow: ${itemL0BtnShow}`);
    // console.log(`itemL0Show: ${itemL0Show}`);
    // console.log(`Subjects: ${subjects}`);
    return [itemsL0, itemL0BtnShow, itemL0Show, subjects, numItemsUsed];

};
    function addItem(itemStructure) {
        /* if (itemStructure[4] < 1) {
            itemStructure[2][itemStructure[4]+1] = true;
        }; */
        itemStructure[2][itemStructure[4]+1] = true;
        itemStructure[1][itemStructure[4]] = false;
        if (itemStructure[4]+1 < itemStructure[0].length) {
            itemStructure[1][itemStructure[4]+1] = true;
        };
        itemStructure[4] += 1;
        return itemStructure;
    };

    function removeItem(numOrgToRemove, itemStructure) {
        // console.log(`itemL0Text: ${itemStructure[3]}, itemL0Text0: ${itemStructure[3][0]}`);
        for (var i=0; i<itemStructure[3].length; i++) {
            for (var j=numOrgToRemove; j<itemStructure[3][i].length; j++) {
                itemStructure[3][i][j] = itemStructure[3][i][j+1];
            };
            itemStructure[3][i][itemStructure[4]] = "";
        };
        // console.log(`itemL0Text: ${itemStructure[3]}, itemL0Text0: ${itemStructure[3][0]}`);
        itemStructure[2][itemStructure[4]] = false;
        itemStructure[1][itemStructure[4]] = true;
        itemStructure[1][itemStructure[4]+1] = false;
        itemStructure[4] = itemStructure[4] - 1;
        // console.log(`Number of items: ${itemStructure[4]}`);
        return itemStructure;
    };

    function prepareEdit(numItemsUsed, itemStructure) {
        // console.log(`In Services. numItemsUsed: ${numItemsUsed}`);
        // console.log(`texts: ${itemStructure[3]}`);
        /* for (var i=0; i<itemStructure[3][0].length; i++) {
            console.log(`ITEM: ${itemStructure[3][0][i]}`);
        }; */
        for (var i=0; i<numItemsUsed+1; i++) {
            itemStructure[2][i] = true;
            itemStructure[1][i] = false;
            if (i<itemStructure[0].length-1) {itemStructure[1][i+1] = true;};
        };
        itemStructure[4] = numItemsUsed;
        return itemStructure;
    };
    
}])

.factory('ProfileService',[function() {
    return({
        countries: countries,
        floors: floors,
        directions: directions
    });

    function countries() {
        return [
            {"name": "Danmark"},
            {"name": "Sverige"},
            {"name": "Tyskland"},
            {"name": "Norge"},
            {"name": "Finland"},
            {"name": "Holland"},
            {"name": "Belgien"},
            {"name": "Spanien"},
            {"name": "Italien"},
            {"name": "Frankrig"},
            {"name": "Grækenland"},
            {"name": "Polen"},
            {"name": "UK"},
            {"name": "Irland"},
            {"name": "Brasilien"},
            {"name": "Syd-Sudan"},
            {"name": "Langtbortistan"},
            {"name": "Jylland"},
            {"name": "USA"},
            {"name": "Statsløs"},
            {"name": "Lorteland!"}
        ];
    };

    function floors() {
        return [
            {"floor": ""},
            {"floor": "st."},
            {"floor": "1."},
            {"floor": "2."},
            {"floor": "3."},
            {"floor": "4."},
            {"floor": "5."},
            {"floor": "6."},
            {"floor": "7."},
            {"floor": "8."},
            {"floor": "9."},
            {"floor": "10."},
            {"floor": "11."},
            {"floor": "12."},
            {"floor": "13."},
            {"floor": "14."},
            {"floor": "15."},
            {"floor": "Højt oppe"}
        ];
    }

    function directions() {
        return [
            {"dir": ""},
            {"dir": "th."},
            {"dir": "tv."},
            {"dir": "mf."}
        ];
    };
    
}])

.factory('SearchService',[function() {
    return({
        searchcriterias: searchcriterias
    });

    function searchcriterias() {
        return [
            {"name": "Fornavn"},
            {"name": "Efternavn"},
            {"name": "email"}
        ];
    };

}])

.factory('EventregService',[function() {
    return({
        numDays: numDays,
        arrivalOptions: arrivalOptions,
        departureOptions: departureOptions
    });

    function numDays(arrival, departure) {
        numDays = 1;
        if (departure == "Søndag" || departure == "Søndag efter frokost" || departure == "Jeg tager aldrig hjem!!" || departure == "Lørdag efter aftensmad") {
            // "Søndag efter frokost" is the for historic reasons
            if (arrival == "Fredag" || arrival == "Fredag eftermiddag") {
                numDays = 2;
            };
        };
        return numDays;
    };

    function arrivalOptions(esDate, sTime, eeDate, eTime) {
        var eventStartDate = new Date(esDate);
        var startTime = new Date(sTime);
        var eventEndDate = new Date(eeDate);
        var endTime = new Date(eTime);
        var startYear = eventStartDate.getFullYear();
        var startMonth = eventStartDate.getMonth();
        var startDate = eventStartDate.getDate();
        // console.log(`Startdate: ${eventStartDate.toLocaleString('da-DK', {timeZone: 'Europe/Copenhagen'})}`);
        // console.log(`Enddate: ${eventEndDate.toLocaleString('da-DK', {timeZone: 'Europe/Copenhagen'})}`);
        var diffInDays = Math.round((eventEndDate.getTime() - eventStartDate.getTime())/(1000*3600*24));
        // console.log(`Diff in days: ${diffInDays}`);
        var days = ["Søndag", "Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag"];
        // console.log(`Startday of the week ${eventStartDate.getDay()}: ${days[eventStartDate.getDay()]}`);
        // console.log(`Endday of the week ${eventEndDate.getDay()}: ${days[eventEndDate.getDay()]}`);

        var arrivalOptions = [];

        if (eventStartDate.getDate() != eventEndDate.getDate()) {
            if (startTime.getHours() < 12) {
                arrivalOptions.push({"arrivalOption": days[eventStartDate.getDay()] + " formiddag"});
            };
            if (startTime.getHours() < 20) {
                arrivalOptions.push({"arrivalOption": days[eventStartDate.getDay()] + " eftermiddag"});
            };
            if (startTime.getHours() < 24) {
                arrivalOptions.push({"arrivalOption": days[eventStartDate.getDay()] + " efter aftensmad"});
            };
            var i=0;
            while (i<diffInDays) {
                theDate = new Date(startYear, startMonth, startDate + 1 + i);
                if (eventEndDate.getDate() == theDate.getDate()) {
                    if (endTime.getHours > 12) {
                        arrivalOptions.push({"arrivalOption": days[theDate.getDay()] + " formiddag"});
                    };
                } else {
                    arrivalOptions.push({"arrivalOption": days[theDate.getDay()] + " formiddag"});
                    arrivalOptions.push({"arrivalOption": days[theDate.getDay()] + " eftermiddag"});
                    arrivalOptions.push({"arrivalOption": days[theDate.getDay()] + " efter aftensmad"});
                };
                i++;
            };
        };

        return arrivalOptions;
    };

    function departureOptions(esDate, sTime, eeDate, eTime) {
        var eventStartDate = new Date(esDate);
        var eventEndDate = new Date(eeDate);
        var endTime = new Date(eTime);
        var startYear = eventStartDate.getFullYear();
        var startMonth = eventStartDate.getMonth();
        var startDate = eventStartDate.getDate();
        // console.log(`Startdate: ${eventStartDate.toLocaleString('da-DK', {timeZone: 'Europe/Copenhagen'})}`);
        // console.log(`Enddate: ${eventEndDate.toLocaleString('da-DK', {timeZone: 'Europe/Copenhagen'})}`);
        var diffInDays = Math.round((eventEndDate.getTime() - eventStartDate.getTime())/(1000*3600*24));
        // console.log(`Diff: ${eventEndDate.getTime() - eventStartDate.getTime()}. Diff in days: ${diffInDays}`);
        var days = ["Søndag", "Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag"];

        var departureOptions = [];

        if (eventStartDate.getDate() != eventEndDate.getDate()) {
            var i=0;
            while (i<diffInDays) {
                theDate = new Date(startYear, startMonth, startDate + 1 + i);
                if (eventEndDate.getDate() == theDate.getDate()) {
                    if (endTime.getHours > 12) {
                        departureOptions.push({"departureOption": days[theDate.getDay()] + " formiddag"});
                        departureOptions.push({"departureOption": days[theDate.getDay()] + " eftermiddag"});
                    } else {
                        departureOptions.push({"departureOption": days[theDate.getDay()]});
                    }
                    if (endTime.getHours > 18) {
                        departureOptions.push({"departureOption": days[theDate.getDay()] + " efter aftensmad"});
                    };
                } else {
                    departureOptions.push({"departureOption": days[theDate.getDay()] + " formiddag"});
                    departureOptions.push({"departureOption": days[theDate.getDay()] + " eftermiddag"});
                    departureOptions.push({"departureOption": days[theDate.getDay()] + " efter aftensmad"});
                };
                i++;
            };
        };
        departureOptions.push({"departureOption": "Jeg tager aldrig hjem!!"});

        return departureOptions;
    };
}])

.factory('YearService',[function() {
    return({
        myYear: myYear
    });

    function myYear(requester) {
        // console.log(`requester: ${requester}`);
        var defaultDemarcationMonth = 10;
        var defaultDemarcationDate = 15;
        var demarcationMonth;
        var demarcationDate
        switch(requester) {
            case "eventReg":
                demarcationMonth = defaultDemarcationMonth;
                demarcationDate = defaultDemarcationDate;
                break;
            case "eventRegAll":
                demarcationMonth = defaultDemarcationMonth;
                demarcationDate = defaultDemarcationDate;
                break;
            case "invitation":
                demarcationMonth = defaultDemarcationMonth;
                demarcationDate = defaultDemarcationDate;
                break;
            case "invitationAdmin":
                demarcationMonth = defaultDemarcationMonth;
                demarcationDate = defaultDemarcationDate;
                break;
            case "about":
                demarcationMonth = defaultDemarcationMonth;
                demarcationDate = defaultDemarcationDate;
                break;
            case "accounting":
                demarcationMonth = defaultDemarcationMonth;
                demarcationDate = defaultDemarcationDate;
                break;
            case "camplist":
                demarcationMonth = defaultDemarcationMonth;
                demarcationDate = defaultDemarcationDate;
                break;
            case "futurecamps":
                demarcationMonth = defaultDemarcationMonth;
                demarcationDate = defaultDemarcationDate;
                break;
            case "eventsadmin":
                demarcationMonth = defaultDemarcationMonth;
                demarcationDate = defaultDemarcationDate;
                break;
            case "home":
                demarcationMonth = defaultDemarcationMonth;
                demarcationDate = defaultDemarcationDate;
                break;
            case "default":
                demarcationMonth = defaultDemarcationMonth;
                demarcationDate = defaultDemarcationDate;
                break;
            default:
                demarcationMonth = defaultDemarcationMonth;
                demarcationDate = defaultDemarcationDate;
        };
        var currentyear = (new Date()).getFullYear();
        var now = new Date();
        var demarc = new Date(currentyear,demarcationMonth,demarcationDate);
        var lastDateOfYear = new Date(currentyear,11,31);
        var year = currentyear;
        if (now > demarc && lastDateOfYear >= now) {
            year += 1;
        };
        // console.log(`Demarc: ${demarc}, Year: ${year}`);
        return year;
    };

}])

.factory('ConfigService',
['$http', function ($http) {

    var googleMapKey = "";

    // return available functions for use in the controllers
    return ({
        getGoogleMapKey: getGoogleMapKey,
        getConfig: getConfig
    });

    function getGoogleMapKey() {
        return googleMapKey;
    };

    function getConfig() {
        return $http({
            method: 'GET',
            url: 'config.json'
        }).then(function(response) {
            // console.log(`getConfig: ${response.status}`);
            // console.log(response.data.googleMapKey);
            googleMapKey = response.data.googleMapKey;
        }, function errorCallback(response) {
            console.log(`getConfig error status: ${response.status}`);
            user = false;
        });
    };

}])
