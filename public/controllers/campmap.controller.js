angular.module('familielejr')

.controller('campmapCtrl', ['$scope', '$http', 'uiGmapGoogleMapApi', 'uiGmapIsReady', 'AuthService', function($scope, $http, uiGmapGoogleMapApi, uiGmapIsReady, AuthService) {
    // console.log('This is the maps controller');

    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
            $scope.role = AuthService.userRole();
        };
    });

    uiGmapGoogleMapApi.then(function (maps) {
        // console.log('Google Maps loaded');
        // maps.visualRefresh = true;
        $scope.map = {
            center: {
                latitude: 55.725970,
                longitude: 10.534767
            },
            zoom: 8,
            pan: 1,
            options: $scope.mapOptions,
            control: {},
            events: {
                tilesloaded: function (maps, eventName, args) {},
                dragend: function (maps, eventName, args) {},
                zoom_changed: function (maps, eventName, args) {}
            }
        };
        // console.log($scope.map); 

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
/*
    $http.get('json/camps.json').then(function(data) {
        $scope.markers = data;
        console.log($scope.markers);
    });
*/
    $scope.markers = [
        {
            "id": 0,
            "coords": {
                "latitude": 56.379566,
                "longitude": 10.9050075
            },
            "name": "Lærkereden",
            "address": "Slåenvej 6, 8500 Grenå",
            "years": "2010",
            "website": "http://www.laerkereden.org/"
        },
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
        },
        {
            "id": 2,
            "coords": {
                "latitude": 55.8784227,
                "longitude": 11.5343726
            },
            "name": "Lyngborgen",
            "address": "Enebærvej 4, Ellinge Lyng, 4560 Vig",
            "years": "2011, 2013",
            "website": "http://lyngborgen.dk/"
        },
        {
            "id": 3,
            "coords": {
                "latitude": 55.3846357,
                "longitude": 9.6199201
            },
            "name": "Grænseborgen",
            "address": "Vargårdevej 86, 6094 Hejls",
            "years": "2006, 2016",
            "website": "http://www.graenseborgen.dk/"
        },
        {
            "id": 4,
            "coords": {
                "latitude": 55.2455902,
                "longitude": 9.8777956
            },
            "name": "Torø",
            "address": "Torø 1, 5610 Assens",
            "years": "2014",
            "website": "http://kolonierne.dk/koloni/skovhytten/"
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

.controller('camplistCtrl', ['$scope', '$http', '$location', '$route', '$window', 'AuthService', function($scope, $http, $location, $route, $window, AuthService) {
    
    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
            $scope.role = AuthService.userRole();
        };
    });

    $http({
        method: 'GET',
        url: 'json/camps.json',
        headers: {
            'x-auth': localStorage.userToken
        }
    }).then(function(response) {
        // console.log(`Success. Status: ${response.status}`);
        $scope.camps = response.data;
        // console.log($scope.todos[0]);
    }, function errorCallback(response) {
        console.log(`Error. Status: ${response.status}`);
    });
}]);
