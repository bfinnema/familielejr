angular.module('familielejr')

.controller('aboutCtrl', ['$scope', 'AuthService', 'YearService', function($scope, AuthService, YearService) {
    
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

    var invyear = YearService.myYear("about");
    var pastyear = invyear - 1;
    $scope.invyear = invyear;
    $scope.pastyear = pastyear;

    /* 
    $scope.keyPressed = "Nothing";
    $scope.testKeyPress1 = function($event) {
        console.log(`testKeyPress1`);
        if ($event.keyCode === 107) {
            console.log(`Left arrow`);
        };
        $scope.keyPressed = "key "+$event.keyCode+" was pressed";
    };

    $scope.testKeyPress2 = function() {
        console.log(`2. Key was pressed.`);
    };

    $scope.getkeys = function (event) {
        $scope.keyval = event.keyCode;
    };
 */
}]);
