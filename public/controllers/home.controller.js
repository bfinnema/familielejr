angular.module('familielejr')

.controller('homeCtrl', ['$scope', '$http', 'AuthService', 
function($scope, $http, AuthService) {
    
    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
            $scope.role = AuthService.userRole();
        };
    });
    
    $scope.invitationExists2 = false;  // New
    $scope.showCommittees = [];

    $http({
        method: 'GET',
        url: 'tenants/mytenant',
        headers: {
            'x-auth': localStorage.userToken
        }
    }).then(function(tenant) {
        // console.log(`Success. Status: ${tenant.status}`);
        $scope.tenantName = tenant.data.tenantName;
        $scope.tenantDescription = tenant.data.description;
        return $http({
            method: 'GET',
            url: 'eventtypes',
            headers: {
                'x-auth': localStorage.userToken
            }
        });
    }).then(function(eventtypes) {
        // console.log(`Success. Status: ${eventtypes.status}`);
        $scope.eventtypes = eventtypes.data;
        return $http({
            method: 'GET',
            url: 'events/futureevents',
            headers: {
                'x-auth': localStorage.userToken
            }
        });
    }).then(function(futureevents) {
        // console.log(`Success. Status: ${futureevents.status}`);
        if (futureevents.data) {
            $scope.futureevents = futureevents.data;

            for (var f=0; f<$scope.futureevents.length; f++) {
                $scope.futureevents[f].showCommittees = false;
                // console.log(`${$scope.futureevents[f].eventName}, ${$scope.futureevents[f].showCommittees}`);
            };

            $scope.activeInvitations = $scope.futureevents.filter(obj => {
                return obj.invitation.active === true
            });

            // console.log(`Number of active invitations: ${$scope.activeInvitations.length}.`);
            if ($scope.activeInvitations.length > 0) {
                $scope.invitationExists2 = true;
                // console.log(`activeInvitations exist`);
            };

        };

    }, function errorCallback(response) {
        console.log(`Error. Status: ${response.status}`);
    });

    $scope.hoverIn = function(year) {
        $scope.showCommittees[year] = true;
        // console.log(`Hovered In. Year: ${year}, showC: ${$scope.showCommittees[year]}`);
    };

    $scope.hoverOut = function(year) {
        $scope.showCommittees[year] = false;
        // console.log(`Hovered Out. Year: ${year}, showC: ${$scope.showCommittees[year]}`);
    };

    $scope.eventHoverIn = function(futureevent) {
        futureevent.showCommittees = true;
        // console.log(`Hovered In. Event name: ${futureevent.eventName}, showC: ${futureevent.showCommittees}`);
    };

    $scope.eventHoverOut = function(futureevent) {
        futureevent.showCommittees = false;
        // console.log(`Hovered Out. Event name: ${futureevent.eventName}, showC: ${futureevent.showCommittees}`);
    };

}])
