angular.module('familielejr')

.controller('financesCtrl', ['$scope', 'AuthService', function($scope, AuthService) {

    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
            $scope.role = AuthService.userRole();
        };
    });

}]);
