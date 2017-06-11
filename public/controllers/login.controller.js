angular.module('familielejr')

.controller('loginCtrl', ['$scope', '$http', '$location', 'AuthService', function($scope, $http, $location, AuthService) {
    
    $scope.loginUser = function() {

        var data = {
            email: $scope.inputEmail,
            password: $scope.inputPassword
        };
        $http.post('/users/login', data).then(function(response) {
            localStorage.userToken = response.headers()['x-auth'];
            localStorage.familielejrUserId = response.data._id;
            $location.path('/content');
            $scope.isLoggedIn = true;
        }, function errorCallback(response) {
            console.log(`getUserStatus: ${response.status}`);
            alert('Indtastede du korrekt kodeord?');
        });

    };

}]);
