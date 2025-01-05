angular.module('familielejr')

.controller('contentCtrl', ['$scope', '$http', 'AuthService', 
function($scope, $http, AuthService) {

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
