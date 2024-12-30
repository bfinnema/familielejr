angular.module('familielejr')

.controller('eventsadminCtrl', ['$scope', '$http', '$location', '$route', '$window', 'AuthService', 'YearService', 
function($scope, $http, $location, $route, $window, AuthService, YearService) {

    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
            $scope.role = AuthService.userRole();
        };
    });

    var invyear = YearService.myYear("eventsadmin");
    // var pastyear = invyear - 1;
    var pastyear = 1992;
    console.log(`eventsadminCtrl: Invyear: ${invyear}, Pastyear: ${pastyear}`);

    $http({
        method: 'GET',
        url: '/events/futureevents/',
        headers: {
            'x-auth': localStorage.userToken
        }
    }).then(function(events) {
        console.log(`Events collected with Success. Status: ${events.status}`);
        if (events.data) {
            $scope.events = events.data;
        } else {
            console.log('No future events');
        };
        angular.element(document.querySelector( '#organizer' ) ).addClass('active');
        angular.element(document.querySelector( '#futureevents' ) ).addClass('active');
        return $http({
            method: 'GET',
            url: 'eventtypes',
            headers: {
                'x-auth': localStorage.userToken
            }
        });
    }).then(function(eventtypes) {
        console.log(`Eventtypes collected with Success. Status: ${eventtypes.status}`);
        if (eventtypes.data) {
            $scope.eventtypes = eventtypes.data;
            // console.log(`Eventtype 0: ${$scope.eventtypes[0].eventtypeName}`);
        } else {
            console.log('No eventtypes');
        };
    }, function errorCallback(response) {
        console.log(`Error. Status: ${response.status}`);
    });

    $scope.commArr = [0,1,2];
    $scope.commMemArr = [0,1,2,3,4];
    $scope.organizers = ["","","","",""];
    $scope.organizerBtnShow = [false,true,false,false,false];
    $scope.organizerShow = [true,false,false,false,false];
    var numOrgLines = 0;

    $scope.committeeName = ["","",""];
    $scope.committeeDesc = ["","",""];
    $scope.committeeMembers = [["","","","",""],["","","","",""],["","","","",""]];
    $scope.committeeBtnShow = [true,false,false];
    $scope.committeeShow = [false,false,false];
    var numCommLines = 0;
    var initCommittees = false;
/* 
    console.log(`----- committeeMembers -----`);
    for (var u=0; u<3; u++) {
        for (var o=0; o<5; o++) {
            console.log($scope.committeeMembers[u][o]);
        };
    };
 */
    $scope.commMemBtnShow = [[false,true,false,false,false],[false,true,false,false,false],[false,true,false,false,false]];
    $scope.commMemShow = [[true,false,false,false,false],[true,false,false,false,false],[true,false,false,false,false]];
    var numCommMemLines = [0,0,0];
    $scope.numCommMemLines = numCommMemLines;

    $scope.showOrgLine = function() {
        // console.log("Entering showOrgline. numOrgLines: "+numOrgLines);
        if ($scope.organizers[numOrgLines]) {
            // console.log("numOrgLines: "+numOrgLines+", Organizer: "+$scope.organizers[numOrgLines]);
            numOrgLines = numOrgLines + 1;
            $scope.numOrgLines = numOrgLines;
            $scope.organizerShow[numOrgLines] = true;
            $scope.organizerBtnShow[numOrgLines] = false;
            $scope.organizerBtnShow[numOrgLines+1] = true;
        }
        else {
            $window.alert("Du skal udfylde det tomme arrangør felt.");
        };
    };
    
    $scope.removeOrganizer = function(orgNum) {
        console.log("Entering removeOrganizer. numOrgLines: "+numOrgLines);
        for (var i=orgNum; i<numOrgLines; i++) {
            $scope.organizers[i] = $scope.organizers[i+1];
        };
        $scope.organizers[numOrgLines] = "";
        $scope.organizerShow[numOrgLines] = false;
        $scope.organizerBtnShow[numOrgLines] = true;
        $scope.organizerBtnShow[numOrgLines+1] = false;
        numOrgLines -= 1;
        $scope.numOrgLines = numOrgLines;
    };

    $scope.showCommLine = function() {
        // console.log("Entering showCommLine. numCommLines: "+numCommLines);
        if (!initCommittees) {
            $scope.committeeShow[numCommLines] = true;
            $scope.committeeBtnShow[numCommLines] = false;
            $scope.committeeBtnShow[numCommLines+1] = true;
            initCommittees = true;
        }
        else if ($scope.committeeName[numCommLines]) {
            // console.log("numCommLines: "+numCommLines+", Committee: "+$scope.committeeName[numCommLines]);
            numCommLines = numCommLines + 1;
            $scope.committeeShow[numCommLines] = true;
            $scope.committeeBtnShow[numCommLines] = false;
            $scope.committeeBtnShow[numCommLines+1] = true;
        }
        else {
            $window.alert("Du skal udfylde navnet på udvalget.");
        };
    };
    
    $scope.showCommMemLine = function(numComm) {
        // console.log("Entering showCommMemLine. numCommMemLines for Committee: "+numComm+": "+numCommMemLines[numComm]);
        // console.log($scope.committeeMembers[numComm][numCommMemLines[numComm]])
        if ($scope.committeeMembers[numComm][numCommMemLines[numComm]]) {
            // console.log("numCommMemLines for Committee: "+numComm+": "+numCommMemLines[numComm]+", Committeemember: "+$scope.committeeMembers[numComm][numCommMemLines[numComm]]);
            // console.log(`commMemShow: ${$scope.commMemShow[numComm]}`);
            // console.log(`commMemBtnShow: ${$scope.commMemBtnShow[numComm]}`);
            // console.log(`numCommMemLines: ${numCommMemLines}`);
            numCommMemLines[numComm] = numCommMemLines[numComm] + 1;
            $scope.commMemShow[numComm][numCommMemLines[numComm]] = true;
            $scope.commMemBtnShow[numComm][numCommMemLines[numComm]] = false;
            $scope.commMemBtnShow[numComm][numCommMemLines[numComm]+1] = true;
            // console.log(`commMemShow: ${$scope.commMemShow[numComm]}`);
            // console.log(`commMemBtnShow: ${$scope.commMemBtnShow[numComm]}`);
            // console.log(`numCommMemLines: ${numCommMemLines}`);
            $scope.numCommMemLines[numComm] = numCommMemLines[numComm];
        }
        else {
            $window.alert("Du skal udfylde navnet på udvalgsmedlemmet.");
        };
    };

    $scope.removeCommMem = function(numComm, commMemNum) {
        console.log("Entering removeCommMem. numOrgLines: "+numCommMemLines[numComm]);
        for (var i=commMemNum; i<numCommMemLines[numComm]; i++) {
            $scope.committeeMembers[numComm][i] = $scope.committeeMembers[numComm][i+1];
        };
        $scope.committeeMembers[numComm][numCommMemLines[numComm]] = "";
        $scope.commMemShow[numComm][numCommMemLines[numComm]] = false;
        $scope.commMemBtnShow[numComm][numCommMemLines[numComm]] = true;
        $scope.commMemBtnShow[numComm][numCommMemLines[numComm]+1] = false;
        numCommMemLines[numComm] -= 1;
        $scope.numCommMemLines[numComm] = numCommMemLines[numComm];
    };
    
    $scope.newEventEntryToggle = function() {
        if ($scope.newEventEntry) {
            $scope.newEventEntry = false;
        } else {
            $scope.newEventEntry = true;
        };
    };

    $scope.generateFutureEvent = function() {

        var addr = {
            street: $scope.street, houseno: 0, zip: $scope.zip, town: $scope.town
        };

        var organizers = [];
        for (var i=0; i<numOrgLines+1; i++) {
            if ($scope.organizers[i] != "") {
                organizers.push({orgname: $scope.organizers[i]});
            };
        };

        var committees = [];
        for (var x=0; x<numCommLines+1; x++) {
            if ($scope.committeeName[x] != "") {
                var members = [];
                for (var y=0; y<numCommMemLines[x]+1; y++) {
                    members.push({membername: $scope.committeeMembers[x][y]});
                };
                var committee = {
                    name: $scope.committeeName[x],
                    description: $scope.committeeDesc[x],
                    members: members
                };
                committees.push(committee);
            };
        };

        var invitation = {
            headline: "Invitation til " + $scope.eventName,
            text1: "",
            registration: {
                receiver: "TBD",
                deadline: $scope.startdate,
                requiresRegistration: false
            },
            bring: "",
            payment: {
                meansofpayment: {
                    mobilepay: false,
                    bankpay: false,
                    cash: false
                }
            },
            active: false
        }

        console.log(`Selected id: ${$scope.selectEventtype}`);
        var selectedEventtypeName = "NONE";
        for (var j=0; j<$scope.eventtypes.length; j++) {
            console.log(`${j}. eventtypeName: ${$scope.eventtypes[j].eventtypeName}. id: ${$scope.eventtypes[j]._id}`);
            if ($scope.selectEventtype == $scope.eventtypes[j]._id) {
                selectedEventtypeName = $scope.eventtypes[j].eventtypeName;
                console.log(`Found ${$scope.eventtypes[j].eventtypeName}.`);
            };
        };

        var data = {
            eventName: $scope.eventName,
            _eventtype: $scope.selectEventtype,
            eventtypeName: selectedEventtypeName,
            year: $scope.year || (new Date()).getFullYear(),
            venue: $scope.venue,
            address: addr,
            website: $scope.website,
            startdate: $scope.startdate,
            enddate: $scope.enddate,
            invitation: invitation
        };
        
        if (organizers.length > 0) {data.organizers = organizers;};
        if (committees.length > 0) {data.committees = committees;};

        $http({
            method: 'POST',
            url: '/events',
            headers: {
                'x-auth': localStorage.userToken
            },
            data: data
        }).then(function(response) {
            $location.path('/eventsadmin');
            $route.reload();
        }, function errorCallback(response) {
            console.log(`Status: ${response.status}`);
            console.log(`Error: ${response.body}`);
            if (response.status == 409) {
                $window.alert("Navnet på begivenheden findes allerede. Vær venlig at ændre det.");
            };
        });
 
    };

}])

.controller('eventsadmineditCtrl', ['$scope', '$http', '$location', '$routeParams', '$window', 'AuthService', function($scope, $http, $location, $routeParams, $window, AuthService) {

    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
            $scope.role = AuthService.userRole();
        };
    });

    $http({
        method: 'GET',
        url: '/events/' + $routeParams.id,
        headers: {
            'x-auth': localStorage.userToken
        }
    }).then(function(event) {
        console.log(`Event collected with Success. Status: ${event.status}`);

        if (event.data) {
            console.log(`Received the event`);
            $scope.event = event.data.event;
            console.log(`Event Name: ${$scope.event.eventName}.`);
            $scope.selectEventtype = $scope.event._eventtype;
            $scope.startdateView = new Date($scope.event.startdate);
            $scope.enddateView = new Date($scope.event.enddate);

            $scope.commArr = [0,1,2];
            $scope.commMemArr = [0,1,2,3,4];
            $scope.organizers = ["","","","",""];
            $scope.organizerBtnShow = [false,true,false,false,false];
            $scope.organizerShow = [true,false,false,false,false];
            $scope.numOrgLines = $scope.event.organizers.length;
            // console.log(`numOrgLines: ${$scope.numOrgLines}`);
            for (var i=0; i<$scope.numOrgLines; i++) {
                $scope.organizerShow[i] = true;
                $scope.organizerBtnShow[i] = false;
                if (i<4) {$scope.organizerBtnShow[i+1] = true;};
                $scope.organizers[i] = $scope.event.organizers[i].orgname;
            };

            $scope.committeeName = ["","",""];
            $scope.committeeDesc = ["","",""];
            $scope.committeeMembers = [["","","","",""],["","","","",""],["","","","",""]];
            $scope.committeeBtnShow = [true,false,false];
            $scope.committeeShow = [false,false,false];
            $scope.numCommLines = $scope.event.committees.length;

            $scope.commMemBtnShow = [[false,true,false,false,false],[false,true,false,false,false],[false,true,false,false,false]];
            $scope.commMemShow = [[true,false,false,false,false],[true,false,false,false,false],[true,false,false,false,false]];
            $scope.numCommMemLines = [0,0,0];

            for (var x=0; x<$scope.numCommLines; x++) {
                $scope.committeeShow[x] = true;
                $scope.committeeBtnShow[x] = false;
                if (x<2) {$scope.committeeBtnShow[x+1] = true;};
                $scope.committeeName[x] = $scope.event.committees[x].name;
                $scope.committeeDesc[x] = $scope.event.committees[x].description;
                $scope.numCommMemLines[x] = $scope.event.committees[x].members.length;
                for (var y=0; y<$scope.numCommMemLines[x];y++) {
                    $scope.commMemShow[x][y] = true;
                    $scope.commMemBtnShow[x][y] = false;
                    if (y<4) {$scope.commMemBtnShow[x][y+1] = true;};
                    $scope.committeeMembers[x][y] = $scope.event.committees[x].members[y].membername;
                }
                // console.log(`commMemShow for ${x}: ${$scope.commMemShow[x]}`);
                // console.log(`commMemBtnShow for ${x}: ${$scope.commMemBtnShow[x]}`);
            };
            $scope.initCommittees = false;
            if ($scope.numCommLines>0) {$scope.initCommittees = true;};

            for (var w=0; w<$scope.numCommLines; w++) {
                if ($scope.numCommMemLines[w] > 0) {
                    $scope.numCommMemLines[w] -= 1;
                };
            };
            if ($scope.numCommLines > 0) {$scope.numCommLines -= 1;};
            if ($scope.numOrgLines > 0) {$scope.numOrgLines -= 1;};

        } else {
            console.log('Event not found');
        };
        angular.element(document.querySelector( '#organizer' ) ).addClass('active');
        angular.element(document.querySelector( '#futureevents' ) ).addClass('active');
        return $http({
            method: 'GET',
            url: 'eventtypes',
            headers: {
                'x-auth': localStorage.userToken
            }
        });
    }).then(function(eventtypes) {
        console.log(`Eventtypes collected with Success. Status: ${eventtypes.status}`);
        if (eventtypes.data) {
            $scope.eventtypes = eventtypes.data;
        } else {
            console.log('No eventtypes');
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
    
    $scope.removeOrganizer = function(orgNum) {
        // console.log("Entering removeOrganizer. numOrgLines: "+$scope.numOrgLines);
        for (var i=orgNum; i<$scope.numOrgLines; i++) {
            $scope.organizers[i] = $scope.organizers[i+1];
        };
        $scope.organizers[$scope.numOrgLines] = "";
        $scope.organizerShow[$scope.numOrgLines] = false;
        $scope.organizerBtnShow[$scope.numOrgLines] = true;
        $scope.organizerBtnShow[$scope.numOrgLines+1] = false;
        $scope.numOrgLines -= 1;
        numOrgLines = $scope.numOrgLines;
    };

    $scope.showCommLine = function() {
        // console.log("Entering showCommLine. numCommLines: "+$scope.numCommLines);
        if (!$scope.initCommittees) {
            $scope.committeeShow[$scope.numCommLines] = true;
            $scope.committeeBtnShow[$scope.numCommLines] = false;
            $scope.committeeBtnShow[$scope.numCommLines+1] = true;
            $scope.initCommittees = true;
        }
        else if ($scope.committeeName[$scope.numCommLines]) {
            // console.log("numCommLines: "+$scope.numCommLines+", Committee: "+$scope.committeeName[$scope.numCommLines]);
            $scope.numCommLines = $scope.numCommLines + 1;
            $scope.committeeShow[$scope.numCommLines] = true;
            $scope.committeeBtnShow[$scope.numCommLines] = false;
            $scope.committeeBtnShow[$scope.numCommLines+1] = true;
        }
        else {
            $window.alert("Du skal udfylde navnet på udvalget.");
        };
    };
    
    $scope.showCommMemLine = function(numComm) {
        // console.log("Entering showCommMemLine. numCommMemLines for Committee: "+numComm+": "+$scope.numCommMemLines[numComm]);
        // console.log($scope.committeeMembers[numComm][$scope.numCommMemLines[numComm]])
        if ($scope.committeeMembers[numComm][$scope.numCommMemLines[numComm]]) {
            // console.log("numCommMemLines for Committee: "+numComm+": "+$scope.numCommMemLines[numComm]+", Committeemember: "+$scope.committeeMembers[numComm][$scope.numCommMemLines[numComm]]);
            // console.log(`commMemShow: ${$scope.commMemShow[numComm]}`);
            // console.log(`commMemBtnShow: ${$scope.commMemBtnShow[numComm]}`);
            // console.log(`numCommMemLines: ${$scope.numCommMemLines}`);
            $scope.numCommMemLines[numComm] = $scope.numCommMemLines[numComm] + 1;
            $scope.commMemShow[numComm][$scope.numCommMemLines[numComm]] = true;
            $scope.commMemBtnShow[numComm][$scope.numCommMemLines[numComm]] = false;
            $scope.commMemBtnShow[numComm][$scope.numCommMemLines[numComm]+1] = true;
            // console.log(`commMemShow: ${$scope.commMemShow[numComm]}`);
            // console.log(`commMemBtnShow: ${$scope.commMemBtnShow[numComm]}`);
            // console.log(`numCommMemLines: ${$scope.numCommMemLines}`);
        }
        else {
            $window.alert("Du skal udfylde navnet på udvalgsmedlemmet.");
        };
    };
    
    $scope.removeCommMem = function(numComm, commMemNum) {
        numCommMemLines = $scope.numCommMemLines;
        console.log("Entering removeCommMem. numOrgLines: "+$scope.numCommMemLines[numComm]);
        for (var i=commMemNum; i<$scope.numCommMemLines[numComm]; i++) {
            $scope.committeeMembers[numComm][i] = $scope.committeeMembers[numComm][i+1];
        };
        $scope.committeeMembers[numComm][$scope.numCommMemLines[numComm]] = "";
        $scope.commMemShow[numComm][$scope.numCommMemLines[numComm]] = false;
        $scope.commMemBtnShow[numComm][$scope.numCommMemLines[numComm]] = true;
        $scope.commMemBtnShow[numComm][$scope.numCommMemLines[numComm]+1] = false;
        $scope.numCommMemLines[numComm] -= 1;
        numCommMemLines[numComm] = $scope.numCommMemLines[numComm];
    };
    
    $scope.editEvent = function(id) {

        var addr = {
            houseno: $scope.event.address.houseno, street: $scope.event.address.street, zip: $scope.event.address.zip, town: $scope.event.address.town
        };

        var organizers = [];
        for (var i=0; i<$scope.numOrgLines+1; i++) {
            if ($scope.organizers[i] != "") {
                organizers.push({orgname: $scope.organizers[i]});
            };
        };

        var committees = [];
        for (var x=0; x<$scope.numCommLines+1; x++) {
            if ($scope.committeeName[x] != "") {
                var members = [];
                for (var y=0; y<$scope.numCommMemLines[x]+1; y++) {
                    members.push({membername: $scope.committeeMembers[x][y]});
                };
                var committee = {
                    name: $scope.committeeName[x],
                    description: $scope.committeeDesc[x],
                    members: members
                };
                committees.push(committee);
            };
        };
 
        console.log(`Selected id: ${$scope.selectEventtype}`);
        var selectedEventtypeName = "NONE";
        for (var j=0; j<$scope.eventtypes.length; j++) {
            console.log(`${j}. eventtypeName: ${$scope.eventtypes[j].eventtypeName}. id: ${$scope.eventtypes[j]._id}`);
            if ($scope.selectEventtype == $scope.eventtypes[j]._id) {
                selectedEventtypeName = $scope.eventtypes[j].eventtypeName;
                console.log(`Found ${$scope.eventtypes[j].eventtypeName}.`);
            };
        };

        var data = {
            eventName: $scope.event.eventName,
            _eventtype: $scope.selectEventtype,
            eventtypeName: selectedEventtypeName,
            year: $scope.event.year,
            venue: $scope.event.venue,
			address: addr,
            website: $scope.event.website,
            startdate: $scope.startdateView,
            enddate: $scope.enddateView,
            invitation: $scope.event.invitation
        };
        
        if (organizers.length > 0) {data.organizers = organizers;};
        if (committees.length > 0) {data.committees = committees;};

        $http({
            method: 'PATCH',
            url: '/events/' + $routeParams.id,
            headers: {
                'x-auth': localStorage.userToken
            },
            data: data
        }).then(function(response) {
            $location.path('/eventsadmin');
        }, function errorCallback(response) {
            console.log(`Status: ${response.status}`);
            if (response.status == 409) {
                $window.alert("Navnet på begivenheden findes allerede. Vær venlig at ændre det.");
            };
        });

    };

}])

.controller('eventsadmindetailsCtrl', ['$scope', '$http', '$location', '$routeParams', '$window', 'AuthService', function($scope, $http, $location, $routeParams, $window, AuthService) {

    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
            $scope.role = AuthService.userRole();
        };
    });

    $http({
        method: 'GET',
        url: '/events/' + $routeParams.id,
        headers: {
            'x-auth': localStorage.userToken
        }
    }).then(function(response) {
        console.log(`Success. Status: ${response.status}`);

        if (response.data) {
            console.log(`Received the event`);
            $scope.event = response.data.event;
        } else {
            console.log('Event not found');
        };
        angular.element(document.querySelector( '#organizer' ) ).addClass('active');
        angular.element(document.querySelector( '#futureevents' ) ).addClass('active');
    }, function errorCallback(response) {
        console.log(`Error. Status: ${response.status}`);
    });

    $scope.removeEvent = function() {
        if ($window.confirm('Bekræft venligst at du vil slette begivenheden '+$scope.event.eventName)) {
            $http({
                method: 'DELETE',
                url: 'events/'+$routeParams.id,
                headers: {
                    'x-auth': localStorage.userToken
                }
            }).then(function(response) {
                console.log(`Status: ${response.status}`);
                console.log(response.data._id);
                $location.path('/eventsadmin');
            }, function errorCallback(response) {
                console.log(`Status: ${response.status}`);
            });
        };
    };

}])
