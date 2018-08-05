angular.module('familielejr')

.controller('contentCtrl', ['$scope', 'AuthService', 
function($scope, AuthService) {

    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
            $scope.role = AuthService.userRole();
            // console.log(`User role: ${$scope.role}`);
        };
    });
    
    setTimeout(function(){
        angular.element(document.querySelector( '#contact' ) ).addClass('active');
    }, 1000);

}]);
