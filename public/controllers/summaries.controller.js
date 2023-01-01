angular.module('familielejr')

.controller('summariesCtrl', ['$scope', '$http', '$location', '$route', '$window', 'AuthService', 'YearService', 
function($scope, $http, $location, $route, $window, AuthService, YearService) {

    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
            $scope.role = AuthService.userRole();
        };
    });

    var invyear = YearService.myYear("futurecamps");
    var pastyear = invyear - 1;
    // console.log(`summariesCtrl: Invyear: ${invyear}, Pastyear: ${pastyear}`);
    $scope.newSummaryEntry = false;
    $scope.editSummaryEntry = false;

    $http({
        method: 'GET',
        url: '/summaries',
        headers: {
            'x-auth': localStorage.userToken
        }
    }).then(function(response) {
        // console.log(`Success. Status: ${response.status}`);
        if (response.data) {
            $scope.summaries = response.data;
        } else {
            console.log('No summaries');
        };
        angular.element(document.querySelector( '#summaries' ) ).addClass('active');
    }, function errorCallback(response) {
        console.log(`Error. Status: ${response.status}`);
    });

    $scope.agendaItems = [0,1,2,3,4,5,6,7,8,9];
    $scope.agendaItemHeadline = ["","","","","","","","","",""];
    $scope.agendaItemDescription = ["","","","","","","","","",""];
    $scope.agendaItemDecisions = ["","","","","","","","","",""];
    $scope.agendaItemsBtnShow = [false,true,false,false,false,false,false,false,false,false];
    $scope.agendaItemShow = [true,false,false,false,false,false,false,false,false,false];
    $scope.numAgendaItems = 0;
    var numAgendaItems
    $scope.editSummary = {
        "year": invyear,
        "meetingdate": new Date(),
        "visible": false
    };
    var agenda = [];
    for (i in $scope.agendaItems) {
        agenda.push({item: $scope.agendaItemHeadline[i], description: $scope.agendaItemDescription[i], decision: $scope.agendaItemDecisions[i]});
    };
    $scope.editSummary.agenda = agenda;

    $scope.showAgendaItem = function() {
        // console.log("Entering showAgendaItem. numAgendaItems: "+$scope.numAgendaItems);
        numAgendaItems = $scope.numAgendaItems;
        if ($scope.editSummary.agenda[numAgendaItems].item) {
            // console.log("numAgendaItems: "+numAgendaItems+", Agenda Item Headline: "+$scope.editSummary.agenda[numAgendaItems].item);
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
        // console.log("Entering removeAgendaItem. numAgendaItems: "+$scope.numAgendaItems);
        numAgendaItems = $scope.numAgendaItems;
        for (var i=agendaNum; i<numAgendaItems; i++) {
            // console.log(`Before removeal: ${i}. Item: ${$scope.editSummary.agenda[i].item}, description: ${$scope.editSummary.agenda[i].description}, id: ${$scope.editSummary._id}`);
            $scope.editSummary.agenda[i].item = $scope.editSummary.agenda[i+1].item;
            $scope.editSummary.agenda[i].description = $scope.editSummary.agenda[i+1].description;
            $scope.editSummary.agenda[i].decision = $scope.editSummary.agenda[i+1].decision;
            // console.log(`AFTER removeal: ${i}. Item: ${$scope.editSummary.agenda[i].item}, description: ${$scope.editSummary.agenda[i].description}, id: ${$scope.editSummary._id}`);
        };
        $scope.editSummary.agenda[numAgendaItems].item = "";
        $scope.editSummary.agenda[numAgendaItems].description = "";
        $scope.editSummary.agenda[numAgendaItems].decision = "";
        $scope.agendaItemShow[numAgendaItems] = false;
        $scope.agendaItemsBtnShow[numAgendaItems] = true;
        $scope.agendaItemsBtnShow[numAgendaItems+1] = false;
        numAgendaItems -= 1;
        $scope.numAgendaItems = numAgendaItems;
        // console.log("numAgendaItems: "+numAgendaItems);
        $scope.editSummary.agenda.pop();
    };

    $scope.newSummaryEntryToggle = function() {
        if ($scope.newSummaryEntry) {
            $scope.newSummaryEntry = false;
        } else {
            $scope.newSummaryEntry = true;
            $scope.numAgendaItems = 0;
        };
    };

    $scope.editSummaryEntryToggle = function(editSummary) {
        if ($scope.editSummaryEntry) {
            $scope.editSummaryEntry = false;
        } else {
            $scope.editSummaryEntry = true;
            $scope.editSummary = editSummary;
            $scope.editMeetingdate = new Date(editSummary.meetingdate);
            $scope.agendaItemsBtnShow = [false,false,false,false,false,false,false,false,false,false];
            $scope.agendaItemShow = [true,false,false,false,false,false,false,false,false,false];
            numAgendaItems = editSummary.agenda.length;
            $scope.agendaItemsBtnShow[numAgendaItems] = true;
            $scope.numAgendaItems = numAgendaItems;
            for (x=0; x<numAgendaItems; x++) {
                $scope.agendaItemShow[x] = true;
                // console.log(`numAgendaItems: ${numAgendaItems}`);
                // console.log(`${x}. agendaItemsBtnShow: ${$scope.agendaItemsBtnShow[x]}, agendaItemShow: ${$scope.agendaItemShow[x]}`);
                // console.log(`${x}. Item: ${editSummary.agenda[x].item}, description: ${editSummary.agenda[x].description}`);
            };
            $scope.numAgendaItems = numAgendaItems-1;
        };
    }

    $scope.makeVisible = function(summary) {
        if (summary.visible) {summary.visible = false;} else {summary.visible = true;}
    }

    $scope.addSummary = function() {

        var agenda = [];
        for (var i=0; i<$scope.numAgendaItems+1; i++) {
            if ($scope.editSummary.agenda[i].item != "") {
                // console.log(`${i}. Item: ${$scope.editSummary.agenda[i].item}, description: ${$scope.editSummary.agenda[i].description}, id: ${$scope.editSummary._id}`);
                agenda.push({item: $scope.editSummary.agenda[i].item, description: $scope.editSummary.agenda[i].description, decision: $scope.editSummary.agenda[i].decision});
            };
        };

        var data = {
            year: $scope.year,
            meetingdate: $scope.meetingdate,
            visible: false,
        };
        
        if (agenda.length > 0) {data.agenda = agenda;};

        $http({
            method: 'POST',
            url: '/summaries',
            headers: {
                'x-auth': localStorage.userToken
            },
            data: data
        }).then(function(response) {
            $location.path('/summaries');
            $route.reload();
        }, function errorCallback(response) {
            console.log(`Status: ${response.status}`);
        });
 
    };

    $scope.summaryEdit = function() {

        /* for (var i=0; i<$scope.numAgendaItems; i++) {
            console.log(`${i}. Item: ${$scope.editSummary.agenda[i].item}, description: ${$scope.editSummary.agenda[i].description}, id: ${$scope.editSummary._id}`);
        }; */

        var data = {
            year: $scope.year,
            meetingdate: $scope.meetingdate,
            agenda: $scope.editSummary.agenda,
            visible: false,
        };
        
        $http({
            method: 'PATCH',
            url: '/summaries/'+$scope.editSummary._id,
            headers: {
                'x-auth': localStorage.userToken
            },
            data: data
        }).then(function(response) {
            $location.path('/summaries');
            $route.reload();
        }, function errorCallback(response) {
            console.log(`Status: ${response.status}`);
        });
 
    };

    $scope.removeSummary = function(summary) {
        if ($window.confirm('Bekræft venligst at du vil slette hele referatet')) {
            $http({
                method: 'DELETE',
                url: 'summaries/'+summary._id,
                headers: {
                    'x-auth': localStorage.userToken
                }
            }).then(function(response) {
                // console.log(`Status: ${response.status}`);
                // console.log(response.data);
                $location.path('/summaries');
                $route.reload();
            }, function errorCallback(response) {
                console.log(`Status: ${response.status}`);
            });
        };
    };

}])
