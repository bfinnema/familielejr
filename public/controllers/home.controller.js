angular.module('familielejr')

.controller('homeCtrl', ['$scope', '$http', 'AuthService', 'YearService', 
function($scope, $http, AuthService, YearService) {
    
    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
            $scope.role = AuthService.userRole();
        };
    });
    
    var months = ["januar", "februar", "marts", "april", "maj", "juni", "juli", "august", "september", "oktober", "november", "december"];
    var days = ["søndag", "mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag"];

    var invyear = YearService.myYear(7,20);
    var pastyear = invyear - 1;
    $scope.invyear = invyear;
    $scope.pastyear = pastyear;
    // console.log(`Home Ctrl. Invyear: ${invyear}. Pastyear: ${pastyear}`);
    var invitationExists = false;
    $scope.invitationExists = invitationExists;
    $scope.showCommittees = [];

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
            $scope.endday = days[ed.getDay()];
            $scope.enddate = ed.getDate();
            $scope.endmonth = months[ed.getMonth()];
            var dl = new Date($scope.invitation.registration.deadline);
            $scope.deadlineday = days[dl.getDay()];
            $scope.deadlinedate = dl.getDate();
            $scope.deadlinemonth = months[dl.getMonth()];
            $scope.organizer1 = $scope.invitation.organizers[0].name;
            if ($scope.invitation.organizers[1]) {$scope.organizer2 = $scope.invitation.organizers[1].name;};
            if ($scope.invitation.organizers[2]) {$scope.organizer3 = $scope.invitation.organizers[2].name;};
            if ($scope.invitation.organizers[3]) {$scope.organizer4 = $scope.invitation.organizers[3].name;};
            if ($scope.invitation.organizers[4]) {$scope.organizer5 = $scope.invitation.organizers[4].name;};
        } else {
            // console.log('Invitation does not exist');
        };
    }, function errorCallback(response) {
        console.log(`Error. Status: ${response.status}`);
    });

    $http({
        method: 'GET',
        url: '/futurecamps/future/' + pastyear,
        headers: {
            'x-auth': localStorage.userToken
        }
    }).then(function(response) {
        // console.log(`Success. Status: ${response.status}`);
        if (response.data) {
            $scope.camps = response.data;
            for (var i=0; i<$scope.camps.length; i++) {
                $scope.showCommittees[$scope.camps[i].year] = false;
                // console.log(`Year: ${$scope.camps[i].year}, showC: ${$scope.showCommittees[$scope.camps[i].year]}`);
            };
        } else {
            console.log('No future camps');
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

}])