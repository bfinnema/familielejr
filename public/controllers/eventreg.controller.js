angular.module('familielejr')

.controller('eventregCtrl', ['$scope', '$http', '$location', '$window', 'AuthService', function($scope, $http, $location, $window, AuthService) {

    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
        };
    });

    $scope.agegroups = [
        {"agegroup": "Barn under 12"},
        {"agegroup": "Voksen"}
    ];
    
    $scope.arrivaldays = [
        {"arrivalday": "Fredag"},
        {"arrivalday": "Lørdag formiddag"},
        {"arrivalday": "Lørdag eftermiddag"}
    ];
    
    $scope.departuredays = [
        {"departureday": "Søndag"},
        {"departureday": "Lørdag formiddag"},
        {"departureday": "Lørdag eftermiddag"}
    ];
    
    $scope.lineid = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    $scope.regname = ["","","","","","","","","",""];
    $scope.ag = ["","","","","","","","","",""];
    $scope.arrivalday = ["","","","","","","","","",""];
    $scope.atime = ["","","","","","","","","",""];
    $scope.departureday = ["","","","","","","","","",""];
    $scope.dtime = ["","","","","","","","","",""];
    var numRegLines = 0;
    $scope.nil = 0;
    $scope.reglineBtnShow = [false,true,false,false,false,false,false,false,false,false];
    $scope.reglineShow = [true,false,false,false,false,false,false,false,false,false];
    console.log(`reglineShow: ${$scope.reglineShow}`);
    
    $scope.showRegLine = function() {
        console.log("Entering showRegLine. numRegLines: "+numRegLines);
        if ($scope.regname[numRegLines] && $scope.ag[numRegLines] && $scope.arrivalday[numRegLines]) {
            console.log("numRegLines: "+numRegLines);
            console.log("Name: "+$scope.regname[numRegLines]);
            console.log("Agegroup: "+$scope.ag[numRegLines]+", Arrivaldate: "+$scope.arrivalday[numRegLines]);
            numRegLines = numRegLines + 1;
            $scope.nil = $scope.nil + 1;
            $scope.reglineShow[numRegLines] = true;
            $scope.reglineBtnShow[numRegLines] = false;
            $scope.reglineBtnShow[numRegLines+1] = true;
        }
        else {
            $window.alert("Du har ikke udfyldt linien endnu");
        };
    };

}]);
