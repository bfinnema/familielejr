angular.module('familielejr')

.controller('organizerinstructionCtrl', ['$scope', '$http', 'AuthService', 'YearService', function($scope, $http, AuthService, YearService) {
    
    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
            $scope.role = AuthService.userRole();
        };
    });

    setTimeout(function(){
        angular.element(document.querySelector( '#organizerinstruction' ) ).addClass('active');
    }, 1000);

    $http({
        method: 'GET',
        url: 'tenants/mytenant',
        headers: {
            'x-auth': localStorage.userToken
        }
    }).then(function(tenant) {
        // console.log(`Tenant fetched. Status: ${tenant.status}`);
        $scope.tenantName = tenant.data.tenantName;
        // $scope.tenant = tenant.data;
    }, function errorCallback(response) {
        console.log(`Status: ${response.status}`);
    });

}]);
