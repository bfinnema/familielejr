angular.module('familielejr').factory('AuthService',
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

}]);