angular.module('familielejr')

.controller('organizerinstructionCtrl', ['$scope', 'AuthService', 'YearService', function($scope, AuthService, YearService) {
    
    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
            $scope.role = AuthService.userRole();
        };
    });

    setTimeout(function(){
        angular.element(document.querySelector( '#organizerinstruction' ) ).addClass('active');
    }, 1000);

    var invyear = YearService.myYear(7,20);
    var pastyear = invyear - 1;
    $scope.invyear = invyear;
    $scope.pastyear = pastyear;

}]);
