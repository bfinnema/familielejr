angular.module('familielejr')

.controller('changepwdCtrl', ['$scope', '$http', '$location', 'AuthService', function($scope, $http, $location, AuthService) {
    
    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
        };
    });

    $scope.changePwd = function() {

        token = localStorage.userToken;

        var data = {
            password: $scope.currentPassword,
            newpassword: $scope.newPassword,
            confirmnpwd: $scope.repeatnewPassword
        };

        $http({
            method: 'POST',
            url: '/users/me/password',
            headers: {
                'x-auth': token
            },
            data: data
        }).then(function(response) {
            localStorage.userToken = response.headers()['x-auth'];
            $location.path('/profile');
            $scope.isLoggedIn = true;
        }, function errorCallback(response) {
            console.log(`getUserStatus: ${response.status}`);
            if (response.status == 400) {
                alert('Indtastede du korrekt kodeord?');
            } else if (response.status == 401) {
                alert('Kodeord og gentaget kodeord skal være ens');
            } else {
                alert('Noget gik galt');
            };
        });

    };

}]);
