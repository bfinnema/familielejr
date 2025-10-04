angular.module('familielejr')

.controller('summariesCtrl', ['$scope', '$http', '$location', '$route', '$window', 'AuthService', 'listOfItemsSL', 
function($scope, $http, $location, $route, $window, AuthService, listOfItemsSL) {

    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
            $scope.role = AuthService.userRole();
        };
    });

    $scope.newSummaryEntry = false;
    $scope.editSummaryEntry = false;
    $scope.eventSelected = true;
    $scope.noRecentEventsWithNoSummary = false;

    $http({
        method: 'GET',
        url: '/tenants/mytenant',
        headers: {
            'x-auth': localStorage.userToken
        }
    }).then(function(tenant) {
        // console.log(`Tenant fetched. Status: ${tenant.status}. Tenant name: ${tenant.data.tenantName}`);
        $scope.tenantName = tenant.data.tenantName;
        $scope.tenant = tenant.data;
        return $http({
            method: 'GET',
            url: '/summaries',
            headers: {
                'x-auth': localStorage.userToken
            }
        });
    }).then(function(summaries) {
        // console.log(`Success. Status: ${summaries.status}`);
        if (summaries.data) {
            $scope.summaries = summaries.data;
        } else {
            console.log('No summaries');
        };
        angular.element(document.querySelector( '#summaries' ) ).addClass('active');
    }, function errorCallback(response) {
        console.log(`Error. Status: ${response.status}`);
    });

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

    $scope.newSummaryEntryToggle = function() {
        if ($scope.newSummaryEntry) {
            $scope.newSummaryEntry = false;
        } else {
            $scope.numAgendaItems = 0;
            $scope.eventSelected = false;

            let today = new Date();
            // console.log("Today's date = " + today);
            Date.prototype.subtractDays = function (d) {
                this.setDate(this.getDate() - d);
                return this;
            };
            let a = new Date();
            a.subtractDays(60);
            // console.log(a);

            $http({
                method: 'GET',
                url: '/events/summaryadmin/' + a.getFullYear() + '/' + a.getMonth() + '/' + a.getDate(),
                headers: {
                    'x-auth': localStorage.userToken
                }
            }).then(function(events) {
                console.log(`Events later than ${new Date(a.getFullYear(), a.getMonth(), a.getDate())} and summary does not exist fetched. Status: ${events.status}. # events: ${events.data.length}`);
                if (events.data.length > 0) {
                    console.log(`There are some events without summary. Name of first: ${events.data[0].eventName}`);
                    if (events.data.length == 1) {
                        $scope.event = events.data[0];
                        console.log(`There is only one event without summary. name: ${$scope.event.eventName}`);
                        $scope.eventSelected = true;
                        $scope.newSummaryEntry = true;
                        setSummaryData();
                    } else {
                        $scope.events = events.data;
                    };
                } else {
                    console.log(`There are no recent events without summary.`);
                    $scope.noRecentEventsWithNoSummary = true;
                    $scope.eventSelected = true;
                };
            }, function errorCallback(response) {
                console.log(`Error. Status: ${response.status}`);
            });
        };
    };

    $scope.selectEvent = function() {
        console.log(`In selectEvent`);
        $scope.event = JSON.parse($scope.selEvent);
        $scope.eventSelected = true;
        $scope.newSummaryEntry = true;
        setSummaryData()
    };

    setSummaryData = function() {
        $scope.name = (`Referat af ${$scope.event.eventName}`);
        $scope.meetingdate = new Date($scope.event.startdate);
        $scope.agendaStructure = listOfItemsSL.prepareList([10,0], ["","",""]);
        var agenda = $scope.event.agenda;
        // console.log(`agenda: ${JSON.stringify(agenda)}`);
        for (var i=0; i<agenda.length; i++) {
            $scope.agendaStructure[3][0][i] = agenda[i].item;
            $scope.agendaStructure[3][1][i] = agenda[i].description;
        };
        $scope.agendaStructure = listOfItemsSL.prepareEdit(Math.max(0, agenda.length-1), $scope.agendaStructure);
        // console.log(`agendaStructure: ${$scope.agendaStructure}`);
    };

    $scope.editSummaryEntryToggle = function(editSummary) {
        if ($scope.editSummaryEntry) {
            $scope.editSummaryEntry = false;
        } else {
            $scope.editSummaryEntry = true;
            $scope.editSummary = editSummary;
            $scope.editMeetingdate = new Date(editSummary.meetingdate);

            $scope.agendaStructure = listOfItemsSL.prepareList([10,0], ["","",""]);
            var agenda = $scope.editSummary.agenda;
            console.log(`agenda: ${JSON.stringify(agenda)}`);
            for (var i=0; i<agenda.length; i++) {
                $scope.agendaStructure[3][0][i] = agenda[i].item;
                $scope.agendaStructure[3][1][i] = agenda[i].description;
                $scope.agendaStructure[3][2][i] = agenda[i].decision;
            };
            $scope.agendaStructure = listOfItemsSL.prepareEdit(agenda.length-1, $scope.agendaStructure);
            console.log(`agendaStructure: ${$scope.agendaStructure}`);
        };
    };

    $scope.makeVisible = function(summary) {
        if (summary.visible) {
            summary.visible = false;
        } else {
            summary.visible = true;
        };
    };

    $scope.addSummary = function() {

        var agenda = [];
        // console.log(`Number of agenda items: ${$scope.agendaStructure[4]}`);
        for (var i=0; i<$scope.agendaStructure[4]+1; i++) {
            agenda.push({"item": $scope.agendaStructure[3][0][i], "description": $scope.agendaStructure[3][1][i], "decision": $scope.agendaStructure[3][2][i]});
        };
        // console.log(`${JSON.stringify(agenda)}`);

        var data = {
            name: $scope.name,
            meetingdate: $scope.meetingdate,
            visible: false,
            _event: $scope.event._id
        };
        
        if (agenda.length > 0) {data.agenda = agenda;};

        $http({
            method: 'POST',
            url: '/summaries',
            headers: {
                'x-auth': localStorage.userToken
            },
            data: data
        }).then(function(summary) {
            console.log(`Summary posted, _id: ${summary.data._id}`);
            return $http({
                method: 'PATCH',
                url: '/events/summary/' + $scope.event._id,
                headers: {
                    'x-auth': localStorage.userToken
                },
                data: {
                    'summaryExist': true,
                    '_summary': summary.data._id
                }
            });
        }).then(function(event) {
            console.log(`Event patched with summary information.`);
            $location.path('/summaries');
            $route.reload();
        }, function errorCallback(response) {
            console.log(`Status: ${response.status}`);
            if (response.status == 409) {
                $window.alert("Navnet på referatet findes allerede. Vær venlig at ændre det.");
            };
        });
 
    };

    $scope.summaryEdit = function() {

        var agenda = [];
        // console.log(`Number of agenda items: ${$scope.agendaStructure[4]}`);
        for (var i=0; i<$scope.agendaStructure[4]+1; i++) {
            agenda.push({"item": $scope.agendaStructure[3][0][i], "description": $scope.agendaStructure[3][1][i], "decision": $scope.agendaStructure[3][2][i]});
        };
        // console.log(`${JSON.stringify(agenda)}`);

        var data = {
            name: $scope.editSummary.name,
            meetingdate: $scope.editMeetingdate,
            agenda: agenda,
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
            if (response.status == 409) {
                $window.alert("Navnet på referatet findes allerede. Vær venlig at ændre det.");
            };
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
            }).then(function(summary) {
                // console.log(`Summary deleted, _id: ${summary.data._id}. _event: ${summary.data._event}`);
                return $http({
                    method: 'PATCH',
                    url: '/events/summary/' + summary.data._event,
                    headers: {
                        'x-auth': localStorage.userToken
                    },
                    data: {
                        'summaryExist': false,
                        '_summary': '111111111111111111111111'
                    }
                });
            }).then(function(event) {
                // console.log(`Status: ${event.status}`);
                // console.log(JSON.stringify(event.data));
                $location.path('/summaries');
                $route.reload();
            }, function errorCallback(response) {
                console.log(`Status: ${response.status}`);
            });
        };
    };

}])
