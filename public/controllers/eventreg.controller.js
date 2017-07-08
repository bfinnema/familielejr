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

.controller('eventregallCtrl', ['$scope', '$http', 'AuthService', function($scope, $http, AuthService) {

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

.controller('eventinfoCtrl', ['$scope', '$http', 'uiGmapGoogleMapApi', 'uiGmapIsReady', 'AuthService', function($scope, $http, uiGmapGoogleMapApi,uiGmapIsReady, AuthService) {

    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
        };
    });

    $http.get('../json/invitation.json').then(function(response) {
        $scope.invitation = response.data;
        console.log(`Headline: ${$scope.invitation.headline}`);
        console.log($scope.invitation);
    });

    uiGmapGoogleMapApi.then(function (maps) {
        console.log('Google Maps loaded');
        // maps.visualRefresh = true;
        $scope.map = {
            center: {
                latitude: 55.199039,
                longitude: 11.514155
            },
            zoom: 16,
            pan: 1,
            options: $scope.mapOptions,
            control: {},
            events: {
                tilesloaded: function (maps, eventName, args) {},
                dragend: function (maps, eventName, args) {},
                zoom_changed: function (maps, eventName, args) {}
            }
        };
        console.log($scope.map); 

        $scope.googlemap = {};
    });

    $scope.windowOptions = {
        show: true
    };

    $scope.wincontent = "Hello";
    $scope.onClick = function (name, address, years, website) {
        //$scope.windowOptions.show = !$scope.windowOptions.show;
        $scope.windowOptions.show = true;
        //console.log('$scope.windowOptions.show: ', $scope.windowOptions.show);
        //console.log('Adressen er: ' + address +' Matrikel: ' + matrikel);
        $scope.wincontent = name + ', ' + address + '.  Var der: ' + years + '. ' + website;
        //console.log('wincontent: ' + $scope.wincontent);
    };

    $scope.closeClick = function () {
        $scope.windowOptions.show = true;
    };

    $scope.title = "Window Title!";

    uiGmapIsReady.promise() // if no value is put in promise() it defaults to promise(1)
    .then(function (instances) {
        console.log(instances[0].map); // get the current map
    })
        .then(function () {
        $scope.addMarkerClickFunction($scope.markers);
    });

    $scope.markers = [
        {
            "id": 1,
            "coords": {
                "latitude": 55.1993697,
                "longitude": 11.5146273
            },
            "name": "Bisseruplejren",
            "address": "Gammel Strandvej 135, 4243 Rude",
            "years": "2015, 2017",
            "website": "http://www.bisseruplejren.dk/"
        }
    ];

    $scope.addMarkerClickFunction = function (markersArray) {
        angular.forEach(markersArray, function (value, key) {
            value.onClick = function () {
                $scope.onClick(value.name, value.address, value.years, value.website);
                $scope.MapOptions.markers.selected = value;
            };
        });
    };

    $scope.MapOptions = {
        minZoom: 15,
        zoomControl: false,
        draggable: true,
        navigationControl: false,
        mapTypeControl: false,
        scaleControl: false,
        streetViewControl: false,
        disableDoubleClickZoom: false,
        keyboardShortcuts: true,
        markers: {
            selected: {}
        },
        styles: [{
            featureType: "poi",
            elementType: "labels",
            stylers: [{
                visibility: "off"
            }]
        }, {
            featureType: "transit",
            elementType: "all",
            stylers: [{
                visibility: "off"
            }]
        }],
    };
}])
