angular.module('familielejr')

.controller('campmapCtrl', ['$scope', '$http', 'uiGmapGoogleMapApi', 'uiGmapIsReady', 'AuthService', 
function($scope, $http, uiGmapGoogleMapApi, uiGmapIsReady, AuthService) {

    // console.log('This is the maps controller');
    var mapInstance = null;
    var infoWindow = null;
    var advancedMarkers = [];
    var AdvancedMarkerElementCtor = null;

    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
            $scope.role = AuthService.userRole();
        };
    });

    $http({
        method: 'GET',
        url: 'tenants/mytenant',
        headers: {
            'x-auth': localStorage.userToken
        }
    }).then(function(tenant) {
        // console.log(`Tenant fetched. Status: ${tenant.status}`);
        $scope.tenantName = tenant.data.tenantName;
        // $scope.tenant = tenant.data;
        return $http({
            method: 'GET',
            url: '/places',
            headers: {
                'x-auth': localStorage.userToken
            }
        });
    }).then(function(response) {
        // console.log(`placesStatus: ${response.status}`);
        $scope.places = response.data;
        $scope.markers = [];
        for (var i=0; i<$scope.places.length; i++) {
            var years = "";
            for (var j=0; j<$scope.places[i].events.length; j++) {
                years = years + $scope.places[i].events[j].year;
                if (j == $scope.places[i].events.length - 1) {
                    years = years + ".";
                } else {
                    years = years + ", ";
                };
            };
            // console.log(`Years: ${years}`);
            var marker = {
                "id": i,
                "coords": {
                    "latitude": $scope.places[i].coordinates.longitude,
                    "longitude": $scope.places[i].coordinates.latitude
                },
                "name": $scope.places[i].placeName,
                "address": $scope.places[i].address.street +' '+ $scope.places[i].address.houseno + ', ' + $scope.places[i].address.zip +' '+ $scope.places[i].address.town,
                "years": years,
                "website": $scope.places[i].website,
            };
            // console.log(`marker: ${JSON.stringify(marker)}`);
            $scope.markers.push(marker);
        };
        // console.log(`Markers: ${JSON.stringify($scope.markers)}`);
    }, function errorCallback(response) {
        console.log(`placesStatus: ${response.status}`);
    });

    setTimeout(function(){
        angular.element(document.querySelector( '#history' ) ).addClass('active');
        angular.element(document.querySelector( '#campmap' ) ).addClass('active');
    }, 1000);

    $scope.mapOptions = {
        minZoom: 8,
        zoomControl: false,
        draggable: true,
        navigationControl: false,
        mapTypeControl: false,
        scaleControl: false,
        streetViewControl: false,
        disableDoubleClickZoom: false,
        keyboardShortcuts: true,
        mapId: 'DEMO_MAP_ID',
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
        }]
    };

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

    $scope.wincontent = "Hello";
    $scope.onClick = function (name, address, years, website) {
        $scope.wincontent = name + ', ' + address + '.  Var der: ' + years + '. ' + website;
    };

    function clearAdvancedMarkers() {
        angular.forEach(advancedMarkers, function(marker) {
            marker.map = null;
        });
        advancedMarkers = [];
    }

    function getAdvancedMarkerCtor() {
        if (AdvancedMarkerElementCtor) {
            return Promise.resolve(AdvancedMarkerElementCtor);
        }

        return google.maps.importLibrary('marker').then(function(markerLib) {
            AdvancedMarkerElementCtor = markerLib.AdvancedMarkerElement;
            return AdvancedMarkerElementCtor;
        });
    }

    function renderAdvancedMarkers() {
        if (!mapInstance || !$scope.markers || $scope.markers.length === 0) {
            return;
        }

        getAdvancedMarkerCtor().then(function(AdvancedMarkerElement) {
            clearAdvancedMarkers();
            if (!infoWindow) {
                infoWindow = new google.maps.InfoWindow();
            }

            angular.forEach($scope.markers, function(value) {
                var marker = new AdvancedMarkerElement({
                    map: mapInstance,
                    position: {
                        lat: value.coords.latitude,
                        lng: value.coords.longitude
                    },
                    title: value.name
                });

                marker.addListener('click', function() {
                    var content = '<div><strong>' + value.name + '</strong><br>' +
                        value.address + '<br>Var der: ' + value.years + '<br>' +
                        value.website + '</div>';
                    infoWindow.setContent(content);
                    infoWindow.open({
                        map: mapInstance,
                        anchor: marker
                    });
                    $scope.$applyAsync(function() {
                        $scope.onClick(value.name, value.address, value.years, value.website);
                    });
                });

                advancedMarkers.push(marker);
            });
        }).catch(function(error) {
            console.log('Unable to load marker library', error);
        });
    }

    uiGmapIsReady.promise() // if no value is put in promise() it defaults to promise(1)
    .then(function (instances) {
        mapInstance = instances[0].map;
        renderAdvancedMarkers();
    });

    /* $scope.markers = [
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
            "id": 17,
            "coords": {
                "latitude": 56.131615,
                "longitude": 8.113345
            },
            "name": "Ringkøbing",
            "address": "Sand Holms Vej 88, 6950 Ringkøbing",
            "years": "2034",
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
            "years": "2010",
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
            "years": "2015, 2017, 2019, 2021, 2025",
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
            "years": "2014, 2024",
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
            "years": "2018, 2022",
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
        },
        {
            "id": 16,
            "coords": {
                "latitude": 55.191249915574474,
                "longitude": 11.5573923
            },
            "name": "Klintehytten",
            "address": "Strandbakken 145, 4700 Næstved",
            "years": "2023",
            "website": "https://klintehytten.dk/"
        }
    ]; */

    $scope.$on('$destroy', function() {
        clearAdvancedMarkers();
        if (infoWindow) {
            infoWindow.close();
        }
    });
}])

.controller('pasteventlistCtrl', ['$scope', '$http', 'AuthService', 
function($scope, $http, AuthService) {

    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
            $scope.role = AuthService.userRole();
        };
    });

    $http({
        method: 'GET',
        url: '/tenants/mytenant/',
        headers: {
            'x-auth': localStorage.userToken
        }
    }).then(function(tenant) {
        // console.log(`Tenant fetched. Status: ${tenant.status}. Tenant name: ${tenant.data.tenantName}`);
        $scope.tenantName = tenant.data.tenantName;
        // $scope.tenant = tenant.data;
        return $http({
            method: 'GET',
            url: '/events/pastevents/',
            headers: {
                'x-auth': localStorage.userToken
            }
        });
    }).then(function(events) {
        // console.log(`Success. Status: ${events.status}`);
        if (events.data) {
            $scope.events = events.data;
        } else {
            console.log('No past events');
        };
        angular.element(document.querySelector( '#history' ) ).addClass('active');
        angular.element(document.querySelector( '#pasteventlist' ) ).addClass('active');
    }, function errorCallback(response) {
        console.log(`Error. Status: ${response.status}`);
    });

}]);
