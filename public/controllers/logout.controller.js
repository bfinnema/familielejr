angular.module('familielejr')

.controller('logoutCtrl', ['$scope', '$http', '$location', 'AuthService', function($scope, $http, $location, AuthService) {
    
    $scope.logoutUser = function() {

        if (localStorage.userToken) {
            $http({
                method: 'DELETE',
                url: '/users/me/token',
                headers: {
                    'x-auth': localStorage.userToken
                }
            }).then(function(response) {
                console.log(`Status: ${response.status}`);
                $location.path('/');
            }, function errorCallback(response) {
                console.log(`Status: ${response.status}`);
                $location.path('/login');
            });
            $scope.isLoggedIn = false;
            localStorage.removeItem('userToken');
            localStorage.removeItem('familielejrUserId');
        } else {
            $location.path('/login');
            alert('Please login!');
            $scope.isLoggedIn = false;
        }
    };

}]);
