angular.module('familielejr')

.controller('eventtypesCtrl', ['$scope', '$http', '$location', '$route', '$window', 'AuthService', 'listOfItemsSL', function($scope, $http, $location, $route, $window, AuthService, listOfItemsSL) {

    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
            $scope.role = AuthService.userRole();
        };
    });

    setTimeout(function(){
        angular.element(document.querySelector( '#admin' ) ).addClass('active');
        angular.element(document.querySelector( '#eventtypes' ) ).addClass('active');
    }, 1000);

    $scope.schedules = [
        {"schedule": "Yearly"},
        {"schedule": "Quarterly"},
        {"schedule": "Monthly"},
        {"schedule": "Weekly"},
        {"schedule": "OneOff"}
    ];

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
            url: '/eventtypes',
            headers: {
                'x-auth': localStorage.userToken
            }
        });
    }).then(function(response) {
        // console.log(`Success. Status: ${response.status}`);
        $scope.eventtypes = response.data;
        // console.log($scope.eventtypes[0]);
    }, function errorCallback(response) {
        console.log(`Error. Status: ${response.status}`);
    });

    $scope.partCatsStructure = listOfItemsSL.prepareList([10,0], ["",0,0,0,0,false]);

    $scope.agendaOrNot = false;
    $scope.noAgenda = false;
    $scope.yesAgenda = false;

    $scope.agendaStructure = listOfItemsSL.prepareList([10,0], ["",""]);

    $scope.newEventtype = false;
    $scope.editEventtype = false;

    $scope.showPartCat = function() {
        // console.log("Entering showPartCat. numPartCats: "+$scope.partCatsStructure[4]);
        if ($scope.partCatsStructure[3][0][$scope.partCatsStructure[4]]) {
            // console.log("numLines: "+$scope.partCatsStructure[4]+", Item: "+$scope.partCatsStructure[3][0][$scope.partCatsStructure[4]]);
            $scope.partCatsStructure = listOfItemsSL.addItem($scope.partCatsStructure);
        } else {
            $window.alert("Du skal udfylde det tomme felt.");
        };
    };
    
    $scope.removePartCat = function(partCatNum) {
        console.log("Entering removePartCat. numPartCats: "+$scope.partCatsStructure[4]);
        $scope.partCatsStructure = listOfItemsSL.removeItem(partCatNum, $scope.partCatsStructure);
    };

    $scope.agendaNegative = function() {
        // console.log(`Entering agendaNegative. agendaOrNot: ${$scope.agendaOrNot}`);
        $scope.yesAgenda = false;
        $scope.agendaOrNot = false;
        /* $scope.agendaBtnShow = $scope.agendaStructure[1];
        $scope.agendaItemShow = $scope.agendaStructure[2];
        $scope.agendaStructure[1] = [false,false,false,false,false,false,false,false,false,false];
        $scope.agendaStructure[2] = [false,false,false,false,false,false,false,false,false,false]; */
    };

    $scope.agendaPositive = function() {
        // console.log(`Entering agendaPositive. agendaOrNot: ${$scope.agendaOrNot}`);
        $scope.yesAgenda = true;
        $scope.noAgenda = false;
        $scope.agendaOrNot = true;
        /* if ($scope.agendaStructure[4] < 1) {
            console.log(`Number of agenda items < 1`);
            // $scope.agendaItemsBtnShow = [false,true,false,false,false,false,false,false,false,false];
            // $scope.agendaItemShow = [true,false,false,false,false,false,false,false,false,false];
        } else {
            $scope.agendaStructure[1] = $scope.agendaBtnShow;
            $scope.agendaStructure[2] = $scope.agendaItemShow;
            // console.log(`agendaStructure: ${$scope.agendaStructure}`);
        }; */
    };

    $scope.showAgendaItem = function() {
        // console.log("Entering showAgendaItem. numAgendaItems: "+$scope.agendaStructure[4]);
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

    $scope.newEventtypeToggle = function() {
        if ($scope.newEventtype) {
            $scope.newEventtype = false;
        } else {
            $scope.newEventtype = true;
            $scope.numPartCats = 0;
        };
    };

    $scope.editEventtypeToggle = function(eventtypeToEdit) {
        // console.log(`-------------------------------------------------`);
        // console.log(`Entering editEventtypeToggle`);
        if ($scope.editEventtype) {
            $scope.editEventtype = false;
        } else {
            $scope.editEventtype = true;
            $scope.eventtypeToEdit = eventtypeToEdit;

            $scope.editFreeEvent = !eventtypeToEdit.charge;
            $scope.editID = eventtypeToEdit._id;

            $scope.partCatsStructure = listOfItemsSL.prepareList([10,0], ["",0,0,0,0,false]);
            var participantCategories = eventtypeToEdit.participantCategories;
            // console.log(`participant categories: ${JSON.stringify(participantCategories)}`);
            for (var i=0; i<participantCategories.length; i++) {
                $scope.partCatsStructure[3][0][i] = participantCategories[i].name;
                $scope.partCatsStructure[3][1][i] = participantCategories[i].minAge;
                $scope.partCatsStructure[3][2][i] = participantCategories[i].maxAge;
                $scope.partCatsStructure[3][3][i] = participantCategories[i].PriceFull;
                $scope.partCatsStructure[3][4][i] = participantCategories[i].priceDay;
                $scope.partCatsStructure[3][5][i] = participantCategories[i].active;
            };
            $scope.partCatsStructure = listOfItemsSL.prepareEdit($scope.eventtypeToEdit.participantCategories.length-1, $scope.partCatsStructure);

            // console.log(`agendaOrNot in eventtypeToEdit: ${eventtypeToEdit.agendaOrNot}`);
            $scope.agendaOrNot = eventtypeToEdit.agendaOrNot;
            $scope.yesAgenda = eventtypeToEdit.agendaOrNot;
            $scope.noAgenda = !eventtypeToEdit.agendaOrNot;
            // console.log(`yesAgenda: ${$scope.yesAgenda}, noAgenda: ${$scope.noAgenda}`);

            $scope.agendaStructure = listOfItemsSL.prepareList([10,0], ["",""]);
            var agenda = eventtypeToEdit.agenda;
            // console.log(`agenda: ${JSON.stringify(agenda)}`);
            for (var i=0; i<agenda.length; i++) {
                $scope.agendaStructure[3][0][i] = agenda[i].item;
                $scope.agendaStructure[3][1][i] = agenda[i].description;
            };
            $scope.agendaStructure = listOfItemsSL.prepareEdit(agenda.length-1, $scope.agendaStructure);
            // console.log(`agendaStructure: ${$scope.agendaStructure}`);
        };
    }

    $scope.addEventtype = function() {
        // console.log(`-------------------------------------------------`);
        // console.log(`In addEventtype. freeEvent: ${$scope.freeEvent}`);

        var participantCategories = [];
        for (var i=0; i<$scope.partCatsStructure[4]+1; i++) {
            if ($scope.partCatsStructure[3][0][i].name != "") {
                // console.log(`${i}. Item: ${$scope.partCatsStructure[3][0][i]}, minAge: ${$scope.partCatsStructure[3][1][i]}`);
                participantCategories.push({
                    name: $scope.partCatsStructure[3][0][i],
                    minAge: $scope.partCatsStructure[3][1][i],
                    maxAge: $scope.partCatsStructure[3][2][i],
                    priceFull: $scope.partCatsStructure[3][3][i],
                    priceDay: $scope.partCatsStructure[3][4][i],
                    active: $scope.partCatsStructure[3][5][i]
                });
            };
        };
        // console.log(`participantCategories: ${JSON.stringify(participantCategories)}`);

        var agenda = [];
        // console.log(`Number of agenda items: ${$scope.agendaStructure[4]}`);
        if ($scope.yesAgenda) {
            for (var i=0; i<$scope.agendaStructure[4]+1; i++) {
                agenda.push({"item": $scope.agendaStructure[3][0][i], "description": $scope.agendaStructure[3][1][i]});
            };
            // console.log(`${JSON.stringify(agenda)}`);
        };

        var eventtype = {
            eventtypeName: $scope.eventtypeName,
            description: $scope.description,
            startYear: $scope.startYear || (new Date()).getFullYear(),
            schedule: $scope.schedule,
            charge: !$scope.freeEvent || false,
            participantCategories: participantCategories,
            agendaOrNot: $scope.agendaOrNot,
            agenda: agenda
        };

        $http({
            method: 'POST',
            url: 'eventtypes',
            headers: {
                'x-auth': localStorage.userToken
            },
            data: eventtype
        }).then(function(response) {
            // console.log(`Status: ${response.status}`);
            // console.log(response.data._id);
            $location.path('/eventtypes');
            $route.reload();
        }, function errorCallback(response) {
            console.log(`Status: ${response.status}`);
        });
    };

    $scope.eventtypeEdit = function() {
        // console.log(`In eventtypeEdit. agendaOrNot: ${$scope.agendaOrNot}`);

        var participantCategories = [];
        for (var i=0; i<$scope.partCatsStructure[4]+1; i++) {
            if ($scope.partCatsStructure[3][0][i].name != "") {
                // console.log(`${i}. Item: ${$scope.partCatsStructure[3][0][i]}, minAge: ${$scope.partCatsStructure[3][1][i]}`);
                participantCategories.push({
                    name: $scope.partCatsStructure[3][0][i],
                    minAge: $scope.partCatsStructure[3][1][i],
                    maxAge: $scope.partCatsStructure[3][2][i],
                    priceFull: $scope.partCatsStructure[3][3][i],
                    priceDay: $scope.partCatsStructure[3][4][i],
                    active: $scope.partCatsStructure[3][5][i]
                });
            };
        };
        // console.log(`participantCategories: ${JSON.stringify(participantCategories)}`);

        var agenda = [];
        // console.log(`Number of agenda items: ${$scope.agendaStructure[4]}`);
        if ($scope.yesAgenda) {
            for (var i=0; i<$scope.agendaStructure[4]+1; i++) {
                agenda.push({"item": $scope.agendaStructure[3][0][i], "description": $scope.agendaStructure[3][1][i]});
            };
            // console.log(`${JSON.stringify(agenda)}`);
        };

        // var agenda = $scope.eventtypeToEdit.agenda;
        if (!$scope.agendaOrNot) {agenda = [];};

        var eventtype = {
            eventtypeName: $scope.eventtypeToEdit.eventtypeName,
            description: $scope.eventtypeToEdit.description,
            startYear: $scope.eventtypeToEdit.startYear || (new Date()).getFullYear(),
            schedule: $scope.eventtypeToEdit.schedule,
            charge: !$scope.editFreeEvent || false,
            participantCategories: participantCategories,
            agendaOrNot: $scope.agendaOrNot,
            agenda: agenda
        };

        $http({
            method: 'PATCH',
            url: '/eventtypes/'+$scope.editID,
            headers: {
                'x-auth': localStorage.userToken
            },
            data: eventtype
        }).then(function(response) {
            $location.path('/eventtypes');
            $route.reload();
        }, function errorCallback(response) {
            console.log(`editUserStatus: ${response.status}`);
        });

    };

    $scope.removeEventtype = function(eventtype) {
        $http({
            method: 'GET',
            url: 'events/count/' + eventtype._id,
            headers: {
                'x-auth': localStorage.userToken
            }
        }).then(function(response) {
            // console.log(`Status: ${response.status}`);
            // console.log(response.data);
            // console.log(`Count: ${response.data.count}`);
            if (response.data.count < 1) {
                if ($window.confirm('Bekræft venligst at du vil slette begivenhedskategorien')) {
                    $http({
                        method: 'DELETE',
                        url: 'eventtypes/'+eventtype._id,
                        headers: {
                            'x-auth': localStorage.userToken
                        }
                    }).then(function(response) {
                        // console.log(`Status: ${response.status}`);
                        // console.log(response.data);
                        $location.path('/eventtypes');
                        $route.reload();
                    }, function errorCallback(response) {
                        console.log(`Status: ${response.status}`);
                    });
                };
            } else {
                $window.alert('Begivenhedskategorien ' + eventtype.eventtypeName + ' kan ikke slettes, da der stadig er begivenheder baseret på denne begivenhedskategori.');
            };
        }, function errorCallback(response) {
            console.log(`Error Status: ${response.status}`);
        });
    };

    $scope.eventtypeDetailsToggle = function(eventtype) {
        $scope.etd = eventtype;
        if ($scope.showEventtypeDetails) {
            $scope.showEventtypeDetails = false;
        } else {
            $scope.showEventtypeDetails = true;
        };
    };

}]);
