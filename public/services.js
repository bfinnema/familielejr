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
        ageGroups: ageGroups,
        arrivalDays: arrivalDays,
        departureDays: departureDays
    });

    function ageGroups() {
        return [
            {"agegroup": "Voksen"},
            {"agegroup": "Barn under 12"},
            {"agegroup": "Barn under 3"}
        ];
    };

    function arrivalDays() {
        return [
            {"arrivalday": "Fredag"},
            {"arrivalday": "Lørdag formiddag"},
            {"arrivalday": "Lørdag eftermiddag"}
        ];
    };

    function departureDays() {
        return [
            {"departureday": "Søndag"},
            {"departureday": "Lørdag formiddag"},
            {"departureday": "Lørdag eftermiddag"},
            {"departureday": "Lørdag efter aftensmad"},
            {"departureday": "Jeg tager aldrig hjem!!"}
        ];
    };
}])

.factory('YearService',[function() {
    return({
        myYear: myYear
    });

    function myYear(demarcationMonth, demarcationDate) {
        // console.log(`demarcationMonth: ${demarcationMonth}`);
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

.factory('NumDaysService',[function() {
    return({
        numDays: numDays
    });

    function numDays(arrival, departure) {
        var numDays = 1;
        if (departure == "Søndag" || departure == "Søndag efter frokost" || departure == "Jeg tager aldrig hjem!!") {
            if (arrival == "Fredag" || arrival == "Lørdag formiddag") {
                numDays = 2;
            };
        } else if (departure == "Søndag efter morgenmad" || departure == "Lørdag efter aftensmad") {
            if (arrival == "Fredag") {
                numDays = 2;
            };
        };
        return numDays;
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
