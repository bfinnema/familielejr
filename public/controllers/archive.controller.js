angular.module('familielejr')

.controller('docuploadCtrl', ['$scope', '$http', '$route', '$window', '$timeout', 'AuthService', 
function ($scope, $http, $route, $window, $timeout, AuthService) {

    var currentyear = (new Date()).getFullYear();
    var firstyear = 1993;
    $scope.years = [];
    for (var y=firstyear; y<=currentyear; y++) {
        $scope.years.push({"year": y.toString()});
    };
    
    $scope.categories = [
        {"category": "Invitationer"},
        {"category": "Menuer"},
        {"category": "Indkøbslister"},
        {"category": "Regnskaber"},
        {"category": "Andet"}
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
        var folder = $scope.category;
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
                            console.log(`Status: ${response.status}`);
                            console.log(response.data._id);
                            $scope.docFile = null;
                            $scope.description = "";
                            $scope.errorMsg = "";
                            $scope.successMsg = file.name + ' blev uploaded.'
                            // $route.reload();
                        }, function errorCallback(response) {
                            console.log(`Status: ${response.status}`);
                            if (response.status == 409) {
                                $scope.errorMsg = "En anden har allerede uploaded et dokument med navnet "+file.name;
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

.controller('archiveCtrl', ['$scope', '$http', '$routeParams', '$window', '$route', '$location', 'AuthService', 
function($scope, $http, $routeParams, $window, $route, $location, AuthService) {

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

    $http({
        method: 'GET',
        url: '/photos/year/'+$routeParams.year,
        headers: {
            'x-auth': localStorage.userToken
        }
    }).then(function(response) {
        // console.log(`Status: ${response.status}`);
        $scope.docs = response.data;
        if (!response.data[0]) {
            // console.log('No photos for year '+$scope.year)
            $scope.docsExist = false;
        } else {
            $scope.docsExist = true;
            // $scope.mainDoc = $scope.docs[0].path + $scope.docs[0].filename;  // Old method
            $scope.mainDocObj = $scope.docs[0];
            getDoc(0);
            
            for (x=0; x<$scope.docs.length; x++) {
                $scope.docs[x].num = x;
                // console.log(`orientation: ${$scope.docs[x].orientation}`);
                if (!$scope.docs[x].orientation) {
                    $scope.docs[x].orientation = 0;
                };
                // console.log(`${$scope.docs[x].num}: ${$scope.docs[x].filename}, orientation: ${$scope.docs[x].orientation}`);
            };
            setTimeout(function(){
                docFormatting();
            }, 500);
        };
    }, function errorCallback(response) {
        console.log(`Status: ${response.status}`);
    });

	$scope.setDoc = function(doc){
		// $scope.mainDoc = doc.path + doc.filename;  // Old method
        currentPhoto = doc.num;
        $scope.mainDoc = $scope.docs[currentPhoto].signedRequest;
        $scope.mainDocObj = $scope.docs[currentPhoto];
        setTimeout(function(){
            docFormatting();
        }, 500);
        // console.log(`Current Photo: ${doc.num}, ${doc.filename}`);
	};

    $scope.nextDoc = function() {
/* 
        for (sr in $scope.signedRequests) {
            console.log(`nextDoc: signedRequest: ${$scope.signedRequests[sr]}`);
        };
 */        
        if (currentPhoto < $scope.docs.length-1) {
            currentPhoto = currentPhoto + 1;
        }
        else {currentPhoto = 0};
        // $scope.mainDoc = $scope.docs[currentPhoto].path + $scope.docs[currentPhoto].filename; // Old method
        $scope.mainDocObj = $scope.docs[currentPhoto];
        if ($scope.docs[currentPhoto].signedRequest) {  // if ($scope.signedRequests[currentPhoto] !="") {
            $scope.mainDoc = $scope.docs[currentPhoto].signedRequest;
            // console.log(`nextDoc: signedRequest in doc: ${$scope.docs[currentPhoto].signedRequest}`);
        } else {
            getDoc(currentPhoto);
        };
        setTimeout(function(){
            docFormatting();
        }, 500);
    // console.log(`Current Photo: ${$scope.mainDocObj.num}, ${$scope.mainDocObj.filename}`);
    };

    $scope.prevDoc = function() {
        if (currentPhoto < 1) {
            currentPhoto = $scope.docs.length-1;
        }
        else {currentPhoto = currentPhoto - 1};
        // $scope.mainDoc = $scope.docs[currentPhoto].path + $scope.docs[currentPhoto].filename;
        $scope.mainDocObj = $scope.docs[currentPhoto];
        if ($scope.docs[currentPhoto].signedRequest) {  // if ($scope.signedRequests[currentPhoto] !="") {
            $scope.mainDoc = $scope.docs[currentPhoto].signedRequest;
            // console.log(`prevDoc: signedRequest in doc: ${$scope.docs[currentPhoto].signedRequest}`);
        } else {
            getDoc(currentPhoto);
        };
        setTimeout(function(){
            docFormatting();
        }, 500);
        // console.log(`Current Photo: ${$scope.mainDocObj.num}, ${$scope.mainDocObj.filename}`);
    };

    $scope.removeDoc = function(doc) {
        if ($window.confirm('Bekræft venligst at du vil slette billedet '+doc.filename) && $scope.role == 0) {

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
            $location.path('/about');
        };
    };

    $scope.addComment = function(doc) {
        // console.log(`Comment: ${$scope.mycomment}`);
        $http({
            method: 'PATCH',
            url: '/photos/'+doc._id,
            headers: {
                'x-auth': localStorage.userToken
            },
            data: {text: $scope.mycomment}
        }).then(function(response) {
            // console.log(`Status: ${response.status}`);
            // $location.path('/photoalbum/' + $scope.year);
            // $route.reload();
            var newtextobj = {
                textobj: {
                    date: new Date(),
                    contributor: 'Mit bidrag',
                    text: $scope.mycomment
                }
            };
            $scope.mainDocObj.doctext.push(newtextobj);
            console.log(`${JSON.stringify($scope.mainDocObj.doctext)}`);
            $scope.mycomment = '';
        }, function errorCallback(response) {
            console.log(`Status: ${response.status}`);
        });
    };

    function getDoc(photoNum) {
        var operation = 'getObject';
        var filename = $scope.docs[photoNum].filename;
        var filetype = $scope.docs[photoNum].filetype;
        var folder = $scope.docs[photoNum].year;
        $http({
            method: 'GET',
            url: `/photos/sign-s3-getdoc?file_name=${filename}&file_type=${filetype}&folder=${folder}&operation=${operation}`
        }).then(function(response) {
            // console.log("Signed request: "+response.data.signedRequest);
            $scope.mainDoc = response.data.signedRequest;
            $scope.docs[photoNum].signedRequest = response.data.signedRequest;
            // console.log(`mainDoc: ${$scope.mainDoc}`);
        }, function errorCallback(response) {
            console.log(`Status: ${response.status}`);
        });
    };

    function screenSizing() {
        var screenSizes = [
            {"screenHeight": 400},
            {"screenHeight": 520},
            {"screenHeight": 680},
            {"screenHeight": 780},
            {"screenHeight": 930},
            {"screenHeight": 1080}
        ];

        var screenSizeIndex = 0;
        for (var s=0; s<screenSizes.length; s++) {
            // console.log(`screenSizing, innerHeight: ${window.innerHeight}, ${screenSizes[s].screenHeight}`);
            if (window.innerHeight > screenSizes[s].screenHeight) {
                screenSizeIndex = s;
                // console.log(`Bigger!`);
            };
        };
        // console.log(`screenSizeIndex: ${screenSizeIndex}`);
        return screenSizeIndex;
    };

    function docFormatting() {

        var docFormats = [
            {"whRelation": 0.6},
            {"whRelation": 1.3},
            {"whRelation": 1.7}
        ];

        var classMapDivHor = [
            ['div-horizontal-520-ver','div-horizontal-680-ver','div-horizontal-780-ver','div-horizontal-930-ver','div-horizontal-1080-ver','div-horizontal-1081-ver'],
            ['div-horizontal-520-4-3','div-horizontal-680-4-3','div-horizontal-780-4-3','div-horizontal-930-4-3','div-horizontal-1080-4-3','div-horizontal-1081-4-3'],
            ['div-horizontal-520-16-9','div-horizontal-680-16-9','div-horizontal-780-16-9','div-horizontal-930-16-9','div-horizontal-1080-16-9','div-horizontal-1081-16-9']
        ];
        var classMapImgHor = [
            ['img-horizontal-520-ver','img-horizontal-680-ver','img-horizontal-780-ver','img-horizontal-930-ver','img-horizontal-1080-ver','img-horizontal-1081-ver'],
            ['img-horizontal-520-4-3','img-horizontal-680-4-3','img-horizontal-780-4-3','img-horizontal-930-4-3','img-horizontal-1080-4-3','img-horizontal-1081-4-3'],
            ['img-horizontal-520-16-9','img-horizontal-680-16-9','img-horizontal-780-16-9','img-horizontal-930-16-9','img-horizontal-1080-16-9','img-horizontal-1081-16-9']
        ];

        var classMapDivVer = [
            ['div-vertical-520-ver','div-vertical-680-ver','div-vertical-780-ver','div-vertical-930-ver','div-vertical-1080-ver','div-vertical-1081-ver']
        ];
        var classMapImgVer = [
            ['img-vertical-520-ver','img-vertical-680-ver','img-vertical-780-ver','img-vertical-930-ver','img-vertical-1080-ver','img-vertical-1081-ver']
        ];

        if ($scope.docs[currentPhoto].orientation == 0) {
            var imgWidth = document.getElementById("photo-img").naturalWidth;
            var imgHeight = document.getElementById("photo-img").naturalHeight;
        } else if ($scope.docs[currentPhoto].orientation == 1 || $scope.docs[currentPhoto].orientation == -1) {
            var imgWidth = document.getElementById("photo-img-ver").naturalWidth;
            var imgHeight = document.getElementById("photo-img-ver").naturalHeight;
        } else {

        };
        var whr = imgWidth/imgHeight;
        console.log(`Width: ${imgWidth}, Height: ${imgHeight}, Relation: ${whr}`);
        $scope.imgWidth = imgWidth; $scope.imgHeight = imgHeight;

        var docFormatIndex = 0;
        for (var f=0; f<docFormats.length; f++) {
            console.log(`f: ${f}, docFormat: ${docFormats[f].whRelation}`);
            if (whr > docFormats[f].whRelation) {docFormatIndex = f};
        };

        // console.log(`In docFormatting. ${$scope.docs[currentPhoto].num}: ${$scope.docs[currentPhoto].filename}, orientation: ${$scope.docs[currentPhoto].orientation}`);
/*         
        if ($scope.docs[currentPhoto].orientation == 0) {
            if ($scope.userClient == "ANDROID" || $scope.userClient == "IPHONE") {
                angular.element(document.querySelector('#photo-div') ).addClass('div-horizontal-mobile');
                angular.element(document.querySelector('#photo-img') ).addClass('img-responsive');
            } else if ($scope.userClient == "BROWSER") {
                // console.log(`Class to be selected for horizontal img, DIV: ${classMapDivHor[docFormatIndex][$scope.screenSizeIndex]}, IMG: ${classMapImgHor[docFormatIndex][$scope.screenSizeIndex]}`);
                angular.element(document.querySelector('#photo-div') ).addClass(classMapDivHor[docFormatIndex][$scope.screenSizeIndex]);
                angular.element(document.querySelector('#photo-img') ).addClass(classMapImgHor[docFormatIndex][$scope.screenSizeIndex]);
            } else {
                angular.element(document.querySelector('#photo-div') ).addClass('div-horizontal-mobile');
                angular.element(document.querySelector('#photo-img') ).addClass('img-responsive');
            };
        } else {
            if ($scope.userClient == "ANDROID" || $scope.userClient == "IPHONE") {
                angular.element(document.querySelector('#photo-div-ver') ).addClass('div-vertical-mobile');
                angular.element(document.querySelector('#photo-img-ver') ).addClass('img-vertical-mobile');
            } else if ($scope.userClient == "BROWSER") {
                // console.log(`Class to be selected for vertical img, DIV: ${classMapDivVer[0][$scope.screenSizeIndex]}, IMG: ${classMapImgVer[0][$scope.screenSizeIndex]}`);
                angular.element(document.querySelector('#photo-div-ver') ).addClass(classMapDivVer[0][$scope.screenSizeIndex]);
                angular.element(document.querySelector('#photo-img-ver') ).addClass(classMapImgVer[0][$scope.screenSizeIndex]);
            } else {
                angular.element(document.querySelector('#photo-div-ver') ).addClass('div-vertical-mobile');
                angular.element(document.querySelector('#photo-img-ver') ).addClass('img-vertical-mobile');
            };
        };
 */
        if ($scope.docs[currentPhoto].orientation == 0) {
            console.log(`Class to be selected for horizontal img, DIV: ${classMapDivHor[docFormatIndex][$scope.screenSizeIndex]}, IMG: ${classMapImgHor[docFormatIndex][$scope.screenSizeIndex]}`);
            angular.element(document.querySelector('#photo-div') ).addClass(classMapDivHor[docFormatIndex][$scope.screenSizeIndex]);
            angular.element(document.querySelector('#photo-img') ).addClass(classMapImgHor[docFormatIndex][$scope.screenSizeIndex]);
        } else if ($scope.docs[currentPhoto].orientation == 1 || $scope.docs[currentPhoto].orientation == -1) {
            console.log(`Class to be selected for vertical img, DIV: ${classMapDivVer[0][$scope.screenSizeIndex]}, IMG: ${classMapImgVer[0][$scope.screenSizeIndex]}`);
            angular.element(document.querySelector('#photo-div-ver') ).addClass(classMapDivVer[0][$scope.screenSizeIndex]);
            angular.element(document.querySelector('#photo-img-ver') ).addClass(classMapImgVer[0][$scope.screenSizeIndex]);
        } else {
            
        };
        
    };

    $scope.rotateDoc = function(doc, direction) {
        var newOrientation = 0;
        var rotation = false;
        var rotAction = 'med uret'
        if (direction == -1) {
            if (doc.orientation > 0) {
                newOrientation = doc.orientation + direction;
                rotation = true;
                rotAction = 'mod uret';
                // console.log(`Rotate counter clockwise`);
            } else {
                $window.alert('Handlingen er pt ikke understøttet.');
            };
        } else {
            if (doc.orientation < 1) {
                newOrientation = doc.orientation + direction;
                rotation = true;
                // console.log(`Rotate clockwise`);
            } else {
                $window.alert('Handlingen er pt ikke understøttet.');
            };
        };

        if (rotation) {
            if ($window.confirm('Venligst bekræft at du vil rotere billedet '+rotAction)) {
                $http({
                    method: 'PATCH',
                    url: '/photos/orientation/'+doc._id,
                    headers: {
                        'x-auth': localStorage.userToken
                    },
                    data: {orientation: newOrientation}
                }).then(function(response) {
                    // console.log(`Status: ${response.status}`);
                    // $location.path('/photoalbum/' + $scope.year);
                    // $route.reload();
                    $scope.mainDocObj.orientation = newOrientation;
                    docFormatting();
                }, function errorCallback(response) {
                    console.log(`Status: ${response.status}`);
                });
            };
        };
    };
    
    function detectClient() {
        $scope.userClientFullDesc = navigator.userAgent;
        console.log(navigator.userAgent);
        if (navigator.userAgent.match(/Android/i)) {
            $scope.userClient = "ANDROID";
        } else if (navigator.userAgent.match(/iPhone/i)) {
            $scope.userClient = "IPHONE";
        } else if (navigator.userAgent.match(/iPad/i)) {
            $scope.userClient = "IPAD";
        } else {
            $scope.userClient = "BROWSER";
        };
    };
}])

.controller('myphotoalbumCtrl', ['$scope', '$http', '$routeParams', '$window', '$location', '$route', 'AuthService', 
function($scope, $http, $routeParams, $window, $location, $route, AuthService) {

    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
            $scope.role = AuthService.userRole();
        };
    });

    setTimeout(function(){
        angular.element(document.querySelector( '#photoalbum' ) ).addClass('active');
        angular.element(document.querySelector( '#myphotos' ) ).addClass('active');
    }, 1000);

    $scope.innerWidth = window.innerWidth;
    $scope.innerHeight = window.innerHeight;
    detectClient();
    $scope.screenSizeIndex = screenSizing();
    // console.log(`Screen Size detected: ${$scope.screenSizeIndex}`);
    var currentPhoto = 0;
    $scope.year = $routeParams.year;
    //console.log(`Photos from year ${$scope.year}`)
    if (Number($scope.year) < 1993) {
        $scope.headline = "Mine billeder for alle år";
        photosurl = '/photos/my';
        $scope.nodocstext = "Du har ikke lagt nogen billeder op endnu. "
    } else {
        $scope.headline = "Mine billeder fra " + $scope.year;
        photosurl = '/photos/my/'+$scope.year;
        $scope.nodocstext = "Du har ikke lagt nogen billeder fra "+$scope.year+" op endnu. "
    };
    
    $http({
        method: 'GET',
        url: photosurl,
        headers: {
            'x-auth': localStorage.userToken
        }
    }).then(function(response) {
        // console.log(`Status: ${response.status}`);
        $scope.docs = response.data;
        if (!response.data[0]) {
            // console.log('No photos for user'+localStorage.familielejrUserId);
            $scope.docsExist = false;
        } else {
            $scope.docsExist = true;
            $scope.mainDocObj = $scope.docs[0];
            getDoc(0);
            for (x=0; x<$scope.docs.length; x++) {
                $scope.docs[x].num = x;
                // console.log(`orientation: ${$scope.docs[x].orientation}`);
                if (!$scope.docs[x].orientation) {
                    $scope.docs[x].orientation = 0;
                };
                // console.log(`${$scope.docs[x].num}: ${$scope.docs[x].filename}, orientation: ${$scope.docs[x].orientation}`);
            };
            setTimeout(function(){
                docFormatting();
            }, 500);
        };
    }, function errorCallback(response) {
        console.log(`Status: ${response.status}`);
    });

	$scope.setDoc = function(doc){
        currentPhoto = doc.num;
        $scope.mainDoc = $scope.docs[currentPhoto].signedRequest;
        $scope.mainDocObj = $scope.docs[currentPhoto];
        setTimeout(function(){
            docFormatting();
        }, 500);
        // console.log(`Current Photo: ${doc.num}, ${doc.filename}`);
	};

    $scope.nextDoc = function() {
        if (currentPhoto < $scope.docs.length-1) {
            currentPhoto = currentPhoto + 1;
        }
        else {currentPhoto = 0};
        $scope.mainDocObj = $scope.docs[currentPhoto];
        // console.log(`Current Photo: ${$scope.mainDocObj.num}, ${$scope.mainDocObj.filename}`);
        if ($scope.docs[currentPhoto].signedRequest) {
            $scope.mainDoc = $scope.docs[currentPhoto].signedRequest;
            // console.log(`nextDoc: signedRequest in doc: ${$scope.docs[currentPhoto].signedRequest}`);
        } else {
            getDoc(currentPhoto);
        };
        setTimeout(function(){
            docFormatting();
        }, 500);
    };

    $scope.prevDoc = function() {
        if (currentPhoto < 1) {
            currentPhoto = $scope.docs.length-1;
        }
        else {currentPhoto = currentPhoto - 1};
        $scope.mainDocObj = $scope.docs[currentPhoto];
        // console.log(`Current Photo: ${$scope.mainDocObj.num}, ${$scope.mainDocObj.filename}`);
        if ($scope.docs[currentPhoto].signedRequest) {
            $scope.mainDoc = $scope.docs[currentPhoto].signedRequest;
            // console.log(`prevDoc: signedRequest in doc: ${$scope.docs[currentPhoto].signedRequest}`);
        } else {
            getDoc(currentPhoto);
        };
        setTimeout(function(){
            docFormatting();
        }, 500);
    };

    $scope.removeDoc = function(doc) {
        if ($window.confirm('Bekræft venligst at du vil slette billedet '+doc.filename)) {

            $http({
                method: 'GET',
                url: `/photos/sign-s3-deletedoc?file_name=${doc.filename}&file_type=${doc.filetype}&folder=${doc.year}&operation=${'deleteObject'}`
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
                        url: '/photos/'+doc._id,
                        headers: {
                            'x-auth': localStorage.userToken
                        }
                    }).then(function(response) {
                        // console.log(`Status: ${response.status}`);
                        // console.log(response.data._id);
/*                         
                        console.log(`Number of docs: ${$scope.docs.length}`);
                        $scope.docs.pop(currentPhoto);
                        console.log(`Number of docs after pop: ${$scope.docs.length}`);
                        for (z=0; z<$scope.docs.length; z++) {
                            console.log(`After pop: ${$scope.docs[z].filename}`);
                        };
                        if ($scope.docs[0]) {
                            if (currentPhoto < 1) {
                                currentPhoto = $scope.docs.length-1;
                            }
                            else {currentPhoto = currentPhoto - 1};
                            $scope.mainDocObj = $scope.docs[currentPhoto];
                            console.log(`Current Photo: ${$scope.mainDocObj.num}, ${$scope.mainDocObj.filename}`);
                            if ($scope.docs[currentPhoto].signedRequest) {
                                $scope.mainDoc = $scope.docs[currentPhoto].signedRequest;
                                console.log(`prevDoc: signedRequest in doc: ${$scope.docs[currentPhoto].signedRequest}`);
                            } else {
                                getDoc(currentPhoto);
                            };
                        } else {
                            $location.path('/myphotoalbum');
                        };
 */
                        $location.path('/myphotoalbum/'+doc.year);
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
            $location.path('/about');
        };
    };

    $scope.addComment = function(doc) {
        $http({
            method: 'PATCH',
            url: '/photos/'+doc._id,
            headers: {
                'x-auth': localStorage.userToken
            },
            data: {text: $scope.mycomment}
        }).then(function(response) {
            // $location.path('/photoalbum/' + $scope.year);
            // $route.reload();
            var newtextobj = {
                textobj: {
                    date: new Date(),
                    contributor: 'Mit bidrag',
                    text: $scope.mycomment
                }
            };
            $scope.mainDocObj.doctext.push(newtextobj);
            console.log(`${JSON.stringify($scope.mainDocObj.doctext)}`);
            $scope.mycomment = '';
        }, function errorCallback(response) {
            console.log(`Status: ${response.status}`);
        });
    };

    function getDoc(photoNum) {
        var operation = 'getObject';
        var filename = $scope.docs[photoNum].filename;
        var filetype = $scope.docs[photoNum].filetype;
        var folder = $scope.docs[photoNum].year;
        $http({
            method: 'GET',
            url: `/photos/sign-s3-getdoc?file_name=${filename}&file_type=${filetype}&folder=${folder}&operation=${operation}`
        }).then(function(response) {
            // console.log("Signed request: "+response.data.signedRequest);
            $scope.mainDoc = response.data.signedRequest;
            $scope.docs[photoNum].signedRequest = response.data.signedRequest;
            // console.log(`mainDoc: ${$scope.mainDoc}`);
        }, function errorCallback(response) {
            console.log(`Status: ${response.status}`);
        });
    };

    function screenSizing() {
        var screenSizes = [
            {"screenHeight": 400},
            {"screenHeight": 520},
            {"screenHeight": 680},
            {"screenHeight": 780},
            {"screenHeight": 930},
            {"screenHeight": 1080}
        ];

        var screenSizeIndex = 0;
        for (var s=0; s<screenSizes.length; s++) {
            // console.log(`screenSizing, innerHeight: ${window.innerHeight}, ${screenSizes[s].screenHeight}`);
            if (window.innerHeight > screenSizes[s].screenHeight) {
                screenSizeIndex = s;
                // console.log(`Bigger!`);
            };
        };
        // console.log(`screenSizeIndex: ${screenSizeIndex}`);
        return screenSizeIndex;
    };

    function docFormatting() {

        var docFormats = [
            {"whRelation": 0.6},
            {"whRelation": 1.3},
            {"whRelation": 1.7}
        ];

        var classMapDivHor = [
            ['div-horizontal-520-ver','div-horizontal-680-ver','div-horizontal-780-ver','div-horizontal-930-ver','div-horizontal-1080-ver','div-horizontal-1081-ver'],
            ['div-horizontal-520-4-3','div-horizontal-680-4-3','div-horizontal-780-4-3','div-horizontal-930-4-3','div-horizontal-1080-4-3','div-horizontal-1081-4-3'],
            ['div-horizontal-520-16-9','div-horizontal-680-16-9','div-horizontal-780-16-9','div-horizontal-930-16-9','div-horizontal-1080-16-9','div-horizontal-1081-16-9']
        ];
        var classMapImgHor = [
            ['img-horizontal-520-ver','img-horizontal-680-ver','img-horizontal-780-ver','img-horizontal-930-ver','img-horizontal-1080-ver','img-horizontal-1081-ver'],
            ['img-horizontal-520-4-3','img-horizontal-680-4-3','img-horizontal-780-4-3','img-horizontal-930-4-3','img-horizontal-1080-4-3','img-horizontal-1081-4-3'],
            ['img-horizontal-520-16-9','img-horizontal-680-16-9','img-horizontal-780-16-9','img-horizontal-930-16-9','img-horizontal-1080-16-9','img-horizontal-1081-16-9']
        ];

        var classMapDivVer = [
            ['div-vertical-520-ver','div-vertical-680-ver','div-vertical-780-ver','div-vertical-930-ver','div-vertical-1080-ver','div-vertical-1081-ver']
        ];
        var classMapImgVer = [
            ['img-vertical-520-ver','img-vertical-680-ver','img-vertical-780-ver','img-vertical-930-ver','img-vertical-1080-ver','img-vertical-1081-ver']
        ];

        if ($scope.docs[currentPhoto].orientation == 0) {
            var imgWidth = document.getElementById("photo-img").naturalWidth;
            var imgHeight = document.getElementById("photo-img").naturalHeight;
        } else if ($scope.docs[currentPhoto].orientation == 1 || $scope.docs[currentPhoto].orientation == -1) {
            var imgWidth = document.getElementById("photo-img-ver").naturalWidth;
            var imgHeight = document.getElementById("photo-img-ver").naturalHeight;
        } else {

        };
        var whr = imgWidth/imgHeight;
        // console.log(`Width: ${imgWidth}, Height: ${imgHeight}, Relation: ${whr}`);
        $scope.imgWidth = imgWidth; $scope.imgHeight = imgHeight;

        var docFormatIndex = 0;
        for (var f=0; f<docFormats.length; f++) {
            // console.log(`f: ${f}, docFormat: ${docFormats[f].whRelation}`);
            if (whr > docFormats[f].whRelation) {docFormatIndex = f};
        };

        // console.log(`In docFormatting. ${$scope.docs[currentPhoto].num}: ${$scope.docs[currentPhoto].filename}, orientation: ${$scope.docs[currentPhoto].orientation}`);
        if ($scope.docs[currentPhoto].orientation == 0) {
            console.log(`Class to be selected for horizontal img, DIV: ${classMapDivHor[docFormatIndex][$scope.screenSizeIndex]}, IMG: ${classMapImgHor[docFormatIndex][$scope.screenSizeIndex]}`);
            angular.element(document.querySelector('#photo-div') ).addClass(classMapDivHor[docFormatIndex][$scope.screenSizeIndex]);
            angular.element(document.querySelector('#photo-img') ).addClass(classMapImgHor[docFormatIndex][$scope.screenSizeIndex]);
        } else if ($scope.docs[currentPhoto].orientation == 1 || $scope.docs[currentPhoto].orientation == -1) {
            console.log(`Class to be selected for vertical img, DIV: ${classMapDivVer[0][$scope.screenSizeIndex]}, IMG: ${classMapImgVer[0][$scope.screenSizeIndex]}`);
            angular.element(document.querySelector('#photo-div-ver') ).addClass(classMapDivVer[0][$scope.screenSizeIndex]);
            angular.element(document.querySelector('#photo-img-ver') ).addClass(classMapImgVer[0][$scope.screenSizeIndex]);
        } else {
            
        };
    };

    $scope.rotateDoc = function(doc, direction) {
        var newOrientation = 0;
        var rotation = false;
        var rotAction = 'med uret'
        if (direction == -1) {
            if (doc.orientation > 0) {
                newOrientation = doc.orientation + direction;
                rotation = true;
                rotAction = 'mod uret';
                // console.log(`Rotate counter clockwise`);
            } else {
                $window.alert('Handlingen er pt ikke understøttet.');
            };
        } else {
            if (doc.orientation < 1) {
                newOrientation = doc.orientation + direction;
                rotation = true;
                // console.log(`Rotate clockwise`);
            } else {
                $window.alert('Handlingen er pt ikke understøttet.');
            };
        };

        if (rotation) {
            if ($window.confirm('Venligst bekræft at du vil rotere billedet '+rotAction)) {
                $http({
                    method: 'PATCH',
                    url: '/photos/orientation/'+doc._id,
                    headers: {
                        'x-auth': localStorage.userToken
                    },
                    data: {orientation: newOrientation}
                }).then(function(response) {
                    // console.log(`Status: ${response.status}`);
                    // $location.path('/photoalbum/' + $scope.year);
                    // $route.reload();
                    $scope.mainDocObj.orientation = newOrientation;
                    docFormatting();
                }, function errorCallback(response) {
                    console.log(`Status: ${response.status}`);
                });
            };
        };
    };
    
    function detectClient() {
        $scope.userClientFullDesc = navigator.userAgent;
        // console.log(navigator.userAgent);
        if (navigator.userAgent.match(/Android/i)) {
            $scope.userClient = "ANDROID";
        } else if (navigator.userAgent.match(/iPhone/i)) {
            $scope.userClient = "IPHONE";
        } else if (navigator.userAgent.match(/iPad/i)) {
            $scope.userClient = "IPAD";
        } else {
            $scope.userClient = "BROWSER";
        };
    };
}])

.controller('photooverviewCtrl', ['$scope', '$http', '$routeParams', 'AuthService', function($scope, $http, $routeParams, AuthService) {

    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
            $scope.role = AuthService.userRole();
        };
    });

    $scope.docscope = $routeParams.docscope;
    var currentyear = (new Date()).getFullYear();
    var firstyear = 1993
    $scope.years = [];
    $scope.total = 0;
    if ($routeParams.docscope == "global") {
        $scope.mydocs = false;
        photosurl = '/photos/count/';
        $scope.headline = "Billedoversigt";
    } else {
        $scope.mydocs = true;
        photosurl = '/photos/my/count/';
        $scope.headline = "Min billedoversigt";
    };
    // console.log(`My docs?: ${$scope.mydocs}`);

    for (var y=firstyear; y<=currentyear; y++) {
        // console.log(`Year before http: ${y}`);
        $http({
            method: 'GET',
            url: photosurl+y.toString(),
            headers: {
                'x-auth': localStorage.userToken
            }
        }).then(function(response) {
            // console.log(`Status: ${response.status}`);
            $scope.years.push(response.data);
            // console.log(`Year: ${y.toString()}, Count: ${response.data}`);
            $scope.total += response.data.count;
            angular.element(document.querySelector( '#photoalbum' ) ).addClass('active');
            if ($scope.mydocs) {
                angular.element(document.querySelector( '#myphotooverview' ) ).addClass('active');
            } else {
                angular.element(document.querySelector( '#globalphotooverview' ) ).addClass('active');
            };
        }, function errorCallback(response) {
            console.log(`Status: ${response.status}`);
        });
    };

}])
