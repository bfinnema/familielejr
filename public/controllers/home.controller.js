angular.module('familielejr')

.controller('homeCtrl', ['$scope', 'AuthService', function($scope, AuthService) {
    
    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
        };
    });
    
}])