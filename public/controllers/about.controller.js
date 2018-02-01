angular.module('familielejr')

.controller('aboutCtrl', ['$scope', 'AuthService', function($scope, AuthService) {
    
    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
            $scope.role = AuthService.userRole();
        };
    });

    setTimeout(function(){
        angular.element(document.querySelector( '#about' ) ).addClass('active');
    }, 1000);

}]);
