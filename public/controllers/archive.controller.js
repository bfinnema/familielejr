angular.module('familielejr')

.controller('docuploadCtrl', ['$scope', '$http', '$route', '$window', 'AuthService', 
function ($scope, $http, $route, $window, AuthService) {

    $scope.categories = [
        {"category": "Invitationer", "catNum": 0, "folder": "invitations"},
        {"category": "Menuer og madplaner", "catNum": 1, "folder": "menus"},
        {"category": "Indkøbslister", "catNum": 2, "folder": "shoppinglists"},
        {"category": "Regnskaber", "catNum": 3, "folder": "accounting"},
        {"category": "Regnskabsbilag", "catNum": 6, "folder": "records"},
        {"category": "Andet", "catNum": 4, "folder": "other"},
        {"category": "Noget helt andet", "catNum": 5, "folder": "somethingcompletelydifferent"},
        {"category": "Referater", "catNum": 7, "folder": "summaries"}
    ];

    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
            $scope.role = AuthService.userRole();
        };
    });

    setTimeout(function(){
        angular.element(document.querySelector( '#history' ) ).addClass('active');
        angular.element(document.querySelector( '#archive' ) ).addClass('active');
    }, 1000);

    $scope.yearSelected = false;

    $http({
        method: 'GET',
        url: '/tenants/mytenant/',
        headers: {
            'x-auth': localStorage.userToken
        }
    }).then(function(tenant) {
        // console.log(`Tenant fetched. Status: ${tenant.status}. Tenant name: ${tenant.data.tenantName}`);
        $scope.tenantName = tenant.data.tenantName;
        $scope.tenant = tenant.data;
        var currentyear = (new Date()).getFullYear();
        var firstyear = $scope.tenant.startYear;
        $scope.years = [];
        for (var y=currentyear; y>=firstyear; y--) {
            $scope.years.push({"year": y.toString()});
        };
    }, function errorCallback(response) {
        console.log(`Error. Status: ${response.status}`);
    });

    $scope.errorMsg = '';
    $scope.successMsg = '';
    $scope.showDocsList = false;
    $scope.docReplica = true;

    $scope.getEvents = function(year) {
        // console.log(`In getEvents. Year: ${year}`);
        $scope.eventNames = [{"name": "Generelt Dokument"}];
        $scope.selEvent = $scope.eventNames[0].name;
        $scope.yearSelected = true;
        $http({
            method: 'GET',
            url: '/events/year/' + year,
            headers: {
                'x-auth': localStorage.userToken
            }
        }).then(function(events) {
            // console.log(`Events fetched. Status: ${events.status}. # events: ${events.data.length}`);
            if (events.data.length > 0) {
                for (ev in events.data) {
                    // console.log(`eventName: ${events.data[ev].eventName}`);
                    $scope.eventNames.push({"name": events.data[ev].eventName});
                };
                $scope.events = events.data;
            };
        }, function errorCallback(response) {
            console.log(`Error. Status: ${response.status}`);
        });
    };

    $scope.uploadDoc = function(file) {
        // console.log(`uploadDoc. filename: ${file.name}, filetype: ${file.type}`);
        // var folder = "archive/" + $scope.categories[$scope.category].folder;
        var folder = "archive"
        // console.log(`Folder to upload to: ${folder}`);
        var operation = 'putObject';
        
        var selectedEvent = $scope.events.filter(obj => {
            return obj.eventName == $scope.selEvent
        });
        // console.log(`selectedEvent: ${JSON.stringify(selectedEvent)}`);

        $http({
            method: 'GET',
            url: `/photos/s3ops/sign-s3?file_name=${file.name}&file_type=${file.type}&folder=${folder}&operation=${operation}`,
            headers: {
                'x-auth': localStorage.userToken
            }
        }).then(function(response) {
            // console.log(response);
            // console.log(response.data.url);
            $scope.successMsg = 'VENT VENLIGST. Dokumentet '+file.name+' bliver uploaded.......'
            const xhr = new XMLHttpRequest();
            xhr.open('PUT', response.data.signedRequest);
            xhr.onreadystatechange = () => {
                if(xhr.readyState === 4){
                    if(xhr.status === 200){
                        // console.log("Document Success!");
                        var data = {
                            year: $scope.year,
                            filename: file.name,
                            filetype: file.type,
                            category: $scope.category,
                            eventName: $scope.selEvent,
                            user: localStorage.familielejrUserId,
                            description: $scope.description,
                            orientation: 0
                        };
                        if (selectedEvent.length > 0) {
                            data._event = selectedEvent[0]._id
                        };
                        // console.log(`Doc Data: ${JSON.stringify(data)}`);
                        $http({
                            method: 'POST',
                            url: '/docs/upload',
                            headers: {
                                'x-auth': localStorage.userToken
                            },
                            data: data
                        }).then(function(response) {
                            // console.log(`Status: ${response.status}`);
                            // console.log(response.data._id);
                            $scope.docFile = null;
                            $scope.description = "";
                            $scope.errorMsg = "";
                            $scope.year = "";
                            $scope.yearSelected = false;
                            $scope.successMsg = file.name + ' blev uploaded.'
                            // $route.reload();
                        }, function errorCallback(response) {
                            console.log(`Status: ${response.status}`);
                            if (response.status == 409) {
                                $scope.errorMsg = "Et dokument med navnet "+file.name+" er allerede uploadet";
                                $scope.successMsg = '';
                                $scope.docFile = null;
                            };
                        });
                    }
                    else{
                        $window.alert('Kunne ikke uploade dokumentet.');
                        $scope.errorMsg = 'Der opstod en fejl';
                    }
                }
            };
            xhr.send(file);

        }, function errorCallback(response) {
            console.log(`ErrorCallback Status: ${response.status}`);
        });
    };

}])

.controller('archiveCtrl', ['$scope', '$http', '$window', '$route', '$location', 'AuthService', 
function($scope, $http, $window, $route, $location, AuthService) {

    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
            $scope.role = AuthService.userRole();
        };
    });

    setTimeout(function(){
        angular.element(document.querySelector( '#history' ) ).addClass('active');
        angular.element(document.querySelector( '#archive' ) ).addClass('active');
    }, 1000);

    $scope.categories = [
        {"category": "Invitationer", "catNum": 0, "folder": "invitations"},
        {"category": "Menuer og madplaner", "catNum": 1, "folder": "menus"},
        {"category": "Indkøbslister", "catNum": 2, "folder": "shoppinglists"},
        {"category": "Regnskaber", "catNum": 3, "folder": "accounting"},
        {"category": "Regnskabsbilag", "catNum": 6, "folder": "records"},
        {"category": "Andet", "catNum": 4, "folder": "other"},
        {"category": "Noget helt andet", "catNum": 5, "folder": "somethingcompletelydifferent"},
        {"category": "Referater", "catNum": 7, "folder": "summaries"}
    ];
    $scope.docsExist = true;

    $http({
        method: 'GET',
        url: '/tenants/mytenant',
        headers: {
            'x-auth': localStorage.userToken
        }
    }).then(function(tenant) {
        // console.log(`Tenant fetched. Status: ${tenant.status}`);
        $scope.tenantName = tenant.data.tenantName;
        return $http({
            method: 'GET',
            url: '/docs/sort/category/up',
            headers: {
                'x-auth': localStorage.userToken
            }
        });
    }).then(function(docs) {
        // console.log(`Status: ${docs.status}`);
        if (docs.data.length == 0) {
            // console.log('No Documents in db)
            $scope.docsExist = false;
        } else {
            $scope.docsExist = true;
            $scope.docs = docs.data;
        };
    }, function errorCallback(response) {
        console.log(`Error Status, get all docs: ${response.status}`);
    });

    $scope.getDoc = function(doc) {
        var operation = 'getObject';
        var filename = doc.filename;
        var filetype = doc.filetype;
        // var folder = "archive/" + categories[doc.category].folder;   // Could not make that work
        var folder = "archive"
        // console.log(`Folder: ${folder}`);
        $http({
            method: 'GET',
            url: `/photos/s3ops/sign-s3-getimage?file_name=${filename}&file_type=${filetype}&folder=${folder}&operation=${operation}`,
            headers: {
                'x-auth': localStorage.userToken
            }
        }).then(function(response) {
            // console.log("Signed request: "+response.data.signedRequest);
            $window.open(response.data.signedRequest, '_blank');
        }, function errorCallback(response) {
            console.log(`Status: ${response.status}`);
        });

    };

    $scope.removeDoc = function(doc) {
        var folder = "archive"
        // console.log(`In removeDoc. Description: ${doc.description}, id: ${doc._id}`);
        if ($window.confirm('Bekræft venligst at du vil slette dokumentet '+doc.filename) && $scope.role == 0) {

            $http({
                method: 'GET',
                url: `/photos/s3ops/sign-s3-deleteimage?file_name=${doc.filename}&file_type=${doc.filetype}&folder=${folder}&operation=${'deleteObject'}`,
                headers: {
                    'x-auth': localStorage.userToken
                }
            }).then(function(response) {
                // console.log(response.data.signedRequest);

                $http({
                    method: 'DELETE',
                    url: response.data.signedRequest
                }).then(function(response) {
                    // console.log(`Status: ${response.status}`);
                    // console.log("Success!");
                    $http({
                        method: 'DELETE',
                        url: '/docs/admindelete/'+doc._id,
                        headers: {
                            'x-auth': localStorage.userToken
                        }
                    }).then(function(response) {
                        // console.log(`Status: ${response.status}`);
                        // console.log(response.data._id);
                        $location.path('/archive');
                        $route.reload();
                    }, function errorCallback(response) {
                        console.log(`Status: ${response.status}`);
                    });
                }, function errorCallback(response) {
                    console.log(`Status: ${response.status}`);
                });
            }, function errorCallback(response) {
                console.log(`Status: ${response.status}`);
            });
        } else {
            $location.path('/archive');
        };
    };

    $scope._sort = function(item, sortDirection) {
        // console.log(`in _sort. item: ${item}`);
        getDocs(item, true, sortDirection, false, false, "none");
    };

    $scope._filter = function() {
        // console.log(`in _filter. docCategory: ${$scope.docCategory}`);
        getDocs("category", false, "up", true, false, "none");
    };

    getDocs = function(item, sortOrNot, sortDirection, filterOrNot, searchOrNot, searchText) {
        // console.log(`getDocs. filterOrNot: ${filterOrNot}`);
        var url = "docs/";
        if (sortOrNot) {
            url = `${url}sort/${item}/${sortDirection}`;
        } else if (filterOrNot) {
            // console.log(`Filtering, filterOrNot: ${filterOrNot}`);
            url = `${url}filter/${item}/${$scope.docCategory}`;
        } else if (searchOrNot) {                            // Not used
            url = `${url}search/${item}/${searchText}`;
        } else {
            url = `${url}sort/category/up`;
        };
        // console.log(`url: ${url}`);
        $http({
            method: 'GET',
            url: url,
            headers: {
                'x-auth': localStorage.userToken
            }
        }).then(function(docs) {
            // console.log(`Status: ${docs.status}`);
            if (docs.data.length == 0) {
                console.log('No Documents in db');
                $scope.docsExist = false;
            } else {
                $scope.docsExist = true;
                $scope.docs = docs.data;
            };
        }, function errorCallback(response) {
            // console.log(`Status: ${response.status}`);
        });
    };

    $scope.showPopoverSortFn = function(item, direction) {
        if (item == "event" && direction == "up") {
            $scope.eventUpPopoverIsVisible = true;
        } else if (item == "event" && direction == "down") {
            $scope.eventDnPopoverIsVisible = true;
        } else if (item == "year" && direction == "up") {
            $scope.yearUpPopoverIsVisible = true;
        } else if (item == "year" && direction == "down") {
            $scope.yearDnPopoverIsVisible = true;
        } else if (item == "category" && direction == "up") {
            $scope.catUpPopoverIsVisible = true;
        } else if (item == "category" && direction == "down") {
            $scope.catDnPopoverIsVisible = true;
        };
    };
      
    $scope.hidePopoverSortFn = function (item, direction) {
        $scope.eventUpPopoverIsVisible = false;
        $scope.eventDnPopoverIsVisible = false;
        $scope.yearUpPopoverIsVisible = false;
        $scope.yearDnPopoverIsVisible = false;
        $scope.catUpPopoverIsVisible = false;
        $scope.catDnPopoverIsVisible = false;
    };

}])

