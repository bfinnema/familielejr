angular.module('familielejr')

.controller('registerCtrl', ['$scope', '$http', '$location', 'AuthService', function($scope, $http, $location, AuthService) {
    
    $scope.registerUser = function() {
        console.log(`inputEmail: ${$scope.inputEmail}, inputPassword: ${$scope.inputPassword}`);

        var data = {
            email: $scope.inputEmail,
            password: $scope.inputPassword
        };
        $http.post('/users', data).then(function(response) {
            console.log(response.headers());
            console.log('Status: ' + response.status);
            console.log(response.data._id, response.data.email);
            localStorage.userToken = response.headers()['x-auth'];
            localStorage.familielejrUserId = response.data._id;
            $location.path('/indhold');
            $scope.isLoggedIn = true;
        });

    };

}]);
