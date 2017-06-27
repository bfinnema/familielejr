angular.module('familielejr')

.controller('eventregCtrl', ['$scope', '$http', '$location', '$route', '$window', 'AuthService', function($scope, $http, $location, $route, $window, AuthService) {

    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
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
        {"departureday": "Søndag"},
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
        }
    };

}])

.controller('eventregallCtrl', ['$scope', '$http', '$location', '$route', '$window', 'AuthService', function($scope, $http, $location, $route, $window, AuthService) {

    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
        };
    });

    $http({
        method: 'GET',
        url: 'eventregall'
    }).then(function(response) {
        console.log(`Status: ${response.status}`);
        console.log(response.data);
        $scope.registrations = response.data;
    }, function errorCallback(response) {
        console.log(`Status: ${response.status}`);
    });

}])
