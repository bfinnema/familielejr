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

.factory('YearService',[function(demarcationMonth) {
    return({
        myYear: myYear
    });

    function myYear(demarcationMonth) {
        console.log(`demarcationMonth: ${demarcationMonth}`);
        var currentyear = (new Date()).getFullYear();
        var now = new Date();
        var demarc = new Date(currentyear,demarcationMonth,1);
        var lastDateOfYear = new Date(currentyear,11,31);
        var year = currentyear;
        if (now > demarc && lastDateOfYear >= now) {
            year += 1;
        };
        return year;
    };

}])