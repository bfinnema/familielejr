angular.module('familielejr')

.controller('tenantsCtrl', ['$scope', '$http', '$location', '$route', 'AuthService', 
function($scope, $http, $location, $route, AuthService) {

    // console.log("In the tenant controller")
    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
            $scope.role = AuthService.userRole();
            if ($scope.role == 10) {
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
            } else {
                console.log(`You are NOT the Big ADMIN, so you do not have access here!!`);
            };
        };
    });

    $scope.newTenant = false;
    $scope.editTenant = false;

    $scope.newTenantToggle = function() {
        if ($scope.newTenant) {
            $scope.newTenant = false;
        } else {
            $scope.newTenant = true;
            $scope.startyear = new Date().getFullYear();
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
            // startYear: (new Date()).getFullYear(),
            startYear: $scope.startyear,
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

}])

.controller('tenantdetailsCtrl', ['$scope', '$http', '$location', '$routeParams', '$route', '$window', 'AuthService', 
function($scope, $http, $location, $routeParams, $route, $window, AuthService) {
    
    // console.log("In the tenant details controller")
    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
            $scope.role = AuthService.userRole();
        };
    });

    // $scope.newTenant = false;
    $scope.editTenant = false;
    $scope.tenantDeletable = true;

    $http({
        method: 'GET',
        url: '/tenants/' + $routeParams.id,
        headers: {
            'x-auth': localStorage.userToken
        }
    }).then(function(tenant) {
        // console.log(`Success. Tenant Status: ${tenant.status}`);
        $scope.tenant = tenant.data.tenant;
        // console.log($scope.tenant.tenantName);
        return $http({
            method: 'GET',
            url: 'events/tenant/' + $routeParams.id,
            headers: {
                'x-auth': localStorage.userToken
            }
        });
    }).then(function(events) {
        // console.log(`Success. Events Status: ${events.status}`);
        $scope.events = events.data;
        if ($scope.events.length > 0) {
            // console.log(`Name of first event: ${$scope.events[0].eventName}`);
            $scope.tenantDeletable = false;
        };
        return $http({
            method: 'GET',
            url: 'docs/tenant/' + $routeParams.id,
            headers: {
                'x-auth': localStorage.userToken
            }
        });
    }).then(function(docs) {
        // console.log(`Success. Docs Status: ${docs.status}`);
        $scope.docs = docs.data;
        if ($scope.docs.length > 0) {
            // console.log(`Name of first doc: ${$scope.docs[0].filename}`);
            $scope.tenantDeletable = false;
        };
        return $http({
            method: 'GET',
            url: 'users/tenant/' + $routeParams.id,
            headers: {
                'x-auth': localStorage.userToken
            }
        });
    }).then(function(users) {
        // console.log(`Success. Users Status: ${users.status}`);
        $scope.users = users.data;
        if ($scope.users.length > 0) {
            // console.log(`Email of first user: ${$scope.users[0].email}`);
            $scope.tenantDeletable = false;
        };

        return $http({
            method: 'GET',
            url: 'users/user/' + $scope.tenant._admin,
            headers: {
                'x-auth': localStorage.userToken
            }
        });
    }).then(function(admin) {
        // console.log(`Success. Users Status: ${users.status}`);
        $scope.admin = admin.data;
        console.log(`Admin: ${$scope.admin.name.firstname}`);
    }, function errorCallback(response) {
        console.log(`Error. Status: ${response.status}`);
    });

    $scope.editTenantToggle = function() {
        // console.log(`In editTenantToggle`);
        if ($scope.editTenant) {
            $scope.editTenant = false;
        } else {
            // console.log(`1. Edit Tenant: ${$scope.tenant.tenantName}`);
            $scope.tenantToEdit = $scope.tenant;
            $scope.editID = $scope.tenant._id;
            $scope.editTenant = true;
        };
    };

    $scope.tenantEdit = function() {
        console.log(`Name: ${$scope.tenantToEdit.tenantName}, startYear: ${$scope.tenantToEdit.startYear} description: ${$scope.tenantToEdit.description}`)
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
        if ($scope.tenantDeletable && $window.confirm('Bekræft venligst at du vil slette tenant '+tenant.tenantname)) {
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
    