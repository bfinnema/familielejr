angular.module('familielejr')

.controller('invitationadminCtrl', ['$scope', '$http', '$location', '$window', 'AuthService', 'YearService', 'EventPriceService',
function($scope, $http, $location, $window, AuthService, YearService, EventPriceService) {

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

    var invyear = YearService.myYear("default");
    $scope.invyear = invyear;
    // console.log(`Invitation Admin Ctrl. Invyear: ${invyear}`);
    var invitationExists = false;
    $scope.invitationExists = invitationExists;
    var priceModel = EventPriceService.eventPriceDefault();

    $http({
        method: 'GET',
        url: '/invitations/year/'+invyear,
        headers: {
            'x-auth': localStorage.userToken
        }
    }).then(function(response) {
        // console.log(`Success, invitation fetched. Status: ${response.status}`);
        // console.log(response.data);
        if (response.data) {
            // console.log(response.data.enddate, response.data.startdate);
            invitationExists = true;
            $scope.invitationExists = invitationExists;
            $scope.invMessage = "Du ændrer i en eksisterende invitation for "+invyear+".";
            $scope.invitation = response.data;
            if ($scope.invitation.payment.meansofpayment.mobilepay) {$scope.mobilepay = true;};
            if ($scope.invitation.payment.meansofpayment.bankpay) {$scope.bankpay = true;};
            if ($scope.invitation.payment.meansofpayment.cash) {$scope.cash = true;};
            $scope.startdateView = new Date($scope.invitation.startdate);
            $scope.enddateView = new Date($scope.invitation.enddate);
            $scope.starttimeView = new Date($scope.invitation.starttime);
            $scope.endtimeView = new Date($scope.invitation.endtime);
            $scope.deadlinedateView = new Date($scope.invitation.registration.deadline);
            $scope.adultoneday = $scope.invitation.payment.newpricemodel.adult[0].price;
            $scope.adulttwodays = $scope.invitation.payment.newpricemodel.adult[1].price;
            $scope.childoneday = $scope.invitation.payment.newpricemodel.child[0].price;
            $scope.childtwodays = $scope.invitation.payment.newpricemodel.child[1].price;
            $scope.smallchildoneday = $scope.invitation.payment.newpricemodel.smallchild[0].price;
            $scope.smallchildtwodays = $scope.invitation.payment.newpricemodel.smallchild[1].price;

            $scope.organizers = ["","","","",""];
            $scope.organizerBtnShow = [false,true,false,false,false];
            $scope.organizerShow = [true,false,false,false,false];
            $scope.numOrgLines = $scope.invitation.organizers.length;
            // console.log(`numOrgLines: ${$scope.numOrgLines}`);
            for (var i=0; i<$scope.numOrgLines; i++) {
                $scope.organizerShow[i] = true;
                $scope.organizerBtnShow[i] = false;
                if (i<4) {$scope.organizerBtnShow[i+1] = true;};
                $scope.organizers[i] = $scope.invitation.organizers[i].name;
            };
            if ($scope.numOrgLines > 0) {$scope.numOrgLines -= 1;};
            // console.log(`numOrgLines: ${$scope.numOrgLines}`);

        } else {
            // console.log('Invitation does not exist');
            $scope.invMessage = "Du opretter en ny invitation for " + invyear + ".";

            $http({
                method: 'GET',
                url: '/futurecamps/year/' + invyear,
                headers: {
                    'x-auth': localStorage.userToken
                }
            }).then(function(response) {
                // console.log(`Success. Status: ${response.status}`);

                if (response.data) {
                    // console.log(`Received the futurecamp`);
                    response.data.futurecamp.headline = 'Invitation til familielejr';
                    $scope.invitation = response.data.futurecamp;
                    $scope.startdateView = new Date($scope.invitation.startdate);
                    $scope.enddateView = new Date($scope.invitation.enddate);
                    $scope.organizers = ["","","","",""];
                    $scope.organizerBtnShow = [false,true,false,false,false];
                    $scope.organizerShow = [true,false,false,false,false];
                    $scope.numOrgLines = $scope.invitation.organizers.length;
                    // console.log(`numOrgLines: ${$scope.numOrgLines}`);
                    for (var i=0; i<$scope.numOrgLines; i++) {
                        $scope.organizerShow[i] = true;
                        $scope.organizerBtnShow[i] = false;
                        if (i<4) {$scope.organizerBtnShow[i+1] = true;};
                        $scope.organizers[i] = $scope.invitation.organizers[i].orgname;
                    };
                    $scope.adultoneday = priceModel.adult[0].price;
                    $scope.adulttwodays = priceModel.adult[1].price;
                    $scope.childoneday = priceModel.child[0].price;
                    $scope.childtwodays = priceModel.child[1].price;
                    $scope.smallchildoneday = priceModel.smallchild[0].price;
                    $scope.smallchildtwodays = priceModel.smallchild[1].price;

                    if ($scope.numOrgLines > 0) {$scope.numOrgLines -= 1;};
                    // console.log(`numOrgLines: ${$scope.numOrgLines}`);
                } else {
                    console.log('Camp not found');
                };
            }, function errorCallback(response) {
                console.log(`Error, camp does not exist. Status: ${response.status}`);
            });
        };
    }, function errorCallback(response) {
        console.log(`Error. Status: ${response.status}`);
    });

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

        var registration = {
            receiver: $scope.invitation.registration.receiver,
            email: $scope.invitation.registration.email,
            phone: $scope.invitation.registration.phone,
            deadline: $scope.deadlinedateView
        };

        var addr = {
            street: $scope.invitation.address.street,
            zip: $scope.invitation.address.zip,
            town: $scope.invitation.address.town
        };

        if (!$scope.mobilepay) {$scope.mobilepay = false};
        if (!$scope.bankpay) {$scope.bankpay = false};
        if (!$scope.cash) {$scope.cash = false};
        var priceModel = {adult:[], child:[], smallchild:[]};
        priceModel.adult.push({"price": $scope.adultoneday});
        priceModel.adult.push({"price": $scope.adulttwodays});
        priceModel.child.push({"price": $scope.childoneday});
        priceModel.child.push({"price": $scope.childtwodays});
        priceModel.smallchild.push({"price": $scope.smallchildoneday});
        priceModel.smallchild.push({"price": $scope.smallchildtwodays});
        // console.log(`Child, one day: ${priceModel.child[0].price}`);
        var payment = {
            priceModel: "new",
            // adult: $scope.invitation.payment.adult,
            // child: $scope.invitation.payment.child,
            adult: 180,
            child: 100,
            newpricemodel: priceModel,
            meansofpayment: {
                mobilepay: $scope.mobilepay,
                bankpay: $scope.bankpay,
                cash: $scope.cash
            },
            paymentinfo: {
                mobilepay: '00000000',
                bankaccount: {
                    regno: '0000',
                    account: '000000',
                },
                cash: "Kontant afregning på lejren"
            }
        };
        // console.log(`Adult, one day: ${payment.newpricemodel.adult[0].price}`);

        if ($scope.mobilepay) {
            payment.paymentinfo.mobilepay = $scope.invitation.payment.paymentinfo.mobilepay;
        };
        if ($scope.bankpay) {
            payment.paymentinfo.bankaccount.regno = $scope.invitation.payment.paymentinfo.bankaccount.regno;
            payment.paymentinfo.bankaccount.account = $scope.invitation.payment.paymentinfo.bankaccount.account;
        };

        var organizers = [];
        for (var i=0; i<$scope.numOrgLines+1; i++) {
            if ($scope.organizers[i] != "") {
                organizers.push({name: $scope.organizers[i]});
            };
        };

        if (!invitationExists) {
            $scope.invitation.invitationName = $scope.invitation.headline.replaceAll(" ", "_").substring(0,25)+"_"+Math.floor(Math.random()*8998+1001);
        }
		var data = {
            headline: $scope.invitation.headline,
            year: $scope.invitation.year,
            invitationName: $scope.invitation.invitationName,
            text1: $scope.invitation.text1,
            camp: $scope.invitation.camp,
			address: addr,
            startdate: $scope.startdateView,
            starttime: $scope.starttimeView,
            enddate: $scope.enddateView,
            endtime: $scope.endtimeView,
            registration: registration,
            bring: $scope.invitation.bring,
            payment: payment,
            text2: $scope.invitation.text2,
            organizers: organizers
		};

        if (invitationExists) {
            $http({
                method: 'PATCH',
                url: '/invitations/' + $scope.invitation._id,
                headers: {
                    'x-auth': localStorage.userToken
                },
                data: data
            }).then(function(response) {
                $location.path('/eventinfo');
            }, function errorCallback(response) {
                console.log(`Status: ${response.status}`);
            });
        } else {
            $http({
                method: 'POST',
                url: '/invitations',
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

    };

}])

.controller('eventinfoCtrl', ['$scope', '$http', 'uiGmapGoogleMapApi', 'uiGmapIsReady', 'AuthService', 'YearService', 'ConfigService', 
function($scope, $http, uiGmapGoogleMapApi,uiGmapIsReady, AuthService, YearService, ConfigService) {

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

    var invyear = YearService.myYear("default");
    // console.log(`Event info Ctrl = Invitation. Invyear: ${invyear}`);
    $scope.invyear = invyear;
    var invitationExists = false;
    $scope.invitationExists = invitationExists;

    $http({
        method: 'GET',
        url: '/invitations/year/'+invyear,
        headers: {
            'x-auth': localStorage.userToken
        }
    }).then(function(response) {
        // console.log(`Success. Status: ${response.status}`);
        if (response.data) {
            invitationExists = true;
            $scope.invitationExists = invitationExists;
            $scope.invitation = response.data;
            var sd = new Date($scope.invitation.startdate);
            $scope.startday = days[sd.getDay()];
            $scope.startdate = sd.getDate();
            $scope.startmonth = months[sd.getMonth()];
            var ed = new Date($scope.invitation.enddate);
            // console.log(`endday: ${ed}, getDay: ${ed.getDay()}`);
            $scope.endday = days[ed.getDay()];
            // console.log(`Slutdag: ${$scope.endday}`);
            $scope.enddate = ed.getDate();
            $scope.endmonth = months[ed.getMonth()];
            var dl = new Date($scope.invitation.registration.deadline);
            $scope.deadlineday = days[dl.getDay()];
            $scope.deadlinedate = dl.getDate();
            $scope.deadlinemonth = months[dl.getMonth()];

            $scope.priceModelType = "old";
            if ($scope.invitation.payment.priceModel) {
                if ($scope.invitation.payment.priceModel == "new") {
                    console.log(`priceModel there: New`);
                    $scope.priceModelType = "new";
                } else {
                    console.log(`priceModel there: Old`);
                    $scope.priceModelType = "old";
                };
            } else {
                console.log(`priceModel not there`);
                $scope.priceModelType = "old";
            };

            var encodedAddress = encodeURIComponent($scope.invitation.address.street+" "+$scope.invitation.address.zip+" "+$scope.invitation.address.town+" Denmark");
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
        } else {
            console.log('Invitation does not exist');
        };
    }, function errorCallback(response) {
        console.log(`Error. Status: ${response.status}`);
    });
/* 
    uiGmapGoogleMapApi.then(function (maps) {
        // console.log('Google Maps loaded');
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
        // console.log($scope.map); 

        $scope.googlemap = {};
    });
 */
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
