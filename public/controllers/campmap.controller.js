angular.module('familielejr')

.controller('campmapCtrl', ['$scope', '$http', 'uiGmapGoogleMapApi', 'uiGmapIsReady', 'AuthService', 
function($scope, $http, uiGmapGoogleMapApi, uiGmapIsReady, AuthService) {

    // console.log('This is the maps controller');

    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
            $scope.role = AuthService.userRole();
        };
    });

    setTimeout(function(){
        angular.element(document.querySelector( '#history' ) ).addClass('active');
        angular.element(document.querySelector( '#campmap' ) ).addClass('active');
    }, 1000);

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
                "latitude": 55.4051511,
                "longitude": 9.6015006
            },
            "name": "Hejls Lejrskole",
            "address": "Overbyvej 102, 6094 Hejls",
            "years": "1993, 1994, 1995",
            "website": "Er ikke lejrskole mere",
        },
        {
            "id": 1,
            "coords": {
                "latitude": 55.8469999,
                "longitude": 11.4976986
            },
            "name": "Lejrskolen Høve Strand",
            "address": "Asnæs Lyngvej 11, 4550 Asnæs",
            "years": "1996, 1999, 2001, 2003",
            "website": "http://www.lejrskolen.dk",
        },
        {
            "id": 2,
            "coords": {
                "latitude": 55.545347,
                "longitude": 9.8218295
            },
            "name": "Skovgården",
            "address": "Karlskovvej 35C, 5500 Middelfart",
            "years": "1997",
            "website": "http://www.fyn.ysmen.dk/index.php?id=5652",
        },
        {
            "id": 3,
            "coords": {
                "latitude": 55.5366694,
                "longitude": 9.9968613
            },
            "name": "Skåstrup Strand Lejren",
            "address": "Strandgyden 28, 5400 Bogense",
            "years": "1998, 2000",
            "website": "http://skaastrupstrand.dk/",
        },
        {
            "id": 4,
            "coords": {
                "latitude": 55.3405654,
                "longitude": 9.6244667
            },
            "name": "Philipsborg",
            "address": "Kystvejen 73, 6100 Haderslev",
            "years": "2002, 2004",
            "website": "http://hyttefortegnelsen.dk/hytte/philipsborg/",
        },
        {
            "id": 5,
            "coords": {
                "latitude": 55.164516,
                "longitude": 9.512978
            },
            "name": "Irokeser Hytten",
            "address": "Havvejen 70, Sdr. Vilstrup, 6100 Haderslev",
            "years": "2007",
            "website": "http://www.irokeserhytten.dk/",
        },
        {
            "id": 6,
            "coords": {
                "latitude": 56.379566,
                "longitude": 10.9050075
            },
            "name": "Lærkereden",
            "address": "Slåenvej 6, 8500 Grenå",
            "years": "2009, 2010",
            "website": "http://www.laerkereden.org/"
        },
        {
            "id": 7,
            "coords": {
                "latitude": 55.1993697,
                "longitude": 11.5146273
            },
            "name": "Bisseruplejren",
            "address": "Gammel Strandvej 135, 4243 Rude",
            "years": "2015, 2017, 2019",
            "website": "http://www.bisseruplejren.dk/"
        },
        {
            "id": 8,
            "coords": {
                "latitude": 55.8784227,
                "longitude": 11.5343726
            },
            "name": "Lyngborgen",
            "address": "Enebærvej 4, Ellinge Lyng, 4560 Vig",
            "years": "2008, 2011, 2013",
            "website": "http://lyngborgen.dk/"
        },
        {
            "id": 9,
            "coords": {
                "latitude": 55.3846357,
                "longitude": 9.6199201
            },
            "name": "Grænseborgen",
            "address": "Vargårdevej 86, 6094 Hejls",
            "years": "2005, 2016",
            "website": "http://www.graenseborgen.dk/"
        },
        {
            "id": 10,
            "coords": {
                "latitude": 55.2455902,
                "longitude": 9.8777956
            },
            "name": "Torø",
            "address": "Torø 1, 5610 Assens",
            "years": "2014",
            "website": "http://kolonierne.dk/koloni/skovhytten/"
        },
        {
            "id": 11,
            "coords": {
                "latitude": 55.554425,
                "longitude": 10.616398
            },
            "name": "Højbjerg",
            "address": "Langøvej 272, 5390 Martofte",
            "years": "2018",
            "website": "http://sommerlejrfyn.dk"
        },
        {
            "id": 12,
            "coords": {
                "latitude": 55.2749899,
                "longitude": 11.2527146
            },
            "name": "Egeruphytten",
            "address": "Egerupvej 49, 4230 Skælskør",
            "years": "2006",
            "website": "http://egeruphytten.dk/"
        },
        {
            "id": 13,
            "coords": {
                "latitude": 55.026642,
                "longitude": 10.8547743
            },
            "name": "Helletofte Lejrskole",
            "address": "Korsvej 12, 5953 Tranekær",
            "years": "2009",
            "website": "https://www.schoolandcollegelistings.com/DK"
        },
        {
            "id": 14,
            "coords": {
                "latitude": 55.423817,
                "longitude": 9.845415
            },
            "name": "Fønsborg",
            "address": "Gl. Fønsvej 3, 5580 Nørre Aaby",
            "years": "2012",
            "website": "http://hyttefortegnelsen.dk/hytte/foensborg/"
        },
        {
            "id": 15,
            "coords": {
                "latitude": 55.455648,
                "longitude": 9.6850173
            },
            "name": "Frydenborg",
            "address": "Frydenborgvej 40, 6092 Sønder Stenderup",
            "years": "2020",
            "website": "https://www.frydenborglejren.dk/"
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

.controller('camplistCtrl', ['$scope', '$http', 'AuthService', 'YearService', 
function($scope, $http, AuthService, YearService) {

    // console.log(`This controller is for the list of past camps. Don't be confused bby the fact that it uses the term "futurecamps" for past camps.`);
    
    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
            $scope.role = AuthService.userRole();
        };
    });

    var invyear = YearService.myYear("camplist");
    // console.log(`List of past camps. Invyear: ${invyear}`);

    $http({
        method: 'GET',
        url: '/futurecamps/past/' + invyear,
        headers: {
            'x-auth': localStorage.userToken
        }
    }).then(function(response) {
        // console.log(`Success. Status: ${response.status}`);
        if (response.data) {
            $scope.camps = response.data;
        } else {
            console.log('No past camps');
        };
        angular.element(document.querySelector( '#history' ) ).addClass('active');
        angular.element(document.querySelector( '#camplist' ) ).addClass('active');
    }, function errorCallback(response) {
        console.log(`Error. Status: ${response.status}`);
    });
/* 
    setTimeout(function(){
        angular.element(document.querySelector( '#history' ) ).addClass('active');
        angular.element(document.querySelector( '#camplist' ) ).addClass('active');
    }, 1000);

 */    
}]);
