angular.module('familielejr')

.controller('gameCtrl', ['$scope', '$http', '$location', '$route', '$window', 'AuthService', function($scope, $http, $location, $route, $window, AuthService) {

    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
            $scope.role = AuthService.userRole();
        };
    });

    $scope.newEntry = false;
    $scope.editEntry = false;
    
    $http({
        method: 'GET',
        url: '/games',
        headers: {
            'x-auth': localStorage.userToken
        }
    }).then(function(response) {
        console.log(`GamesStatus: ${response.status}`);
        $scope.games = response.data;
    }, function errorCallback(response) {
        console.log(`GamesStatus: ${response.status}`);
    });

    setTimeout(function(){
        // angular.element(document.querySelector( '#entertainment' ) ).addClass('active');
        angular.element(document.querySelector( '#nextcamp' ) ).addClass('active');
        angular.element(document.querySelector( '#games' ) ).addClass('active');
    }, 1000);

    $scope.newEntryToggle = function() {
        if ($scope.newEntry) {
            $scope.newEntry = false;
        } else {
            $scope.newEntry = true;
        };
    };

    $scope.generateGame = function() {

        var data = {
            name: $scope.name,
            description: $scope.description
        };
        
        $http({
            method: 'POST',
            url: '/games',
            headers: {
                'x-auth': localStorage.userToken
            },
            data: data
        }).then(function(response) {
            $location.path('/games');
            $route.reload();
        }, function errorCallback(response) {
            console.log(`Status: ${response.status}`);
        });
 
    };

    $scope.editGame = function(game) {
        $scope.editEntry = true;
        $scope.editedgame = game;
    };

    $scope.editGameSubmit = function() {

        var data = {
            name: $scope.editedgame.name,
            description: $scope.editedgame.description
        };
        
        $http({
            method: 'PATCH',
            url: '/games/' + $scope.editedgame._id,
            headers: {
                'x-auth': localStorage.userToken
            },
            data: data
        }).then(function(response) {
            $location.path('/games');
            $route.reload();
        }, function errorCallback(response) {
            console.log(`Status: ${response.status}`);
        });

    };

    $scope.editToggle = function() {
        $scope.editEntry = false;
    };

    $scope.gameDetails = function(game) {
        if ($scope.viewGameDetails) {
            if ($scope.detailedGame == game) {
                $scope.viewGameDetails = false;
            } else {
                $scope.detailedGame = game;
            };
            // $scope.viewGameDetails = false;
        } else {
            $scope.viewGameDetails = true;
            $scope.detailedGame = game;
        };
    };

    $scope.deleteGame = function(id, name) {
        if ($window.confirm('Bekræft venligst at du vil slette '+name)) {
            $http({
                method: 'DELETE',
                url: 'games/'+id,
                headers: {
                    'x-auth': localStorage.userToken
                }
            }).then(function(response) {
                console.log(`Status: ${response.status}`);
                console.log(response.data._id);
                $location.path('/games');
                $route.reload();
            }, function errorCallback(response) {
                console.log(`Status: ${response.status}`);
            });
        };
    };

}])

