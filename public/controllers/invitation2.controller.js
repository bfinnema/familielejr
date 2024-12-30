angular.module('familielejr')

.controller('invitation2adminCtrl', ['$scope', '$http', '$location', '$window', 'AuthService',
function($scope, $http, $location, $window, AuthService) {

    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
            $scope.role = AuthService.userRole();
        };
    });

    setTimeout(function(){
        angular.element(document.querySelector( '#organizer' ) ).addClass('active');
        angular.element(document.querySelector( '#invitationadmin' ) ).addClass('active');
    }, 1000);

    $scope.invitationExists = false;
    $scope.eventSelected = false;

    $http({
        method: 'GET',
        url: 'events/futureevents',
        headers: {
            'x-auth': localStorage.userToken
        }
    }).then(function(futureevents) {
        console.log(`Future Events fetched. Status: ${futureevents.status}`);
        $scope.futureevents = futureevents.data;
        return $http({
            method: 'GET',
            url: 'eventtypes',
            headers: {
                'x-auth': localStorage.userToken
            }
        });
    }).then(function(eventtypes) {
        console.log(`Eventtypes fetched. Status: ${eventtypes.status}`);
        $scope.eventtypes = eventtypes.data;
    }, function errorCallback(response) {
        console.log(`Error! Status: ${response.status}`);
    });

    $scope.selectEvent = function() {
        console.log(`In selectEvent`);
        $scope.selectedEvent = JSON.parse($scope.selEvent);
        console.log(`selectedEvent stringified: ${JSON.stringify($scope.selectedEvent)}`);
        // console.log(`seleEvent: ${$scope.selEvent}`);
        // console.log(`Name: ${$scope.selectedEvent.eventName}`);
        // console.log(`organizers: ${JSON.stringify($scope.selectedEvent.organizers)}`);
        // console.log(`organizer: ${$scope.selectedEvent.organizers[0].orgname}`);

        $scope.startdateView = new Date($scope.selectedEvent.startdate);
        $scope.enddateView = new Date($scope.selectedEvent.enddate);
        $scope.starttimeView = new Date($scope.selectedEvent.invitation.starttime);
        $scope.endtimeView = new Date($scope.selectedEvent.invitation.endtime);
        $scope.deadlinedateView = new Date($scope.selectedEvent.invitation.registration.deadline);

        $scope.eventSelected = true;
        $scope.organizers = ["","","","",""];
        $scope.organizerBtnShow = [false,true,false,false,false];
        $scope.organizerShow = [true,false,false,false,false];
        $scope.numOrgLines = $scope.selectedEvent.organizers.length;
        // console.log(`numOrgLines: ${$scope.numOrgLines}`);
        for (var i=0; i<$scope.numOrgLines; i++) {
            $scope.organizerShow[i] = true;
            $scope.organizerBtnShow[i] = false;
            if (i<4) {$scope.organizerBtnShow[i+1] = true;};
            $scope.organizers[i] = $scope.selectedEvent.organizers[i].orgname;
        };
        if ($scope.numOrgLines > 0) {$scope.numOrgLines -= 1;};
        // console.log(`numOrgLines: ${$scope.numOrgLines}`);
    };

    $scope.showOrgLine = function() {
        // console.log("Entering showOrgline. numOrgLines: "+$scope.numOrgLines);
        if ($scope.organizers[$scope.numOrgLines]) {
            // console.log("numOrgLines: "+$scope.numOrgLines+", Organizer: "+$scope.organizers[$scope.numOrgLines]);
            $scope.numOrgLines = $scope.numOrgLines + 1;
            $scope.organizerShow[$scope.numOrgLines] = true;
            $scope.organizerBtnShow[$scope.numOrgLines] = false;
            $scope.organizerBtnShow[$scope.numOrgLines+1] = true;
        }
        else {
            $window.alert("Du skal udfylde det tomme arrangør felt.");
        };
    };
    
    $scope.generateInvitation = function() {

        console.log(`selectedEvent: ${JSON.stringify($scope.selectedEvent)}`);

        $scope.selectedEvent.startdate = $scope.startdateView;
        $scope.selectedEvent.enddate = $scope.enddateView;
        $scope.selectedEvent.invitation.starttime = $scope.starttimeView;
        $scope.selectedEvent.invitation.endtime = $scope.endtimeView;
        $scope.selectedEvent.invitation.registration.deadline = $scope.deadlinedateView;

        var organizers = [];
        for (var i=0; i<$scope.numOrgLines+1; i++) {
            if ($scope.organizers[i] != "") {
                organizers.push({orgname: $scope.organizers[i]});
            };
        };

        $scope.selectedEvent.organizers = organizers;

        console.log(`selectedEvent: ${JSON.stringify($scope.selectedEvent)}`);

        var data = {
            venue: $scope.selectedEvent.venue,
            address: $scope.selectedEvent.address,
            startdate: $scope.selectedEvent.startdate,
            enddate: $scope.selectedEvent.enddate,
            organizers: $scope.selectedEvent.organizers,
            invitation: $scope.selectedEvent.invitation,
        }
        console.log(`data: ${JSON.stringify(data)}`);
        // console.log(`${STOP}`);

        $http({
            method: 'PATCH',
            url: '/events/' + $scope.selectedEvent._id,
            headers: {
                'x-auth': localStorage.userToken
            },
            data: data
        }).then(function(response) {
            $location.path('/eventinfo');
        }, function errorCallback(response) {
            console.log(`Status: ${response.status}`);
        });

    };

}])

.controller('invitation2displayCtrl', ['$scope', '$http', '$routeParams', 'uiGmapGoogleMapApi', 'uiGmapIsReady', 'AuthService', 'ConfigService', 
function($scope, $http, $routeParams, uiGmapGoogleMapApi,uiGmapIsReady, AuthService, ConfigService) {

    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
            $scope.role = AuthService.userRole();
        };
    });

    ConfigService.getConfig().then(function() {
        $scope.api_key = ConfigService.getGoogleMapKey();
        // console.log(`api_key: ${$scope.api_key}`);
    });

    setTimeout(function(){
        angular.element(document.querySelector( '#nextcamp' ) ).addClass('active');
        angular.element(document.querySelector( '#nextcampinfo' ) ).addClass('active');
    }, 1000);

    var months = ["januar", "februar", "marts", "april", "maj", "juni", "juli", "august", "september", "oktober", "november", "december"];
    var days = ["søndag", "mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag"];

    $http({
        method: 'GET',
        url: 'events/' + $routeParams.id,
        headers: {
            'x-auth': localStorage.userToken
        }
    }).then(function(event) {
        console.log(`Event fetched. Status: ${event.status}`);
        $scope.event = event.data.event;
        console.log(`eventtypeName: ${$scope.event.eventtypeName}, ${$scope.event.eventName}`);

        var sd = new Date($scope.event.startdate);
        $scope.startday = days[sd.getDay()];
        $scope.startdate = sd.getDate();
        $scope.startmonth = months[sd.getMonth()];
        var ed = new Date($scope.event.enddate);
        // console.log(`endday: ${ed}, getDay: ${ed.getDay()}`);
        $scope.endday = days[ed.getDay()];
        // console.log(`Slutdag: ${$scope.endday}`);
        $scope.enddate = ed.getDate();
        $scope.endmonth = months[ed.getMonth()];
        var dl = new Date($scope.event.invitation.registration.deadline);
        $scope.deadlineday = days[dl.getDay()];
        $scope.deadlinedate = dl.getDate();
        $scope.deadlinemonth = months[dl.getMonth()];

        return $http({
            method: 'GET',
            url: 'eventtypes/eventtypeName/' + $scope.event.eventtypeName,
            headers: {
                'x-auth': localStorage.userToken
            }
        });
    }).then(function(eventtype) {
        console.log(`Eventtype fetched. Status: ${eventtype.status}`);
        $scope.eventtype = eventtype.data;

        var encodedAddress = encodeURIComponent($scope.event.address.street+" "+$scope.event.address.zip+" "+$scope.event.address.town+" Denmark");
        // console.log(`encodedAddress: ${encodedAddress}`);
        // console.log(`api_key: ${$scope.api_key}`);
        $http({
            method: 'GET',
            url: `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${$scope.api_key}`
        }).then(function(response) {
            // console.log(`Googleapis status: ${response.status}`);
            // console.log(response.data);
            if (response.error) {
                console.log('Unable to connect to Google servers');
            } else if (response.data.status === 'ZERO_RESULTS') {
                console.log('Unable to find that address');
            } else if (response.status === 200) {
                $scope.googleaddress = response.data.results[0].formatted_address,
                $scope.latitude = response.data.results[0].geometry.location.lat,
                $scope.longitude = response.data.results[0].geometry.location.lng
                // console.log(`Google address: ${$scope.googleaddress}, ${$scope.latitude}, ${$scope.longitude}`);
            } else {
                console.log('Hej');
            };

            uiGmapGoogleMapApi.then(function (maps) {
                console.log('Google Maps loaded');
                // maps.visualRefresh = true;
                $scope.map = {
                    center: {
                        latitude: $scope.latitude,
                        longitude: $scope.longitude
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
                // console.log($scope.map); 

                $scope.googlemap = {};
            });

        });

    }, function errorCallback(response) {
        console.log(`Error! Status: ${response.status}`);
    });

    $scope.windowOptions = {
        show: true
    };

    $scope.wincontent = "Hello";
    $scope.onClick = function (name, address, years, website) {
        $scope.windowOptions.show = true;
        $scope.wincontent = name + ', ' + address + '.  Var der: ' + years + '. ' + website;
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
