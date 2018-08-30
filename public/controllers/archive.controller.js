angular.module('familielejr')

.controller('docuploadCtrl', ['$scope', '$http', '$route', '$window', '$timeout', 'AuthService', 
function ($scope, $http, $route, $window, $timeout, AuthService) {

    var currentyear = (new Date()).getFullYear();
    var firstyear = 1993;
    $scope.years = [];
    for (var y=currentyear+2; y>=firstyear; y--) {
        $scope.years.push({"year": y.toString()});
    };
    
    $scope.categories = [
        {"category": "Invitationer", "catNum": 0, "folder": "invitations"},
        {"category": "Menuer og madplaner", "catNum": 1, "folder": "menus"},
        {"category": "Indkøbslister", "catNum": 2, "folder": "shoppinglists"},
        {"category": "Regnskaber", "catNum": 3, "folder": "accounting"},
        {"category": "Regnskabsbilag", "catNum": 6, "folder": "records"},
        {"category": "Andet", "catNum": 4, "folder": "other"},
        {"category": "Noget helt andet", "catNum": 5, "folder": "somethingcompletelydifferent"}
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

    $scope.errorMsg = '';
    $scope.successMsg = '';
    $scope.showDocsList = false;
    $scope.docReplica = true;

    $scope.uploadDoc = function(file) {
        // console.log(`uploadDoc. filename: ${file.name}, filetype: ${file.type}`);
        // var folder = "archive/" + $scope.categories[$scope.category].folder;
        var folder = "archive"
        // console.log(`Folder to upload to: ${folder}`);
        var operation = 'putObject';

        $http({
            method: 'GET',
            url: `/photos/sign-s3?file_name=${file.name}&file_type=${file.type}&folder=${folder}&operation=${operation}`
        }).then(function(response) {
            // console.log(response);
            // console.log(response.data.url);
            $scope.successMsg = 'VENT VENLIGST. Dokumentet '+file.name+' bliver uploaded.......'
            const xhr = new XMLHttpRequest();
            xhr.open('PUT', response.data.signedRequest);
            xhr.onreadystatechange = () => {
                if(xhr.readyState === 4){
                    if(xhr.status === 200){
                        console.log("Document Success!");
                        $http({
                            method: 'POST',
                            url: '/docs/upload',
                            headers: {
                                'x-auth': localStorage.userToken
                            },
                            data: {
                                year: $scope.year,
                                filename: file.name,
                                filetype: file.type,
                                category: $scope.category,
                                user: localStorage.familielejrUserId,
                                description: $scope.description,
                                orientation: 0
                            }
                        }).then(function(response) {
                            // console.log(`Status: ${response.status}`);
                            // console.log(response.data._id);
                            $scope.docFile = null;
                            $scope.description = "";
                            $scope.errorMsg = "";
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
        {"category": "Noget helt andet", "catNum": 5, "folder": "somethingcompletelydifferent"}
    ];

    $http({
        method: 'GET',
        url: '/docs',
        headers: {
            'x-auth': localStorage.userToken
        }
    }).then(function(response) {
        // console.log(`Status: ${response.status}`);
        $scope.docs = response.data;
        if (!response.data[0]) {
            // console.log('No Documents in db)
            $scope.docsExist = false;
        } else {
            $scope.docsExist = true;
            $scope.invitations = [];
            $scope.menus = [];
            $scope.shoppinglists = [];
            $scope.accounts = [];
            $scope.records = [];
            $scope.others = [];
            $scope.somethingCompletelyDifferent = [];
            for (x=0; x<$scope.docs.length; x++) {
                if ($scope.docs[x].category == 0) {$scope.invitations.push($scope.docs[x]);}
                else if ($scope.docs[x].category == 1) {$scope.menus.push($scope.docs[x]);}
                else if ($scope.docs[x].category == 2) {$scope.shoppinglists.push($scope.docs[x]);}
                else if ($scope.docs[x].category == 3) {$scope.accounts.push($scope.docs[x]);}
                else if ($scope.docs[x].category == 4) {$scope.others.push($scope.docs[x]);}
                else if ($scope.docs[x].category == 6) {$scope.records.push($scope.docs[x]);}
                else {$scope.somethingCompletelyDifferent.push($scope.docs[x]);};
            };
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
            url: `/photos/sign-s3-getimage?file_name=${filename}&file_type=${filetype}&folder=${folder}&operation=${operation}`
        }).then(function(response) {
            // console.log("Signed request: "+response.data.signedRequest);
            $window.open(response.data.signedRequest, '_blank');
        }, function errorCallback(response) {
            console.log(`Status: ${response.status}`);
        });

    };

    $scope.removeDoc = function(doc) {
        if ($window.confirm('Bekræft venligst at du vil slette dokumentet '+doc.filename) && $scope.role == 0) {

            $http({
                method: 'GET',
                url: `/photos/sign-s3-deletedoc?file_name=${doc.filename}&file_type=${doc.filetype}&folder=${doc.year}&operation=${'deleteObject'}`
            }).then(function(response) {
                console.log(response.data.signedRequest);

                $http({
                    method: 'DELETE',
                    url: response.data.signedRequest
                }).then(function(response) {
                    // console.log(`Status: ${response.status}`);
                    // console.log("Success!");
                    $http({
                        method: 'DELETE',
                        url: '/photos/admindelete/'+doc._id,
                        headers: {
                            'x-auth': localStorage.userToken
                        }
                    }).then(function(response) {
                        // console.log(`Status: ${response.status}`);
                        // console.log(response.data._id);
                        $location.path('/photoalbum/'+$scope.year);
                        // $route.reload();
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

}])

