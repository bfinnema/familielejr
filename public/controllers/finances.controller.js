angular.module('familielejr')

.controller('financesCtrl', ['$scope', 'AuthService', function($scope, AuthService) {

    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
            $scope.role = AuthService.userRole();
        };
    });

    setTimeout(function(){
        angular.element(document.querySelector( '#organizer' ) ).addClass('active');
        angular.element(document.querySelector( '#finances' ) ).addClass('active');
    }, 1000);

}]);
