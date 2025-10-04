angular.module('familielejr')

.controller('eventsadminCtrl', ['$scope', '$http', '$location', '$route', '$window', 'AuthService', 'listOfItemsSL', 
function($scope, $http, $location, $route, $window, AuthService, listOfItemsSL) {

    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
            $scope.role = AuthService.userRole();
        };
    });

    futureeventsOffset = 1;
    // console.log(`In eventsadminCtrl. futureeventsOffset: ${futureeventsOffset}`);
    $scope.agendaInEventtype = false;

    $http({
        method: 'GET',
        url: '/tenants/mytenant/',
        headers: {
            'x-auth': localStorage.userToken
        }
    }).then(function(tenant) {
        // console.log(`Tenant fetched. Status: ${tenant.status}. Tenant name: ${tenant.data.tenantName}`);
        $scope.tenantName = tenant.data.tenantName;
        $scope.tenant = tenant.data;
        return $http({
            method: 'GET',
            url: '/events/futureevents/' + futureeventsOffset,
            headers: {
                'x-auth': localStorage.userToken
            }
        });
    }).then(function(events) {
        // console.log(`Events collected with Success. Status: ${events.status}`);
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
        // console.log(`Eventtypes collected with Success. Status: ${eventtypes.status}`);
        if (eventtypes.data) {
            $scope.eventtypes = eventtypes.data;
            // console.log(`Eventtype 0: ${$scope.eventtypes[0].eventtypeName}`);
        } else {
            console.log('No eventtypes');
        };
    }, function errorCallback(response) {
        console.log(`Error. Status: ${response.status}`);
    });

    $scope.organiserStructure = listOfItemsSL.prepareList([5,0], [""]);
    // console.log(`New: ${$scope.organiserStructure}`);

    $scope.commArr = [0,1,2];
    $scope.commMemArr = [0,1,2,3,4];
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

    $scope.agendaOrNot = false;
    $scope.noAgenda = false;
    $scope.yesAgenda = false;

    $scope.showOrgLine = function() {
        // console.log("Entering showOrgline. numOrgLines: "+$scope.organiserStructure[4]);
        // console.log(`---------- Entering showOrgLine ----------`);
        // console.log(`itemNums: ${$scope.organiserStructure[0]}`);
        // console.log(`btnShows: ${$scope.organiserStructure[1]}`);
        // console.log(`itemShows: ${$scope.organiserStructure[2]}`);
        // console.log(`Texts: ${$scope.organiserStructure[3][0]}`);
        // console.log(`NumLinesUsed, organizers: ${$scope.organiserStructure[4]}`);
        if ($scope.organiserStructure[3][0][$scope.organiserStructure[4]]) {
            // console.log("YES. numOrgLines: "+$scope.organiserStructure[4]+", Organizer: "+$scope.organiserStructure[3][0][$scope.organiserStructure[4]]);
            $scope.organiserStructure = listOfItemsSL.addItem($scope.organiserStructure);
        } else {
            $window.alert("Du skal udfylde det tomme arrangør felt.");
        };
    };
    
    $scope.removeOrganizer = function(orgNum) {
        // console.log("Entering removeOrganizer. numOrgLines: "+$scope.numOrgLines);
        $scope.organiserStructure = listOfItemsSL.removeItem(orgNum, $scope.organiserStructure);
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
        // console.log("Entering removeCommMem. numOrgLines: "+numCommMemLines[numComm]);
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
    
    $scope.agendaNegative = function() {
        console.log(`Entering agendaNegative. agendaOrNot: ${$scope.agendaOrNot}`);
        $scope.yesAgenda = false;
        $scope.agendaOrNot = false;
        /* $scope.agendaItemsBtnShowSave = $scope.agendaItemsBtnShow;
        $scope.agendaItemShowSave = $scope.agendaItemShow;
        $scope.agendaItemsBtnShow = [false,false,false,false,false,false,false,false,false,false];
        $scope.agendaItemShow = [false,false,false,false,false,false,false,false,false,false]; */
    };

    $scope.agendaPositive = function() {
        console.log(`Entering agendaPositive. agendaOrNot: ${$scope.agendaOrNot}`);
        $scope.noAgenda = false;
        $scope.agendaOrNot = true;
        $scope,yesAgenda = true;
        /* if ($scope.numAgendaItems < 1) {
            $scope.agendaItemsBtnShow = [false,true,false,false,false,false,false,false,false,false];
            $scope.agendaItemShow = [true,false,false,false,false,false,false,false,false,false];
        } else {
            $scope.agendaItemsBtnShow = $scope.agendaItemsBtnShowSave;
            $scope.agendaItemShow = $scope.agendaItemShowSave;
        }; */
    };

    $scope.showAgendaItem = function() {
        // console.log("Entering showAgendaItem. numAgendaItems: "+$scope.agendaStructure[4]);
        // console.log(`---------- Entering showAgendaItem ----------`);
        // console.log(`itemNums: ${$scope.agendaStructure[0]}`);
        // console.log(`btnShows: ${$scope.agendaStructure[1]}`);
        // console.log(`itemShows: ${$scope.agendaStructure[2]}`);
        // console.log(`Texts: ${$scope.agendaStructure[3][0]}`);
        // console.log(`Nums: ${$scope.agendaStructure[4]}`);
        // console.log(`NumLinesUsed: ${$scope.agendaStructure[4]}`);
        if ($scope.agendaStructure[3][0][$scope.agendaStructure[4]]) {
            // console.log("numLines: "+$scope.agendaStructure[4]+", Item: "+$scope.agendaStructure[3][0][$scope.agendaStructure[4]]);
            $scope.agendaStructure = listOfItemsSL.addItem($scope.agendaStructure);
        } else {
            $window.alert("Du skal udfylde det tomme felt.");
        };
    };
    
    $scope.removeAgendaItem = function(agendaNum) {
        // console.log("Entering removeAgendaItem. numAgendaItems: "+$scope.agendaStructure[4]);
        $scope.agendaStructure = listOfItemsSL.removeItem(agendaNum, $scope.agendaStructure);
    };

    $scope.newEventEntryToggle = function() {
        if ($scope.newEventEntry) {
            $scope.newEventEntry = false;
        } else {
            $scope.newEventEntry = true;
        };
    };

    // Based on the eventtype selected, this function prepares which items must be added to the event, e.g. if agenda must be added.
    $scope.eventtypeSelected = function() {
        // console.log(`-------------------------------------------------`);
        $scope.selectedEventtype = JSON.parse($scope.selectEventtype);
        // console.log(`Eventtype has been selected. eventtypeName: ${$scope.selectedEventtype.eventtypeName}`);
        if ($scope.selectedEventtype.agendaOrNot) {
            $scope.agendaInEventtype = true;
            // console.log(`agendaOrNot in selectedEventtype: ${$scope.selectedEventtype.agendaOrNot}`);
            $scope.agendaOrNot = $scope.selectedEventtype.agendaOrNot;
            $scope.yesAgenda = $scope.selectedEventtype.agendaOrNot;
            $scope.noAgenda = !$scope.selectedEventtype.agendaOrNot;
            // console.log(`yesAgenda: ${$scope.yesAgenda}, noAgenda: ${$scope.noAgenda}`);

            $scope.agendaStructure = listOfItemsSL.prepareList([10,0], ["",""]);
            var agenda = $scope.selectedEventtype.agenda;
            // console.log(`agenda: ${JSON.stringify(agenda)}`);
            for (var i=0; i<agenda.length; i++) {
                $scope.agendaStructure[3][0][i] = agenda[i].item;
                $scope.agendaStructure[3][1][i] = agenda[i].description;
            };
            $scope.agendaStructure = listOfItemsSL.prepareEdit(agenda.length-1, $scope.agendaStructure);
            // console.log(`agendaStructure: ${$scope.agendaStructure}`);

            /* $scope.agendaStructure = listOfItemsSL.prepareList([10,0], ["",""]);
            var items = [];
            var descriptions = [];
            var texts = [];
            for (var i=0; i<$scope.agendaStructure[3][0].length; i++) {
                if (i<$scope.selectedEventtype.agenda.length) {
                    items.push($scope.selectedEventtype.agenda[i].item);
                    descriptions.push($scope.selectedEventtype.agenda[i].description);
                } else {
                    items.push("");
                    descriptions.push("");
                };
                // console.log(`i: ${i}, items: ${items}, descriptions: ${descriptions}`);
            };
            texts.push(items);
            texts.push(descriptions);
            $scope.agendaStructure[3] = texts;
            $scope.agendaStructure = listOfItemsSL.prepareEdit($scope.selectedEventtype.agenda.length-1, $scope.agendaStructure); */
        };
    };

    $scope.generateFutureEvent = function() {

        var addr = {
            street: $scope.street, houseno: 0, zip: $scope.zip, town: $scope.town
        };

        var organizers = [];
        for (var i=0; i<$scope.organiserStructure[4]+1; i++) {
            if ($scope.organiserStructure[3][0][i] != "") {
                organizers.push({orgname: $scope.organiserStructure[3][0][i]});
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

        var agenda = [];
        // console.log(`Number of agenda items: ${$scope.agendaStructure[4]}`);
        if ($scope.yesAgenda) {
            for (var i=0; i<$scope.agendaStructure[4]+1; i++) {
                agenda.push({"item": $scope.agendaStructure[3][0][i], "description": $scope.agendaStructure[3][1][i]});
            };
            // console.log(`${JSON.stringify(agenda)}`);
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
        };

        var data = {
            eventName: $scope.eventName,
            _eventtype: $scope.selectedEventtype._id,
            eventtypeName: $scope.selectedEventtype.eventtypeName,
            year: $scope.year || (new Date()).getFullYear(),
            venue: $scope.venue,
            address: addr,
            website: $scope.website,
            startdate: $scope.startdate,
            enddate: $scope.enddate,
            invitation: invitation,
            agendaOrNot: $scope.yesAgenda,
            agenda: agenda,
            summaryExist: false
        };
        
        if (organizers.length > 0) {data.organizers = organizers;};
        if (committees.length > 0) {data.committees = committees;};

        // console.log(`${JSON.stringify(data)}`);

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

.controller('eventsadmineditCtrl', ['$scope', '$http', '$location', '$routeParams', '$window', 'AuthService', 'listOfItemsSL', function($scope, $http, $location, $routeParams, $window, AuthService, listOfItemsSL) {

    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
            $scope.role = AuthService.userRole();
        };
    });

    $http({
        method: 'GET',
        url: '/tenants/mytenant',
        headers: {
            'x-auth': localStorage.userToken
        }
    }).then(function(tenant) {
        // console.log(`Tenant fetched. Status: ${tenant.status}. Tenant name: ${tenant.data.tenantName}`);
        $scope.tenantName = tenant.data.tenantName;
        // $scope.tenant = tenant.data;
        return $http({
            method: 'GET',
            url: '/events/' + $routeParams.id,
            headers: {
                'x-auth': localStorage.userToken
            }
        });
    }).then(function(event) {
        // console.log(`Event collected with Success. Status: ${event.status}`);

        if (event.data) {
            // console.log(`Received the event`);
            $scope.event = event.data.event;
            // console.log(`Event Name: ${$scope.event.eventName}.`);
            $scope.selectEventtype = $scope.event._eventtype;
            $scope.startdateView = new Date($scope.event.startdate);
            $scope.enddateView = new Date($scope.event.enddate);

            $scope.organiserStructure = listOfItemsSL.prepareList([5,0], [""]);
            for (i=0; i<$scope.event.organizers.length; i++) {
                $scope.organiserStructure[3][0][i] = $scope.event.organizers[i].orgname;
                // console.log(`orgname: ${$scope.event.organizers[i].orgname}`);
            };
            $scope.organiserStructure = listOfItemsSL.prepareEdit($scope.event.organizers.length-1, $scope.organiserStructure);
            // console.log(`NumLinesUsed, organizers: ${$scope.organiserStructure[4]}`);

            $scope.commArr = [0,1,2];
            $scope.commMemArr = [0,1,2,3,4];
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

            prepareAgendaForEdit();

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
        // console.log(`Eventtypes collected with Success. Status: ${eventtypes.status}`);
        if (eventtypes.data) {
            $scope.eventtypes = eventtypes.data;
        } else {
            console.log('No eventtypes');
        };
    }, function errorCallback(response) {
        console.log(`Error. Status: ${response.status}`);
    });

    $scope.showOrgLine = function() {
        // console.log("Entering showOrgline. numOrgLines: "+$scope.organiserStructure[4]);
        if ($scope.organiserStructure[3][0][$scope.organiserStructure[4]-1]) {
            // console.log("numOrgLines: "+$scope.organiserStructure[4]+", Organizer: "+$scope.organiserStructure[3][0][$scope.organiserStructure[4]]);
            $scope.organiserStructure = listOfItemsSL.addItem($scope.organiserStructure);
        } else {
            $window.alert("Du skal udfylde det tomme arrangør felt.");
        };
    };
    
    $scope.removeOrganizer = function(orgNum) {
        // console.log("Entering removeOrganizer. numOrgLines: "+$scope.organiserStructure[4]);
        $scope.organiserStructure = listOfItemsSL.removeItem(orgNum, $scope.organiserStructure);
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
        // console.log("Entering removeCommMem. numOrgLines: "+$scope.numCommMemLines[numComm]);
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
    
    prepareAgendaForEdit = function() {
        // console.log(`---------------------- In prepareAgendaForEdit ---------------------------`);
        if ($scope.event.agendaOrNot) {
            $scope.agendaInEventtype = true;
            // console.log(`agendaOrNot in selectedEventtype: ${$scope.selectedEventtype.agendaOrNot}`);
            $scope.agendaOrNot = $scope.event.agendaOrNot;
            $scope.yesAgenda = $scope.event.agendaOrNot;
            $scope.noAgenda = !$scope.event.agendaOrNot;
            // console.log(`yesAgenda: ${$scope.yesAgenda}, noAgenda: ${$scope.noAgenda}`);

            $scope.agendaStructure = listOfItemsSL.prepareList([10,0], ["",""]);
            var agenda = $scope.event.agenda;
            // console.log(`agenda: ${JSON.stringify(agenda)}`);
            for (var i=0; i<agenda.length; i++) {
                $scope.agendaStructure[3][0][i] = agenda[i].item;
                $scope.agendaStructure[3][1][i] = agenda[i].description;
            };
            $scope.agendaStructure = listOfItemsSL.prepareEdit(agenda.length-1, $scope.agendaStructure);
            // console.log(`agendaStructure: ${$scope.agendaStructure}`);
        };
    };

    $scope.showAgendaItem = function() {
        // console.log("Entering showAgendaItem. numAgendaItems: "+$scope.agendaStructure[4]);
        if ($scope.agendaStructure[3][0][$scope.agendaStructure[4]-1]) {
            // console.log("numLines: "+$scope.agendaStructure[4]+", Item: "+$scope.agendaStructure[3][0][$scope.agendaStructure[4]]);
            $scope.agendaStructure = listOfItemsSL.addItem($scope.agendaStructure);
        } else {
            $window.alert("Du skal udfylde det tomme felt.");
        };
    };
    
    $scope.removeAgendaItem = function(agendaNum) {
        // console.log("Entering removeAgendaItem. numAgendaItems: "+$scope.agendaStructure[4]);
        $scope.agendaStructure = listOfItemsSL.removeItem(agendaNum, $scope.agendaStructure);
    };

    $scope.editEvent = function(id) {

        var addr = {
            houseno: $scope.event.address.houseno, street: $scope.event.address.street, zip: $scope.event.address.zip, town: $scope.event.address.town
        };

        var organizers = [];
        // console.log(`Number of organizers: ${$scope.organiserStructure[4]}`);
        for (var i=0; i<$scope.organiserStructure[4]+1; i++) {
            if ($scope.organiserStructure[3][0][i] != "") {
                organizers.push({orgname: $scope.organiserStructure[3][0][i]});
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

        var agenda = [];
        // console.log(`Number of agenda items: ${$scope.agendaStructure[4]}`);
        if ($scope.yesAgenda) {
            for (var i=0; i<$scope.agendaStructure[4]+1; i++) {
                agenda.push({"item": $scope.agendaStructure[3][0][i], "description": $scope.agendaStructure[3][1][i]});
            };
            // console.log(`${JSON.stringify(agenda)}`);
        };

        var data = {
            eventName: $scope.event.eventName,
            year: $scope.event.year,
            venue: $scope.event.venue,
			address: addr,
            website: $scope.event.website,
            startdate: $scope.startdateView,
            enddate: $scope.enddateView,
            invitation: $scope.event.invitation,
            agendaOrNot: $scope.agendaOrNot,
            agenda: agenda,
            summaryExist: $scope.event.summaryExist
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

.controller('eventsadmindetailsCtrl', ['$scope', '$http', '$location', '$route', '$routeParams', '$window', 'AuthService', function($scope, $http, $location, $route, $routeParams, $window, AuthService) {

    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
            $scope.role = AuthService.userRole();
        };
    });

    $http({
        method: 'GET',
        url: '/tenants/mytenant',
        headers: {
            'x-auth': localStorage.userToken
        }
    }).then(function(tenant) {
        // console.log(`Tenant fetched. Status: ${tenant.status}. Tenant name: ${tenant.data.tenantName}`);
        $scope.tenantName = tenant.data.tenantName;
        // $scope.tenant = tenant.data;
        return $http({
            method: 'GET',
            url: '/events/' + $routeParams.id,
            headers: {
                'x-auth': localStorage.userToken
            }
        });
    }).then(function(response) {
        // console.log(`Success. Status: ${response.status}`);

        if (response.data) {
            // console.log(`Received the event`);
            $scope.event = response.data.event;
        } else {
            console.log('Event not found');
        };
        return $http({
            method: 'GET',
            url: 'eventtypes/' + $scope.event._eventtype,
            headers: {
                'x-auth': localStorage.userToken
            }
        });
    }).then(function(eventtype) {
        // console.log(`Eventtype collected with Success. Status: ${eventtype.status}`);
        $scope.eventtype = eventtype.data;
        // console.log(`Eventtype Name: ${$scope.eventtype.eventtypeName}`);
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
                $route.reload();
            }, function errorCallback(response) {
                console.log(`Status: ${response.status}`);
                if (response.status == 404) {
                    window-alert('Kun den, der har oprettet begivenheden, kan slette den.')
                    $location.path('/eventsadmin');
                };
            });
        };
    };
}])
