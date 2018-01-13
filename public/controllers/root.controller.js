angular.module('familielejr')

.controller('rootCtrl', ['$scope', '$location', 'AuthService', function($scope, $location, AuthService) {

    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
            $scope.role = AuthService.userRole();
            $location.path('/home');
        };
    });

}]);
