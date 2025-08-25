angular.module('familielejr')

.controller('eventtypesCtrl', ['$scope', '$http', '$location', '$route', '$window', 'AuthService', function($scope, $http, $location, $route, $window, AuthService) {

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

    $scope.partCats = [0,1,2,3,4,5,6,7,8,9];
    $scope.partCatName = ["","","","","","","","","",""];
    $scope.partCatMinAge = [0,0,0,0,0,0,0,0,0,0];
    $scope.partCatMaxAge = [0,0,0,0,0,0,0,0,0,0];
    $scope.partCatPriceFull = [0,0,0,0,0,0,0,0,0,0];
    $scope.partCatPriceDay = [0,0,0,0,0,0,0,0,0,0];
    $scope.partCatActive = [true,true,true,true,true,true,true,true,true,true,]
    $scope.partCatsBtnShow = [false,true,false,false,false,false,false,false,false,false];
    $scope.partCatShow = [true,false,false,false,false,false,false,false,false,false];
    $scope.numPartCats = 0;
    var numPartCats
    $scope.eventtypeToEdit = {
        "eventtypeName": "Your New Category - change this!!",
        "description": "",
        "startYear": (new Date()).getFullYear(),
        "schedule": "Yearly",
        "charge": true
    };
    var participantCategories = [];
    for (i in $scope.partCats) {
        participantCategories.push({name: $scope.partCatName[i], minAge: $scope.partCatMinAge[i], maxAge: $scope.partCatMaxAge[i], priceFull: $scope.partCatPriceFull[i], priceDay: $scope.partCatPriceDay[i], active: $scope.partCatActive[i]});
    };
    $scope.eventtypeToEdit.participantCategories = participantCategories;

    $scope.agendaOrNot = false;
    $scope.noAgenda = false;
    $scope.yesAgenda = false;
    $scope.agendaItems = [0,1,2,3,4,5,6,7,8,9];
    $scope.agendaItemHeadline = ["","","","","","","","","",""];
    $scope.agendaItemDescription = ["","","","","","","","","",""];
    $scope.agendaItemsBtnShow = [false,false,false,false,false,false,false,false,false,false];
    $scope.agendaItemShow = [false,false,false,false,false,false,false,false,false,false];
    $scope.agendaItemsBtnShowSave = $scope.agendaItemsBtnShow;
    $scope.agendaItemShowSave = $scope.agendaItemShow;
    $scope.numAgendaItems = 0;
    var numAgendaItems
    var agenda = [];
    for (i in $scope.agendaItems) {
        agenda.push({item: $scope.agendaItemHeadline[i], description: $scope.agendaItemDescription[i]});
    };
    $scope.eventtypeToEdit.agenda = agenda;

    $scope.newEventtype = false;
    $scope.editEventtype = false;

    $scope.showPartCat = function() {
        // console.log(`-------------------------------------------------`);
        // console.log("Entering showPartCat. numPartCats: "+$scope.numPartCats);
        numPartCats = $scope.numPartCats;
        if ($scope.eventtypeToEdit.participantCategories[numPartCats].name) {
            // console.log("numPartCats: "+numPartCats+", Participant Category Name: "+$scope.eventtypeToEdit.participantCategories[numPartCats].name);
            numPartCats = numPartCats + 1;
            $scope.numPartCats = numPartCats;
            $scope.partCatShow[numPartCats] = true;
            $scope.partCatsBtnShow[numPartCats] = false;
            $scope.partCatsBtnShow[numPartCats+1] = true;
            $scope.eventtypeToEdit.participantCategories.push({name: "", minAge: 0, maxAge: 0, priceFull: 0, priceDay: 0, active: true});
        }
        else {
            $window.alert("Du skal udfylde det tomme kategori navn.");
        };
    };
    
    $scope.removePartCat = function(partCatNum) {
        // console.log(`-------------------------------------------------`);
        // console.log("Entering removePartCat. numPartCats: "+$scope.numPartCats);
        numPartCats = $scope.numPartCats;
        for (var i=partCatNum; i<numPartCats; i++) {
            console.log(`Before removeal: ${i}. Name: ${$scope.eventtypeToEdit.participantCategories[i].name}, minAge: ${$scope.eventtypeToEdit.participantCategories[i].minAge}, id: ${$scope.eventtypeToEdit._id}`);
            $scope.eventtypeToEdit.participantCategories[i].name = $scope.eventtypeToEdit.participantCategories[i+1].name;
            $scope.eventtypeToEdit.participantCategories[i].minAge = $scope.eventtypeToEdit.participantCategories[i+1].minAge;
            $scope.eventtypeToEdit.participantCategories[i].maxAge = $scope.eventtypeToEdit.participantCategories[i+1].maxAge;
            $scope.eventtypeToEdit.participantCategories[i].priceFull = $scope.eventtypeToEdit.participantCategories[i+1].priceFull;
            $scope.eventtypeToEdit.participantCategories[i].priceDay = $scope.eventtypeToEdit.participantCategories[i+1].priceDay;
            $scope.eventtypeToEdit.participantCategories[i].active = $scope.eventtypeToEdit.participantCategories[i+1].active;
            console.log(`AFTER removeal: ${i}. Name: ${$scope.eventtypeToEdit.participantCategories[i].name}, minAge: ${$scope.eventtypeToEdit.participantCategories[i].minAge}, id: ${$scope.eventtypeToEdit._id}`);
        };
        $scope.eventtypeToEdit.participantCategories[numPartCats].name = "";
        $scope.eventtypeToEdit.participantCategories[numPartCats].minAge = 0;
        $scope.eventtypeToEdit.participantCategories[numPartCats].maxAge = 0;
        $scope.eventtypeToEdit.participantCategories[numPartCats].priceFull = 0;
        $scope.eventtypeToEdit.participantCategories[numPartCats].priceDay = 0;
        $scope.eventtypeToEdit.participantCategories[numPartCats].active = true;
        $scope.partCatShow[numPartCats] = false;
        $scope.partCatsBtnShow[numPartCats] = true;
        $scope.partCatsBtnShow[numPartCats+1] = false;
        numPartCats -= 1;
        $scope.numPartCats = numPartCats;
        // console.log("numPartCats: "+numPartCats);
        $scope.eventtypeToEdit.participantCategories.pop();
    };

    $scope.agendaNegative = function() {
        console.log(`Entering agendaNegative. agendaOrNot: ${$scope.agendaOrNot}`);
        $scope.yesAgenda = false;
        $scope.agendaOrNot = false;
        $scope.agendaItemsBtnShowSave = $scope.agendaItemsBtnShow;
        $scope.agendaItemShowSave = $scope.agendaItemShow;
        $scope.agendaItemsBtnShow = [false,false,false,false,false,false,false,false,false,false];
        $scope.agendaItemShow = [false,false,false,false,false,false,false,false,false,false];
    };

    $scope.agendaPositive = function() {
        console.log(`Entering agendaPositive. agendaOrNot: ${$scope.agendaOrNot}`);
        $scope.noAgenda = false;
        $scope.agendaOrNot = true;
        if ($scope.numAgendaItems < 1) {
            $scope.agendaItemsBtnShow = [false,true,false,false,false,false,false,false,false,false];
            $scope.agendaItemShow = [true,false,false,false,false,false,false,false,false,false];
        } else {
            $scope.agendaItemsBtnShow = $scope.agendaItemsBtnShowSave;
            $scope.agendaItemShow = $scope.agendaItemShowSave;
        };
    };

    $scope.showAgendaItem = function() {
        console.log("Entering showAgendaItem. numAgendaItems: "+$scope.numAgendaItems);
        numAgendaItems = $scope.numAgendaItems;
        if ($scope.eventtypeToEdit.agenda[numAgendaItems].item) {
            console.log("numAgendaItems: "+numAgendaItems+", Agenda Item Headline: "+$scope.eventtypeToEdit.agenda[numAgendaItems].item);
            numAgendaItems = numAgendaItems + 1;
            $scope.numAgendaItems = numAgendaItems;
            $scope.agendaItemShow[numAgendaItems] = true;
            $scope.agendaItemsBtnShow[numAgendaItems] = false;
            $scope.agendaItemsBtnShow[numAgendaItems+1] = true;
        }
        else {
            $window.alert("Du skal udfylde det tomme felt.");
        };
    };
    
    $scope.removeAgendaItem = function(agendaNum) {
        console.log("Entering removeAgendaItem. numAgendaItems: "+$scope.numAgendaItems);
        numAgendaItems = $scope.numAgendaItems;
        for (var i=agendaNum; i<numAgendaItems; i++) {
            console.log(`Before removeal: ${i}. Item: ${$scope.eventtypeToEdit.agenda[i].item}, description: ${$scope.eventtypeToEdit.agenda[i].description}, id: ${$scope.eventtypeToEdit._id}`);
            $scope.eventtypeToEdit.agenda[i].item = $scope.eventtypeToEdit.agenda[i+1].item;
            $scope.eventtypeToEdit.agenda[i].description = $scope.eventtypeToEdit.agenda[i+1].description;
            console.log(`AFTER removeal: ${i}. Item: ${$scope.eventtypeToEdit.agenda[i].item}, description: ${$scope.eventtypeToEdit.agenda[i].description}, id: ${$scope.eventtypeToEdit._id}`);
        };
        $scope.eventtypeToEdit.agenda[numAgendaItems].item = "";
        $scope.eventtypeToEdit.agenda[numAgendaItems].description = "";
        $scope.agendaItemShow[numAgendaItems] = false;
        $scope.agendaItemsBtnShow[numAgendaItems] = true;
        $scope.agendaItemsBtnShow[numAgendaItems+1] = false;
        numAgendaItems -= 1;
        $scope.numAgendaItems = numAgendaItems;
        console.log("numAgendaItems: "+numAgendaItems);
        $scope.eventtypeToEdit.agenda.pop();
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
        console.log(`-------------------------------------------------`);
        console.log(`Entering editEventtypeToggle`);
        if ($scope.editEventtype) {
            $scope.editEventtype = false;
        } else {
            $scope.editEventtype = true;
            $scope.eventtypeToEdit = eventtypeToEdit;

            $scope.editFreeEvent = !eventtypeToEdit.charge;
            $scope.editID = eventtypeToEdit._id;

            $scope.partCatsBtnShow = [false,false,false,false,false,false,false,false,false,false];
            $scope.partCatShow = [true,false,false,false,false,false,false,false,false,false];
            numPartCats = eventtypeToEdit.participantCategories.length;
            $scope.partCatsBtnShow[numPartCats] = true;
            $scope.numPartCats = numPartCats;
            for (x=0; x<numPartCats; x++) {
                $scope.partCatShow[x] = true;
                console.log(`numPartCats: ${numPartCats}`);
                console.log(`${x}. partCatsBtnShow: ${$scope.partCatsBtnShow[x]}, partCatShow: ${$scope.partCatShow[x]}`);
                console.log(`${x}. Name: ${eventtypeToEdit.participantCategories[x].name}, minAge: ${eventtypeToEdit.participantCategories[x].minAge}`);
            };
            $scope.numPartCats = numPartCats-1;

            console.log(`agendaOrNot in eventtypeToEdit: ${eventtypeToEdit.agendaOrNot}`);
            $scope.agendaOrNot = eventtypeToEdit.agendaOrNot;
            $scope.yesAgenda = eventtypeToEdit.agendaOrNot;
            $scope.noAgenda = !eventtypeToEdit.agendaOrNot;
            console.log(`yesAgenda: ${$scope.yesAgenda}, noAgenda: ${$scope.noAgenda}`);
            $scope.agendaItemsBtnShow = [false,false,false,false,false,false,false,false,false,false];
            $scope.agendaItemShow = [true,false,false,false,false,false,false,false,false,false];
            numAgendaItems = eventtypeToEdit.agenda.length;
            $scope.agendaItemsBtnShow[numAgendaItems] = true;
            $scope.numAgendaItems = numAgendaItems;
            console.log(`numAgendaItems: ${numAgendaItems}`);
            for (x=0; x<numAgendaItems; x++) {
                $scope.agendaItemShow[x] = true;
                console.log(`${x}. agendaItemsBtnShow: ${$scope.agendaItemsBtnShow[x]}, agendaItemShow: ${$scope.agendaItemShow[x]}`);
                console.log(`${x}. Item: ${eventtypeToEdit.agenda[x].item}, description: ${eventtypeToEdit.agenda[x].description}`);
            };
            if (numAgendaItems > 0) {$scope.numAgendaItems = numAgendaItems-1;};
            $scope.agendaItemsBtnShowSave = $scope.agendaItemsBtnShow;
            $scope.agendaItemShowSave = $scope.agendaItemShow;
        };
    }

    $scope.addEventtype = function() {
        // console.log(`-------------------------------------------------`);
        // console.log(`In addEventtype. freeEvent: ${$scope.freeEvent}`);

        var participantCategories = [];
        for (var i=0; i<$scope.numPartCats+1; i++) {
            if ($scope.eventtypeToEdit.participantCategories[i].name != "") {
                // console.log(`${i}. Item: ${$scope.eventtypeToEdit.participantCategories[i].name}, minAge: ${$scope.eventtypeToEdit.participantCategories[i].minAge}`);
                participantCategories.push({
                    name: $scope.eventtypeToEdit.participantCategories[i].name,
                    minAge: $scope.eventtypeToEdit.participantCategories[i].minAge,
                    maxAge: $scope.eventtypeToEdit.participantCategories[i].maxAge,
                    priceFull: $scope.eventtypeToEdit.participantCategories[i].priceFull,
                    priceDay: $scope.eventtypeToEdit.participantCategories[i].priceDay,
                    active: $scope.eventtypeToEdit.participantCategories[i].active
                });
            };
        };

        var agenda = [];
        for (var i=0; i<$scope.numAgendaItems+1; i++) {
            if ($scope.eventtypeToEdit.agenda[i].item != "") {
                console.log(`${i}. Item: ${$scope.eventtypeToEdit.agenda[i].item}, description: ${$scope.eventtypeToEdit.agenda[i].description}, id: ${$scope.eventtypeToEdit._id}`);
                agenda.push({item: $scope.eventtypeToEdit.agenda[i].item, description: $scope.eventtypeToEdit.agenda[i].description});
            };
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
        console.log(`In eventtypeEdit. agendaOrNot: ${$scope.agendaOrNot}`);

        var agenda = $scope.eventtypeToEdit.agenda;
        if (!$scope.agendaOrNot) {agenda = [];};

        var eventtype = {
            eventtypeName: $scope.eventtypeToEdit.eventtypeName,
            description: $scope.eventtypeToEdit.description,
            startYear: $scope.eventtypeToEdit.startYear || (new Date()).getFullYear(),
            schedule: $scope.eventtypeToEdit.schedule,
            charge: !$scope.editFreeEvent || false,
            participantCategories: $scope.eventtypeToEdit.participantCategories,
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
            console.log(`Status: ${response.status}`);
            console.log(response.data);
            console.log(`Count: ${response.data.count}`);
            if (response.data.count < 1) {
                if ($window.confirm('Bekræft venligst at du vil slette begivenhedskategorien')) {
                    $http({
                        method: 'DELETE',
                        url: 'eventtypes/'+eventtype._id,
                        headers: {
                            'x-auth': localStorage.userToken
                        }
                    }).then(function(response) {
                        console.log(`Status: ${response.status}`);
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
