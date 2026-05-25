angular.module('familielejr')

.controller('placesadminCtrl', ['$scope', '$http', '$location', '$route', '$window', 'AuthService', function($scope, $http, $location, $route, $window, AuthService) {

    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
            $scope.role = AuthService.userRole();
        };
    });

    $scope.newItemEntry = false;
    $scope.editItemEntry = false;
    $scope.showEditForm = false;
    $scope.submitButtonText = "Opret sted";
    
    $scope.placetypes = [
        {"placetypeName": "Lejrskole"},
        {"placetypeName": "Privathjem"},
        {"placetypeName": "Forsamlingshus"},
        {"placetypeName": "Beboerhus"},
        {"placetypeName": "Slum"},
        {"placetypeName": "Slot"}
    ];

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
        /* return $http({
            method: 'GET',
            url: 'events',
            headers: {
                'x-auth': localStorage.userToken
            }
        });
    }).then(function(events) {
        // console.log(`Events fetched. Status: ${events.status}`);
        $scope.events = events.data; */
        return $http({
            method: 'GET',
            url: '/places',
            headers: {
                'x-auth': localStorage.userToken
            }
        });
    }).then(function(response) {
        // console.log(`placesStatus: ${response.status}`);
        $scope.places = response.data;
    }, function errorCallback(response) {
        console.log(`placesStatus: ${response.status}`);
    });

    setTimeout(function(){
        angular.element(document.querySelector( '#admin' ) ).addClass('active');
        angular.element(document.querySelector( '#placesadmin' ) ).addClass('active');
    }, 1000);

    $scope.cancelEntry = function() {
        if ($scope.newItemEntry) {
            $scope.newItemEntry = false;
        } else {
            $scope.editItemEntry = false;
        };
        $scope.showEditForm = false;
        $scope.submitButtonText = "Opret sted";
    };

    $scope.newEntryToggle = function() {
        if ($scope.newItemEntry) {
            $scope.newItemEntry = false;
            $scope.showEditForm = false;
        } else {
            $scope.newItemEntry = true;
            $scope.showEditForm = true;
            $scope.submitButtonText = "Opret sted";
            $scope.eventList = [];
            $scope.itemToEdit = {
                "placeName": "",
                "placetypeName": "",
                "description": "",
                "website": "",
                "address": {
                    "street": "",
                    "houseno": 0,
                    "zip": "",
                    "town": ""
                },
                "coordinates": {
                    "longitude": 55.375982,
                    "latitude": 9.584953
                }
            };
        };
    };

    $scope.editItemToggle = function(item) {
        if ($scope.editItemEntry) {
            $scope.editItemEntry = false;
            $scope.showEditForm = false;
        } else {
            $scope.editItemEntry = true;
            $scope.showEditForm = true;
            $scope.submitButtonText = "Send";
            $scope.itemToEdit = item;
            $scope.eventList = item.events;
        };
    };

    /* $scope.eventSelectedToAdd = function() {
        var selectedEvent = JSON.parse($scope.selectEvent);
        console.log(`Event Selected: ${selectedEvent.eventName}`);
        var alreadyAdded = false;
        for (var i=0; i<$scope.eventList.length; i++) {
            if ($scope.eventList[i].eventName == selectedEvent.eventName) {
                $window.alert("Er allerede valgt.");
                alreadyAdded = true;
            };
        };
        if (!alreadyAdded) {
            $scope.eventList.push({"_event": selectedEvent._id, "eventName": selectedEvent.eventName, "year": selectedEvent.year});
        }
        console.log(`eventList: ${JSON.stringify($scope.eventList)}`);
    }; */

    $scope.itemSubmit = function() {
        // console.log(`In itemSubmit`);

        var data = {
            "placeName": $scope.itemToEdit.placeName,
            "placetypeName": $scope.placetypeName,
            "description": $scope.itemToEdit.description,
            "website": $scope.itemToEdit.website,
            "address": $scope.itemToEdit.address,
            "coordinates": $scope.itemToEdit.coordinates,
            "events": $scope.eventList
        };
        
        if ($scope.newItemEntry) {
            // console.log(`New item ${data.placeName}`);
            $http({
                method: 'POST',
                url: '/places',
                headers: {
                    'x-auth': localStorage.userToken
                },
                data: data
            }).then(function(response) {
                // console.log(`Success creating a new place: ${response.status}`);
                $scope.newItemEntry = false;
                $location.path('/placesadmin');
                $route.reload();
            }, function errorCallback(response) {
                console.log(`Error: ${response.status}`);
                console.log(`Entire error: ${response}`);
            });
        } else if ($scope.editItemEntry) {
            // console.log(`Edited item ${data.placeName}`);
            $http({
                method: 'PATCH',
                url: '/places/' + $scope.itemToEdit._id,
                headers: {
                    'x-auth': localStorage.userToken
                },
                data: data
            }).then(function(response) {
                // console.log(`Success editing a place: ${response.status}`);
                $scope.editItemEntry = false;
                $location.path('/placesadmin');
                $route.reload();
            }, function errorCallback(response) {
                console.log(`Status: ${response.status}`);
            });
        } else {
            console.log(`Something wrong`);
        };
 
    };

    $scope.deleteItem = function(id, name) {
        const deletePlace = $scope.places.find(item => item._id === id);
        console.log(`deletePlace: ${JSON.stringify(deletePlace)}`);
        if (deletePlace.events.length == 0) {
            if ($window.confirm('Bekræft venligst at du vil slette '+name)) {
                $http({
                    method: 'DELETE',
                    url: 'places/'+id,
                    headers: {
                        'x-auth': localStorage.userToken
                    }
                }).then(function(response) {
                    console.log(`Status: ${response.status}`);
                    // console.log(response.data._id);
                    $location.path('/placesadmin');
                    $route.reload();
                }, function errorCallback(response) {
                    console.log(`Status: ${response.status}`);
                });
            };
        } else {
            window.alert('Der er begivenheder tilknyttet dette sted, så det kan ikke slettes.')
        };
    };

}])
