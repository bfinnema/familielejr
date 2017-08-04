angular.module('familielejr')

.controller('eventregCtrl', ['$scope', '$http', '$location', '$route', '$window', 'AuthService', function($scope, $http, $location, $route, $window, AuthService) {

    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
            $scope.role = AuthService.userRole();
        };
    });

    $scope.agegroups = [
        {"agegroup": "Barn under 12"},
        {"agegroup": "Voksen"}
    ];
    
    $scope.arrivaldays = [
        {"arrivalday": "Fredag"},
        {"arrivalday": "Lørdag formiddag"},
        {"arrivalday": "Lørdag eftermiddag"}
    ];
    
    $scope.departuredays = [
        {"departureday": "Søndag efter frokost"},
        {"departureday": "Søndag efter morgenmad"},
        {"departureday": "Lørdag formiddag"},
        {"departureday": "Lørdag eftermiddag"},
        {"departureday": "Lørdag efter aftensmad"},
        {"departureday": "Jeg tager aldrig hjem!!"}
    ];

    $http({
        method: 'GET',
        url: 'eventreg',
        headers: {
            'x-auth': localStorage.userToken
        }
    }).then(function(response) {
        console.log(`Status: ${response.status}`);
        console.log(response.data);
        $scope.registrations = response.data;
    }, function errorCallback(response) {
        console.log(`Status: ${response.status}`);
    });

    $scope.errorHappened = false;
    
    $scope.addEventreg = function() {
        console.log(`Name: ${$scope.regname}`)
        var eventreg = {
            name: $scope.regname,
            agegroup: $scope.agegroup,
            arrivalday: $scope.arrivalday,
            arrivaltime: $scope.arrivaltime,
            departureday: $scope.departureday,
            departuretime: $scope.departuretime
        };
        console.log(eventreg);

        $http({
            method: 'POST',
            url: 'eventreg',
            headers: {
                'x-auth': localStorage.userToken
            },
            data: eventreg
        }).then(function(response) {
            console.log(`Status: ${response.status}`);
            console.log(response.data._id);
            $scope.errorHappened = false;
            $location.path('/eventregistration');
            $route.reload();
        }, function errorCallback(response) {
            console.log(`Status: ${response.status}`);
            $scope.errorHappened = true;
        });
    };

    $scope.removeReg = function(registration) {
        if ($window.confirm('Bekræft venligst at du vil slette tilmelding af '+registration.name)) {
            $http({
                method: 'DELETE',
                url: 'eventreg/'+registration._id,
                headers: {
                    'x-auth': localStorage.userToken
                },
                data: eventreg
            }).then(function(response) {
                console.log(`Status: ${response.status}`);
                console.log(response.data._id);
                $scope.errorHappened = false;
                $location.path('/eventregistration');
                $route.reload();
            }, function errorCallback(response) {
                console.log(`Status: ${response.status}`);
                $scope.errorHappened = true;
            });
        };
    };

}])

.controller('eventregallCtrl', ['$scope', '$http', 'AuthService', function($scope, $http, AuthService) {

    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
            $scope.role = AuthService.userRole();
        };
    });

    $http({
        method: 'GET',
        url: 'eventregall'
    }).then(function(response) {
        // console.log(`Status: ${response.status}`);
        // console.log(response.data);
        $scope.registrations = response.data;
        $scope.dinners = [[0,0],[0,0]];
        $scope.breakfasts = [[0,0],[0,0]];
        $scope.lunchs = [[0,0],[0,0]];
        $scope.friday = [0,0];
        $scope.saturday = [0,0];
        $scope.sunday = [0,0];
        for (var i=0; i<$scope.registrations.length; i++) {
            console.log($scope.registrations[i].name);
            if ($scope.registrations[i].agegroup == "Voksen") {ag = 0;} else {ag = 1;};
            if ($scope.registrations[i].arrivalday == "Fredag") {
                $scope.dinners[ag][0] += 1;
                $scope.friday[ag] += 1;
                if ($scope.registrations[i].departureday == "Søndag efter frokost" || $scope.registrations[i].departureday == "Jeg tager aldrig hjem!!") {
                    $scope.dinners[ag][1] += 1;
                    $scope.breakfasts[ag][0] += 1;
                    $scope.breakfasts[ag][1] += 1;
                    $scope.lunchs[ag][0] += 1;
                    $scope.lunchs[ag][1] += 1;
                    $scope.saturday[ag] += 1;
                    $scope.sunday[ag] += 1;
                } else if ($scope.registrations[i].departureday == "Søndag efter morgenmad") {
                    $scope.dinners[ag][1] += 1;
                    $scope.breakfasts[ag][0] += 1;
                    $scope.breakfasts[ag][1] += 1;
                    $scope.lunchs[ag][0] += 1;
                    $scope.saturday[ag] += 1;
                    $scope.sunday[ag] += 1;
                } else if ($scope.registrations[i].departureday == "Lørdag efter aftensmad") {
                    $scope.dinners[ag][1] += 1;
                    $scope.breakfasts[ag][0] += 1;
                    $scope.lunchs[ag][0] += 1;
                    $scope.saturday[ag] += 1;
                } else if ($scope.registrations[i].departureday == "Lørdag eftermiddag") {
                    $scope.breakfasts[ag][0] += 1;
                    $scope.lunchs[ag][0] += 1;
                    $scope.saturday[ag] += 1;
                } else if ($scope.registrations[i].departureday == "Lørdag formiddag") {
                    $scope.breakfasts[ag][0] += 1;
                    $scope.saturday[ag] += 1;
                };
            } else if ($scope.registrations[i].arrivalday == "Lørdag formiddag") {
                if ($scope.registrations[i].departureday == "Søndag efter frokost" || $scope.registrations[i].departureday == "Jeg tager aldrig hjem!!") {
                    $scope.dinners[ag][1] += 1;
                    $scope.breakfasts[ag][1] += 1;
                    $scope.lunchs[ag][0] += 1;
                    $scope.lunchs[ag][1] += 1;
                    $scope.saturday[ag] += 1;
                    $scope.sunday[ag] += 1;
                } else if ($scope.registrations[i].departureday == "Søndag efter morgenmad") {
                    $scope.dinners[ag][1] += 1;
                    $scope.breakfasts[ag][1] += 1;
                    $scope.lunchs[ag][0] += 1;
                    $scope.saturday[ag] += 1;
                    $scope.sunday[ag] += 1;
                } else if ($scope.registrations[i].departureday == "Lørdag efter aftensmad") {
                    $scope.dinners[ag][1] += 1;
                    $scope.lunchs[ag][0] += 1;
                    $scope.saturday[ag] += 1;
                } else if ($scope.registrations[i].departureday == "Lørdag eftermiddag") {
                    $scope.lunchs[ag][0] += 1;
                    $scope.saturday[ag] += 1;
                };
            } else if ($scope.registrations[i].arrivalday == "Lørdag eftermiddag") {
                if ($scope.registrations[i].departureday == "Søndag efter frokost" || $scope.registrations[i].departureday == "Jeg tager aldrig hjem!!") {
                    $scope.dinners[ag][1] += 1;
                    $scope.breakfasts[ag][1] += 1;
                    $scope.lunchs[ag][1] += 1;
                    $scope.saturday[ag] += 1;
                    $scope.sunday[ag] += 1;
                } else if ($scope.registrations[i].departureday == "Søndag efter morgenmad") {
                    $scope.dinners[ag][1] += 1;
                    $scope.breakfasts[ag][1] += 1;
                    $scope.saturday[ag] += 1;
                    $scope.sunday[ag] += 1;
                } else if ($scope.registrations[i].departureday == "Lørdag efter aftensmad") {
                    $scope.dinners[ag][1] += 1;
                    $scope.saturday[ag] += 1;
                };
            };
        }
        console.log(`Voksne. Aftensmad fredag: ${$scope.dinners[0][0]}, lørdag: ${$scope.dinners[0][1]}`);
        console.log(`Voksne. Morgenmad lørdag: ${$scope.breakfasts[0][0]}, søndag: ${$scope.breakfasts[0][1]}`);
        console.log(`Voksne. Frokost lørdag: ${$scope.lunchs[0][0]}, søndag: ${$scope.lunchs[0][1]}`);
        console.log(`Børn. Aftensmad fredag: ${$scope.dinners[1][0]}, lørdag: ${$scope.dinners[1][1]}`);
        console.log(`Børn. Morgenmad lørdag: ${$scope.breakfasts[1][0]}, søndag: ${$scope.breakfasts[1][1]}`);
        console.log(`Børn. Frokost lørdag: ${$scope.lunchs[1][0]}, søndag: ${$scope.lunchs[1][1]}`);
    }, function errorCallback(response) {
        console.log(`Status: ${response.status}`);
    });

}])

