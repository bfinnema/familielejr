angular.module('familielejr')

.controller('tenantCtrl', ['$scope', '$http', '$location', '$route', '$window', 'AuthService', 'YearService', 
function($scope, $http, $location, $route, $window, AuthService, YearService) {

    // console.log("In the tenant controller")
    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
            $scope.role = AuthService.userRole();
        };
    });

    $scope.newTenant = false;
    $scope.editTenant = false;

    $http({
        method: 'GET',
        url: '/tenants',
        headers: {
            'x-auth': localStorage.userToken
        }
    }).then(function(response) {
        // console.log(`Success. Status: ${response.status}`);
        $scope.tenants = response.data;
        // console.log($scope.tenants[0]);
    }, function errorCallback(response) {
        console.log(`Error. Status: ${response.status}`);
    });

    $scope.newTenantToggle = function() {
        if ($scope.newTenant) {
            $scope.newTenant = false;
        } else {
            $scope.newTenant = true;
        };
    };

    $scope.addTenant = function() {

        var subscriptions = {
            events: {
                subscribe: $scope.events,
                multipleEventsPerYear: $scope.multipleevents
            },
            familyTree: $scope.familytree,
            photoGallery: $scope.photogallery,
            summaries: $scope.summaries,
            accounting: $scope.accounting
        };

        var tenant = {
            tenantName: $scope.tenantname,
            description: $scope.description,
            startYear: (new Date()).getFullYear(),
            subscriptions: subscriptions
        };

        var textHeadlines = [];
        var headline = {
            h3: "Indtast dine egne overskrifter",
            paragraphs: [{paragraph: "Din første paragraf"}, {paragraph: "Din anden paragraf"}]
        };
        textHeadlines.push(headline);
 
        var about = {
            communityName: $scope.tenantname,
            subHeading: "Din sub-overskrift",
            nextHeadline: "Din næste begivenhed",
            upcomingHeadline: "Dine kommende begivenheder",
            metadata: "Dine metadata",
            textHeadlines: textHeadlines
        };

        $http({
            method: 'POST',
            url: 'tenants',
            headers: {
                'x-auth': localStorage.userToken
            },
            data: tenant
        }).then(function(tenant_response) {
            console.log(`Tenant Status: ${tenant_response.status}`);
            console.log(`Tenant ID: ${tenant_response.data._id}`);
            about._tenant = tenant_response.data._id;
            return $http({
                method: 'POST',
                url: 'abouts',
                headers: {
                    'x-auth': localStorage.userToken
                },
                data: about
            });
        }).then(function(response) {
            console.log(`About Status: ${response.status}`);
            console.log(response.data._id);
            $location.path('/tenants');
            $route.reload();
        }, function errorCallback(response) {
            console.log(`Status: ${response.status}`);
        });
    };

    $scope.editTenantToggle = function(tenant) {
        if ($scope.editTenant) {
            $scope.editTenant = false;
        } else {
            $scope.tenantToEdit = tenant;
            $scope.editTenantname = tenant.tenantName;
            $scope.editDescription = tenant.description;
            $scope.editID = tenant._id;
            $scope.editTenant = true;
        };
    };

    $scope.tenantEdit = function() {
        console.log(`Name: ${$scope.tenantToEdit.tenantName}, description: ${$scope.tenantToEdit.description}`)
        var data = $scope.tenantToEdit;

        $http({
            method: 'PATCH',
            url: '/tenants/'+$scope.editID,
            headers: {
                'x-auth': localStorage.userToken
            },
            data: data
        }).then(function(response) {
            $location.path('/tenants');
            $route.reload();
        }, function errorCallback(response) {
            console.log(`editGroceriesStatus: ${response.status}`);
        });

    };

    $scope.removeTenant = function(tenant) {
        if ($window.confirm('Bekræft venligst at du vil slette tenant '+tenant.tenantname)) {
            $http({
                method: 'DELETE',
                url: 'abouts/tenant/'+tenant._id,
                headers: {
                    'x-auth': localStorage.userToken
                }
            }).then(function(about_response) {
                console.log(`About DELETE Status: ${about_response.status}`);
                return $http({
                    method: 'DELETE',
                    url: 'tenants/'+tenant._id,
                    headers: {
                        'x-auth': localStorage.userToken
                    }
                });
            }).then(function(tenant_response) {
                console.log(`Tenant DELETE Status: ${tenant_response.status}`);
                // console.log(tenant_response.data);
                $location.path('/tenants');
                $route.reload();
            }, function errorCallback(response) {
                console.log(`Status: ${response.status}`);
            });
        };
    };

}]);
