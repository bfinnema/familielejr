angular.module('familielejr')

.controller('photouploadCtrl', ['$scope', '$http', '$route', '$window', '$timeout', 'AuthService', 
function ($scope, $http, $route, $window, $timeout, AuthService) {

    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
            $scope.role = AuthService.userRole();
        };
    });

    setTimeout(function(){
        angular.element(document.querySelector( '#photoalbum' ) ).addClass('active');
        angular.element(document.querySelector( '#photoupload' ) ).addClass('active');
    }, 1000);

    $scope.yearSelected = false;
    $scope.errorMsg = '';
    $scope.successMsg = '';
    $scope.showImagesList = false;
    $scope.imageReplica = true;

    $http({
        method: 'GET',
        url: '/tenants/mytenant/',
        headers: {
            'x-auth': localStorage.userToken
        }
    }).then(function(tenant) {
        console.log(`Tenant fetched. Status: ${tenant.status}. Tenant name: ${tenant.data.tenantName}`);
        $scope.tenantName = tenant.data.tenantName;
        $scope.tenant = tenant.data;
        var currentyear = (new Date()).getFullYear();
        var firstyear = $scope.tenant.startYear;
        $scope.years = [];
        for (var y=currentyear; y>=firstyear; y--) {
            $scope.years.push({"year": y.toString()});
        };
        $scope.years.push({"year": "historiske"});
    }, function errorCallback(response) {
        console.log(`Error. Status: ${response.status}`);
    });

    $scope.uploadPicture = function(file) {
        // console.log(`uploadPicture. filename: ${file.name}, filetype: ${file.type}`);
        var folder = $scope.year;
        var operation = 'putObject';

        var selectedEvent = $scope.events.filter(obj => {
            return obj.eventName == $scope.selEvent
        });
        console.log(`selectedEvent: ${JSON.stringify(selectedEvent)}`);
        if (selectedEvent.length > 0) {
            photoEvent = selectedEvent[0];
        };
        var picturetext = (`${photoEvent.eventName}`);
        if (folder == "historiske") {
            picturetext = (`Historisk billede, ${tenant.tenantName}.`);
        };
        if ($scope.picturetext) {picturetext = $scope.picturetext;};

        $http({
            method: 'GET',
            url: `/photos/s3ops/sign-s3?file_name=${file.name}&file_type=${file.type}&folder=${folder}&operation=${operation}`,
            headers: {
                'x-auth': localStorage.userToken
            }
        }).then(function(response) {
            console.log(response);
            console.log(response.data.url);
            $scope.successMsg = 'VENT VENLIGST. Billedet '+file.name+' bliver uploaded.......'
            const xhr = new XMLHttpRequest();
            xhr.open('PUT', response.data.signedRequest);
            xhr.onreadystatechange = () => {
                if(xhr.readyState === 4){
                    if(xhr.status === 200){
                        console.log("Success!");
                        var data = {
                            year: $scope.year,
                            commonImage: $scope.commonImage,
                            eventName: $scope.selEvent,
                            filename: file.name,
                            filetype: file.type,
                            user: localStorage.familielejrUserId,
                            text: picturetext,
                            orientation: 0
                        };
                        if (selectedEvent.length > 0) {
                            data._event = selectedEvent[0]._id;
                        };
                        $http({
                            method: 'POST',
                            url: '/photos/upload',
                            headers: {
                                'x-auth': localStorage.userToken
                            },
                            data: data
                        }).then(function(response) {
                            // console.log(`Status: ${response.status}`);
                            // console.log(response.data._id);
                            $scope.picFile = null;
                            $scope.picturetext = "";
                            $scope.errorMsg = "";
                            $scope.successMsg = file.name + ' blev uploaded.'
                            $scope.getUploadedPhotos();
                            // $route.reload();
                        }, function errorCallback(response) {
                            console.log(`Status: ${response.status}`);
                            if (response.status == 409) {
                                $scope.errorMsg = "En anden har allerede uploaded et billede med navnet "+file.name;
                                $scope.successMsg = '';
                                $scope.picFile = null;
                            };
                        });
                    }
                    else{
                        $window.alert('Could not upload file.');
                        $scope.errorMsg = 'Der opstod en fejl';
                    }
                }
            };
            xhr.send(file);

        }, function errorCallback(response) {
            console.log(`ErrorCallback Status: ${response.status}`);
        });
    };

    $scope.getUploadedPhotos = function() {
        // This function fetches all photos that the user has uploaded for the selected year and it fetches all events for that year.
        // $scope.successMsg = '';
        $http({
            method: 'GET',
            url: '/photos/my/'+$scope.year,
            headers: {
                'x-auth': localStorage.userToken
            }
        }).then(function(images) {
            console.log(`MyphotosStatus: ${images.status}`);
            $scope.images = images.data;
            if (!images.data[0]) {
                console.log('No photos for year '+$scope.year)
                $scope.imagesExist = false;
            } else {
                $scope.imagesExist = true;
                // $scope.mainImage = $scope.images[0].path + $scope.images[0].filename;  // Old method
                for (x=0; x<$scope.images.length; x++) {
                    $scope.images[x].num = x;
                };
            };
            $scope.showImagesList = true;

            console.log(`In getEvents (getUploadedPhotos, really). Year: ${$scope.year}`);
            var year = $scope.year;
            if (year == "historiske") {
                $scope.eventNames = [{"name": "Historisk"}];
            } else {
                $scope.eventNames = [{"name": "Ikke tilknyttet en begivenhed"}];
            };
            $scope.selEvent = $scope.eventNames[0].name;
            $scope.yearSelected = true;
            return $http({
                method: 'GET',
                url: '/events/year/' + year,
                headers: {
                    'x-auth': localStorage.userToken
                }
            });
        }).then(function(events) {
            console.log(`Events fetched. Status: ${events.status}. # events: ${events.data.length}`);
            if (events.data.length > 0) {
                for (ev in events.data) {
                    console.log(`eventName: ${events.data[ev].eventName}`);
                    $scope.eventNames.push({"name": events.data[ev].eventName});
                };
                $scope.events = events.data;
                var lastEvent = $scope.eventNames.length - 1;
                $scope.selEvent = $scope.eventNames[lastEvent].name;
            };
        }, function errorCallback(response) {
            console.log(`Status: ${response.status}`);
        });
    
    };

    $scope.checkImageReplica = function(file) {
        $scope.imageReplica = true;
        $scope.errorMsg = '';
        // console.log(`${file.name}`);
        var foundReplica = false;
        for (var i=0; i<$scope.images.length; i++) {
            // console.log(`${$scope.images[i].filename}`);
            if ($scope.images[i].filename == file.name) {
                foundReplica = true;
                $scope.errorMsg = 'Du har allerede uploaded et billede med det navn';
            };
        };
        if (!foundReplica) {$scope.imageReplica = false;};
        console.log(`${file.name}, ${file.type}, ${file.size}, ${file}`);
        var selectedFile = document.getElementById('fileSelected').files[0];
        console.log(`${selectedFile}`);
        console.log(`${document.getElementById("fileSelected").height}, ${document.getElementById("fileSelected").width}`);
        var img = new Image();
        // img.src = file;
        // console.log(`Image 1 width: ${img.width}. Height: ${img.height}`);
    };

}])

.controller('photoalbumCtrl', ['$scope', '$http', '$routeParams', '$window', '$route', '$location', 'AuthService', function($scope, $http, $routeParams, $window, $route, $location, AuthService) {

    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
            $scope.role = AuthService.userRole();
        };
    });

    setTimeout(function(){
        angular.element(document.querySelector( '#photoalbum' ) ).addClass('active');
    }, 1000);

    $scope.innerWidth = window.innerWidth;
    $scope.innerHeight = window.innerHeight;
    detectClient();
    $scope.screenSizeIndex = screenSizing();
    // console.log(`Screen Size detected: ${$scope.screenSizeIndex}`);
    var currentPhoto = 0;
    $scope.year = $routeParams.year;
    $scope.commonImages = false;
    var url = '/photos/year/'+$routeParams.year;
    if ($routeParams.year == "common") {
        url = "/photos/common"
        // console.log(`Common Images. url: ${url}`);
        $scope.commonImages = true;
    };
    //console.log(`Photos from year ${$scope.year}`)

    $http({
        method: 'GET',
        url: 'tenants/mytenant',
        headers: {
            'x-auth': localStorage.userToken
        }
    }).then(function(tenant) {
        console.log(`Tenant fetched. Status: ${tenant.status}. Tenant name: ${tenant.data.tenantName}`);
        $scope.tenantName = tenant.data.tenantName;
        /* $scope.tenant = tenant.data;
        var currentyear = (new Date()).getFullYear();
        var firstyear = $scope.tenant.startYear;
        $scope.years = [];
        for (var y=currentyear; y>=firstyear; y--) {
            $scope.years.push({"year": y.toString()});
        };
        $scope.years.push({"year": "historiske"}); */

        return $http({
            method: 'GET',
            url: url,
            headers: {
                'x-auth': localStorage.userToken
            }
        });
    }).then(function(response) {
        // console.log(`Status: ${response.status}`);
        $scope.images = response.data;
        if (!response.data[0]) {
            // console.log('No photos for year '+$scope.year)
            $scope.imagesExist = false;
        } else {
            $scope.imagesExist = true;
            // $scope.mainImage = $scope.images[0].path + $scope.images[0].filename;  // Old method
            $scope.mainImageObj = $scope.images[0];
            console.log(`Name: ${$scope.mainImageObj.filename}, Filetype: ${$scope.mainImageObj.filetype}`);
            getImage(0);
            
            for (x=0; x<$scope.images.length; x++) {
                $scope.images[x].num = x;
                // console.log(`orientation: ${$scope.images[x].orientation}`);
                if (!$scope.images[x].orientation) {
                    $scope.images[x].orientation = 0;
                };
                // console.log(`${$scope.images[x].num}: ${$scope.images[x].filename}, orientation: ${$scope.images[x].orientation}`);
            };
            setTimeout(function(){
                imageFormatting();
            }, 500);
        };
    }, function errorCallback(response) {
        console.log(`Status: ${response.status}`);
    });

	$scope.setImage = function(image){
		// $scope.mainImage = image.path + image.filename;  // Old method
        currentPhoto = image.num;
        $scope.mainImage = $scope.images[currentPhoto].signedRequest;
        $scope.mainImageObj = $scope.images[currentPhoto];
        setTimeout(function(){
            imageFormatting();
        }, 500);
        // console.log(`Current Photo: ${image.num}, ${image.filename}`);
	};

    $scope.nextImage = function() {
/* 
        for (sr in $scope.signedRequests) {
            console.log(`nextImage: signedRequest: ${$scope.signedRequests[sr]}`);
        };
 */        
        if (currentPhoto < $scope.images.length-1) {
            currentPhoto = currentPhoto + 1;
        }
        else {currentPhoto = 0};
        // $scope.mainImage = $scope.images[currentPhoto].path + $scope.images[currentPhoto].filename; // Old method
        $scope.mainImageObj = $scope.images[currentPhoto];
        if ($scope.images[currentPhoto].signedRequest) {  // if ($scope.signedRequests[currentPhoto] !="") {
            $scope.mainImage = $scope.images[currentPhoto].signedRequest;
            // console.log(`nextImage: signedRequest in image: ${$scope.images[currentPhoto].signedRequest}`);
        } else {
            getImage(currentPhoto);
        };
        setTimeout(function(){
            imageFormatting();
        }, 500);
    // console.log(`Current Photo: ${$scope.mainImageObj.num}, ${$scope.mainImageObj.filename}`);
    };

    $scope.prevImage = function() {
        if (currentPhoto < 1) {
            currentPhoto = $scope.images.length-1;
        }
        else {currentPhoto = currentPhoto - 1};
        // $scope.mainImage = $scope.images[currentPhoto].path + $scope.images[currentPhoto].filename;
        $scope.mainImageObj = $scope.images[currentPhoto];
        if ($scope.images[currentPhoto].signedRequest) {  // if ($scope.signedRequests[currentPhoto] !="") {
            $scope.mainImage = $scope.images[currentPhoto].signedRequest;
            // console.log(`prevImage: signedRequest in image: ${$scope.images[currentPhoto].signedRequest}`);
        } else {
            getImage(currentPhoto);
        };
        setTimeout(function(){
            imageFormatting();
        }, 500);
        // console.log(`Current Photo: ${$scope.mainImageObj.num}, ${$scope.mainImageObj.filename}`);
    };

    $scope.removeImage = function(image) {
        if ($window.confirm('Bekræft venligst at du vil slette billedet '+image.filename) && $scope.role == 0) {

            $http({
                method: 'GET',
                url: `/photos/s3ops/sign-s3-deleteimage?file_name=${image.filename}&file_type=${image.filetype}&folder=${image.year}&operation=${'deleteObject'}`,
                headers: {
                    'x-auth': localStorage.userToken
                }
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
                        url: '/photos/admindelete/'+image._id,
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

    $scope.addComment = function(image) {
        // console.log(`Comment: ${$scope.mycomment}`);
        $http({
            method: 'PATCH',
            url: '/photos/'+image._id,
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
            $scope.mainImageObj.imagetext.push(newtextobj);
            // console.log(`${JSON.stringify($scope.mainImageObj.imagetext)}`);
            $scope.mycomment = '';
        }, function errorCallback(response) {
            console.log(`Status: ${response.status}`);
        });
    };

    function getImage(photoNum) {
        var operation = 'getObject';
        var filename = $scope.images[photoNum].filename;
        var filetype = $scope.images[photoNum].filetype;
        var folder = $scope.images[photoNum].year;
        $http({
            method: 'GET',
            url: `/photos/s3ops/sign-s3-getimage?file_name=${filename}&file_type=${filetype}&folder=${folder}&operation=${operation}`,
            headers: {
                'x-auth': localStorage.userToken
            }
        }).then(function(response) {
            // console.log("Signed request: "+response.data.signedRequest);
            $scope.mainImage = response.data.signedRequest;
            $scope.images[photoNum].signedRequest = response.data.signedRequest;
            // console.log(`mainImage: ${$scope.mainImage}`);
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

    function imageFormatting() {

        var imageFormats = [
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

        if ($scope.images[currentPhoto].orientation == 0) {
            var imgWidth = document.getElementById("photo-img").naturalWidth;
            var imgHeight = document.getElementById("photo-img").naturalHeight;
        } else if ($scope.images[currentPhoto].orientation == 1 || $scope.images[currentPhoto].orientation == -1) {
            var imgWidth = document.getElementById("photo-img-ver").naturalWidth;
            var imgHeight = document.getElementById("photo-img-ver").naturalHeight;
        } else {

        };
        var whr = imgWidth/imgHeight;
        // console.log(`Width: ${imgWidth}, Height: ${imgHeight}, Relation: ${whr}`);
        $scope.imgWidth = imgWidth; $scope.imgHeight = imgHeight;

        var imageFormatIndex = 0;
        for (var f=0; f<imageFormats.length; f++) {
            // console.log(`f: ${f}, imageFormat: ${imageFormats[f].whRelation}`);
            if (whr > imageFormats[f].whRelation) {imageFormatIndex = f};
        };

        // console.log(`In imageFormatting. ${$scope.images[currentPhoto].num}: ${$scope.images[currentPhoto].filename}, orientation: ${$scope.images[currentPhoto].orientation}`);
/*         
        if ($scope.images[currentPhoto].orientation == 0) {
            if ($scope.userClient == "ANDROID" || $scope.userClient == "IPHONE") {
                angular.element(document.querySelector('#photo-div') ).addClass('div-horizontal-mobile');
                angular.element(document.querySelector('#photo-img') ).addClass('img-responsive');
            } else if ($scope.userClient == "BROWSER") {
                // console.log(`Class to be selected for horizontal img, DIV: ${classMapDivHor[imageFormatIndex][$scope.screenSizeIndex]}, IMG: ${classMapImgHor[imageFormatIndex][$scope.screenSizeIndex]}`);
                angular.element(document.querySelector('#photo-div') ).addClass(classMapDivHor[imageFormatIndex][$scope.screenSizeIndex]);
                angular.element(document.querySelector('#photo-img') ).addClass(classMapImgHor[imageFormatIndex][$scope.screenSizeIndex]);
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
        if ($scope.images[currentPhoto].orientation == 0) {
            // console.log(`Class to be selected for horizontal img, DIV: ${classMapDivHor[imageFormatIndex][$scope.screenSizeIndex]}, IMG: ${classMapImgHor[imageFormatIndex][$scope.screenSizeIndex]}`);
            angular.element(document.querySelector('#photo-div') ).addClass(classMapDivHor[imageFormatIndex][$scope.screenSizeIndex]);
            angular.element(document.querySelector('#photo-img') ).addClass(classMapImgHor[imageFormatIndex][$scope.screenSizeIndex]);
        } else if ($scope.images[currentPhoto].orientation == 1 || $scope.images[currentPhoto].orientation == -1) {
            // console.log(`Class to be selected for vertical img, DIV: ${classMapDivVer[0][$scope.screenSizeIndex]}, IMG: ${classMapImgVer[0][$scope.screenSizeIndex]}`);
            angular.element(document.querySelector('#photo-div-ver') ).addClass(classMapDivVer[0][$scope.screenSizeIndex]);
            angular.element(document.querySelector('#photo-img-ver') ).addClass(classMapImgVer[0][$scope.screenSizeIndex]);
        } else {
            
        };
        
    };

    $scope.rotateImage = function(image, direction) {
        var newOrientation = 0;
        var rotation = false;
        var rotAction = 'med uret'
        if (direction == -1) {
            if (image.orientation > 0) {
                newOrientation = image.orientation + direction;
                rotation = true;
                rotAction = 'mod uret';
                // console.log(`Rotate counter clockwise`);
            } else {
                $window.alert('Handlingen er pt ikke understøttet.');
            };
        } else {
            if (image.orientation < 1) {
                newOrientation = image.orientation + direction;
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
                    url: '/photos/orientation/'+image._id,
                    headers: {
                        'x-auth': localStorage.userToken
                    },
                    data: {orientation: newOrientation}
                }).then(function(response) {
                    // console.log(`Status: ${response.status}`);
                    // $location.path('/photoalbum/' + $scope.year);
                    // $route.reload();
                    $scope.mainImageObj.orientation = newOrientation;
                    imageFormatting();
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

// The slideshowCtrl was made for picture slide show, but it did not work properly, so it is not used.
.controller('slideshowCtrl', ['$scope', '$http', '$routeParams', '$window', '$route', '$location', 'AuthService', function($scope, $http, $routeParams, $window, $route, $location, AuthService) {

    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
            $scope.role = AuthService.userRole();
        };
    });

    $scope.innerWidth = window.innerWidth;
    $scope.innerHeight = window.innerHeight;
    detectClient();
    $scope.screenSizeIndex = screenSizing();
    console.log(`Screen Size detected: ${$scope.screenSizeIndex}`);
    var currentPhoto = 0;
    $scope.year = $routeParams.year;
    console.log(`Photos from year ${$scope.year}`)

    $http({
        method: 'GET',
        url: '/photos/year/'+$routeParams.year,
        headers: {
            'x-auth': localStorage.userToken
        }
    }).then(function(response) {
        console.log(`Status: ${response.status}`);
        $scope.images = response.data;
        if (!response.data[0]) {
            console.log('No photos for year '+$scope.year)
            $scope.imagesExist = false;
        } else {
            $scope.imagesExist = true;
            $scope.mainImage = $scope.images[0].path + $scope.images[0].filename;  // Old method
            $scope.mainImageObj = $scope.images[0];
            console.log(`Name: ${$scope.mainImageObj.filename}, Filetype: ${$scope.mainImageObj.filetype}`);
            getImage(0);
            
            for (x=0; x<$scope.images.length; x++) {
                $scope.images[x].num = x;
                console.log(`orientation: ${$scope.images[x].orientation}`);
                if (!$scope.images[x].orientation) {
                    $scope.images[x].orientation = 0;
                };
                console.log(`${$scope.images[x].num}: ${$scope.images[x].filename}, orientation: ${$scope.images[x].orientation}`);
            };
            setTimeout(function(){
                imageFormatting();
            }, 500);
        };
        var i=0;
        function photoLoop() {
            setTimeout(function() {
                console.log(`Photo number ${i}`);
                $scope.mainImageObj = $scope.images[i];
                getImage(i);
                i++;
                if (i<$scope.images.length) {
                    photoLoop();
                };
            }, 3000)
        };
        photoLoop();
    
    }, function errorCallback(response) {
        console.log(`Status: ${response.status}`);
    });

    /* function photoLoop(currentPhoto) {
        setTimeout(function() {
            console.log(`Photo number ${currentPhoto}`);
            $scope.mainImageObj = $scope.images[currentPhoto];
            getImage(currentPhoto);
            currentPhoto++;
            if (currentPhoto<$scope.images.length) {
                photoLoop();
            };
        }, 3000)
    }; */

    $scope.nextImage = function() {
        if (currentPhoto < $scope.images.length-1) {
            currentPhoto = currentPhoto + 1;
        }
        else {currentPhoto = 0};
        // $scope.mainImage = $scope.images[currentPhoto].path + $scope.images[currentPhoto].filename; // Old method
        $scope.mainImageObj = $scope.images[currentPhoto];
        if ($scope.images[currentPhoto].signedRequest) {  // if ($scope.signedRequests[currentPhoto] !="") {
            $scope.mainImage = $scope.images[currentPhoto].signedRequest;
            // console.log(`nextImage: signedRequest in image: ${$scope.images[currentPhoto].signedRequest}`);
        } else {
            getImage(currentPhoto);
        };
        setTimeout(function(){
            imageFormatting();
        }, 500);
    // console.log(`Current Photo: ${$scope.mainImageObj.num}, ${$scope.mainImageObj.filename}`);
    };

    function getImage(photoNum) {
        var operation = 'getObject';
        var filename = $scope.images[photoNum].filename;
        var filetype = $scope.images[photoNum].filetype;
        var folder = $scope.images[photoNum].year;
        $http({
            method: 'GET',
            url: `/photos/s3ops/sign-s3-getimage?file_name=${filename}&file_type=${filetype}&folder=${folder}&operation=${operation}`
        }).then(function(response) {
            console.log("Signed request: "+response.data.signedRequest);
            $scope.mainImage = response.data.signedRequest;
            $scope.images[photoNum].signedRequest = response.data.signedRequest;
            console.log(`mainImage: ${$scope.mainImage}`);
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

    function imageFormatting() {

        var imageFormats = [
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

        if ($scope.images[currentPhoto].orientation == 0) {
            var imgWidth = document.getElementById("photo-img").naturalWidth;
            var imgHeight = document.getElementById("photo-img").naturalHeight;
        } else if ($scope.images[currentPhoto].orientation == 1 || $scope.images[currentPhoto].orientation == -1) {
            var imgWidth = document.getElementById("photo-img-ver").naturalWidth;
            var imgHeight = document.getElementById("photo-img-ver").naturalHeight;
        } else {

        };
        var whr = imgWidth/imgHeight;
        // console.log(`Width: ${imgWidth}, Height: ${imgHeight}, Relation: ${whr}`);
        $scope.imgWidth = imgWidth; $scope.imgHeight = imgHeight;

        var imageFormatIndex = 0;
        for (var f=0; f<imageFormats.length; f++) {
            // console.log(`f: ${f}, imageFormat: ${imageFormats[f].whRelation}`);
            if (whr > imageFormats[f].whRelation) {imageFormatIndex = f};
        };

        // console.log(`In imageFormatting. ${$scope.images[currentPhoto].num}: ${$scope.images[currentPhoto].filename}, orientation: ${$scope.images[currentPhoto].orientation}`);
        if ($scope.images[currentPhoto].orientation == 0) {
            // console.log(`Class to be selected for horizontal img, DIV: ${classMapDivHor[imageFormatIndex][$scope.screenSizeIndex]}, IMG: ${classMapImgHor[imageFormatIndex][$scope.screenSizeIndex]}`);
            angular.element(document.querySelector('#photo-div') ).addClass(classMapDivHor[imageFormatIndex][$scope.screenSizeIndex]);
            angular.element(document.querySelector('#photo-img') ).addClass(classMapImgHor[imageFormatIndex][$scope.screenSizeIndex]);
        } else if ($scope.images[currentPhoto].orientation == 1 || $scope.images[currentPhoto].orientation == -1) {
            // console.log(`Class to be selected for vertical img, DIV: ${classMapDivVer[0][$scope.screenSizeIndex]}, IMG: ${classMapImgVer[0][$scope.screenSizeIndex]}`);
            angular.element(document.querySelector('#photo-div-ver') ).addClass(classMapDivVer[0][$scope.screenSizeIndex]);
            angular.element(document.querySelector('#photo-img-ver') ).addClass(classMapImgVer[0][$scope.screenSizeIndex]);
        } else {
            
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
        $scope.nopicturestext = "Du har ikke lagt nogen billeder op endnu. "
    } else {
        $scope.headline = "Mine billeder fra " + $scope.year;
        photosurl = '/photos/my/'+$scope.year;
        $scope.nopicturestext = "Du har ikke lagt nogen billeder fra "+$scope.year+" op endnu. "
    };
    
    $http({
        method: 'GET',
        url: 'tenants/mytenant',
        headers: {
            'x-auth': localStorage.userToken
        }
    }).then(function(tenant) {
        // console.log(`Tenant fetched. Status: ${tenant.status}. Tenant name: ${tenant.data.tenantName}`);
        $scope.tenantName = tenant.data.tenantName;
        // $scope.tenant = tenant.data;
        return $http({
            method: 'GET',
            url: photosurl,
            headers: {
                'x-auth': localStorage.userToken
            }
        });
    }).then(function(response) {
        // console.log(`Status: ${response.status}`);
        $scope.images = response.data;
        if (!response.data[0]) {
            // console.log('No photos for user'+localStorage.familielejrUserId);
            $scope.imagesExist = false;
        } else {
            $scope.imagesExist = true;
            $scope.mainImageObj = $scope.images[0];
            getImage(0);
            for (x=0; x<$scope.images.length; x++) {
                $scope.images[x].num = x;
                // console.log(`orientation: ${$scope.images[x].orientation}`);
                if (!$scope.images[x].orientation) {
                    $scope.images[x].orientation = 0;
                };
                // console.log(`${$scope.images[x].num}: ${$scope.images[x].filename}, orientation: ${$scope.images[x].orientation}`);
            };
            setTimeout(function(){
                imageFormatting();
            }, 500);
        };
    }, function errorCallback(response) {
        console.log(`Status: ${response.status}`);
    });

	$scope.setImage = function(image){
        currentPhoto = image.num;
        $scope.mainImage = $scope.images[currentPhoto].signedRequest;
        $scope.mainImageObj = $scope.images[currentPhoto];
        setTimeout(function(){
            imageFormatting();
        }, 500);
        // console.log(`Current Photo: ${image.num}, ${image.filename}`);
	};

    $scope.nextImage = function() {
        if (currentPhoto < $scope.images.length-1) {
            currentPhoto = currentPhoto + 1;
        }
        else {currentPhoto = 0};
        $scope.mainImageObj = $scope.images[currentPhoto];
        // console.log(`Current Photo: ${$scope.mainImageObj.num}, ${$scope.mainImageObj.filename}`);
        if ($scope.images[currentPhoto].signedRequest) {
            $scope.mainImage = $scope.images[currentPhoto].signedRequest;
            // console.log(`nextImage: signedRequest in image: ${$scope.images[currentPhoto].signedRequest}`);
        } else {
            getImage(currentPhoto);
        };
        setTimeout(function(){
            imageFormatting();
        }, 500);
    };

    $scope.prevImage = function() {
        if (currentPhoto < 1) {
            currentPhoto = $scope.images.length-1;
        }
        else {currentPhoto = currentPhoto - 1};
        $scope.mainImageObj = $scope.images[currentPhoto];
        // console.log(`Current Photo: ${$scope.mainImageObj.num}, ${$scope.mainImageObj.filename}`);
        if ($scope.images[currentPhoto].signedRequest) {
            $scope.mainImage = $scope.images[currentPhoto].signedRequest;
            // console.log(`prevImage: signedRequest in image: ${$scope.images[currentPhoto].signedRequest}`);
        } else {
            getImage(currentPhoto);
        };
        setTimeout(function(){
            imageFormatting();
        }, 500);
    };

    $scope.removeImage = function(image) {
        if ($window.confirm('Bekræft venligst at du vil slette billedet '+image.filename)) {

            $http({
                method: 'GET',
                url: `/photos/s3ops/sign-s3-deleteimage?file_name=${image.filename}&file_type=${image.filetype}&folder=${image.year}&operation=${'deleteObject'}`,
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
                        url: '/photos/'+image._id,
                        headers: {
                            'x-auth': localStorage.userToken
                        }
                    }).then(function(response) {
                        // console.log(`Status: ${response.status}`);
                        // console.log(response.data._id);
/*                         
                        console.log(`Number of images: ${$scope.images.length}`);
                        $scope.images.pop(currentPhoto);
                        console.log(`Number of images after pop: ${$scope.images.length}`);
                        for (z=0; z<$scope.images.length; z++) {
                            console.log(`After pop: ${$scope.images[z].filename}`);
                        };
                        if ($scope.images[0]) {
                            if (currentPhoto < 1) {
                                currentPhoto = $scope.images.length-1;
                            }
                            else {currentPhoto = currentPhoto - 1};
                            $scope.mainImageObj = $scope.images[currentPhoto];
                            console.log(`Current Photo: ${$scope.mainImageObj.num}, ${$scope.mainImageObj.filename}`);
                            if ($scope.images[currentPhoto].signedRequest) {
                                $scope.mainImage = $scope.images[currentPhoto].signedRequest;
                                console.log(`prevImage: signedRequest in image: ${$scope.images[currentPhoto].signedRequest}`);
                            } else {
                                getImage(currentPhoto);
                            };
                        } else {
                            $location.path('/myphotoalbum');
                        };
 */
                        $location.path('/myphotoalbum/'+image.year);
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

    $scope.addComment = function(image) {
        $http({
            method: 'PATCH',
            url: '/photos/'+image._id,
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
            $scope.mainImageObj.imagetext.push(newtextobj);
            console.log(`${JSON.stringify($scope.mainImageObj.imagetext)}`);
            $scope.mycomment = '';
        }, function errorCallback(response) {
            console.log(`Status: ${response.status}`);
        });
    };

    function getImage(photoNum) {
        var operation = 'getObject';
        var filename = $scope.images[photoNum].filename;
        var filetype = $scope.images[photoNum].filetype;
        var folder = $scope.images[photoNum].year;
        $http({
            method: 'GET',
            url: `/photos/s3ops/sign-s3-getimage?file_name=${filename}&file_type=${filetype}&folder=${folder}&operation=${operation}`,
            headers: {
                'x-auth': localStorage.userToken
            }
        }).then(function(response) {
            // console.log("Signed request: "+response.data.signedRequest);
            $scope.mainImage = response.data.signedRequest;
            $scope.images[photoNum].signedRequest = response.data.signedRequest;
            // console.log(`mainImage: ${$scope.mainImage}`);
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

    function imageFormatting() {

        var imageFormats = [
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

        if ($scope.images[currentPhoto].orientation == 0) {
            var imgWidth = document.getElementById("photo-img").naturalWidth;
            var imgHeight = document.getElementById("photo-img").naturalHeight;
        } else if ($scope.images[currentPhoto].orientation == 1 || $scope.images[currentPhoto].orientation == -1) {
            var imgWidth = document.getElementById("photo-img-ver").naturalWidth;
            var imgHeight = document.getElementById("photo-img-ver").naturalHeight;
        } else {

        };
        var whr = imgWidth/imgHeight;
        // console.log(`Width: ${imgWidth}, Height: ${imgHeight}, Relation: ${whr}`);
        $scope.imgWidth = imgWidth; $scope.imgHeight = imgHeight;

        var imageFormatIndex = 0;
        for (var f=0; f<imageFormats.length; f++) {
            // console.log(`f: ${f}, imageFormat: ${imageFormats[f].whRelation}`);
            if (whr > imageFormats[f].whRelation) {imageFormatIndex = f};
        };

        // console.log(`In imageFormatting. ${$scope.images[currentPhoto].num}: ${$scope.images[currentPhoto].filename}, orientation: ${$scope.images[currentPhoto].orientation}`);
        if ($scope.images[currentPhoto].orientation == 0) {
            console.log(`Class to be selected for horizontal img, DIV: ${classMapDivHor[imageFormatIndex][$scope.screenSizeIndex]}, IMG: ${classMapImgHor[imageFormatIndex][$scope.screenSizeIndex]}`);
            angular.element(document.querySelector('#photo-div') ).addClass(classMapDivHor[imageFormatIndex][$scope.screenSizeIndex]);
            angular.element(document.querySelector('#photo-img') ).addClass(classMapImgHor[imageFormatIndex][$scope.screenSizeIndex]);
        } else if ($scope.images[currentPhoto].orientation == 1 || $scope.images[currentPhoto].orientation == -1) {
            console.log(`Class to be selected for vertical img, DIV: ${classMapDivVer[0][$scope.screenSizeIndex]}, IMG: ${classMapImgVer[0][$scope.screenSizeIndex]}`);
            angular.element(document.querySelector('#photo-div-ver') ).addClass(classMapDivVer[0][$scope.screenSizeIndex]);
            angular.element(document.querySelector('#photo-img-ver') ).addClass(classMapImgVer[0][$scope.screenSizeIndex]);
        } else {
            
        };
    };

    $scope.rotateImage = function(image, direction) {
        var newOrientation = 0;
        var rotation = false;
        var rotAction = 'med uret'
        if (direction == -1) {
            if (image.orientation > 0) {
                newOrientation = image.orientation + direction;
                rotation = true;
                rotAction = 'mod uret';
                // console.log(`Rotate counter clockwise`);
            } else {
                $window.alert('Handlingen er pt ikke understøttet.');
            };
        } else {
            if (image.orientation < 1) {
                newOrientation = image.orientation + direction;
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
                    url: '/photos/orientation/'+image._id,
                    headers: {
                        'x-auth': localStorage.userToken
                    },
                    data: {orientation: newOrientation}
                }).then(function(response) {
                    // console.log(`Status: ${response.status}`);
                    // $location.path('/photoalbum/' + $scope.year);
                    // $route.reload();
                    $scope.mainImageObj.orientation = newOrientation;
                    imageFormatting();
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

    $scope.imagescope = $routeParams.imagescope;
    $scope.photosurl = '/photos/count/';

    $http({
        method: 'GET',
        url: 'tenants/mytenant',
        headers: {
            'x-auth': localStorage.userToken
        }
    }).then(function(tenant){
        console.log(`Tenant fetched. Status: ${tenant.status}. Tenant name: ${tenant.data.tenantName}`);
        $scope.tenantName = tenant.data.tenantName;
        $scope.tenant = tenant.data;

        var currentyear = (new Date()).getFullYear();
        var firstyear = $scope.tenant.startYear;
        $scope.years = [];
        $scope.total = 0;
        if ($routeParams.imagescope == "global") {
            $scope.mypictures = false;
            photosurl = '/photos/count/';
            $scope.headline = "Billedoversigt";
        } else {
            $scope.mypictures = true;
            photosurl = '/photos/my/count/';
            $scope.headline = "Min billedoversigt";
        };
        $scope.photosurl = photosurl;
        // console.log(`My pictures?: ${$scope.mypictures}`);
    
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
                // console.log(`Year: ${y.toString()}, Count: ${response.data.count}`);
                $scope.total += response.data.count;
            }, function errorCallback(response) {
                console.log(`Status: ${response.status}`);
            });
        };
    
    }, function errorCallback(response) {
        console.log(`Status: ${response.status}`);
    });

    $http({
        method: 'GET',
        url: $scope.photosurl+'historiske',
        headers: {
            'x-auth': localStorage.userToken
        }
    }).then(function(response) {
        // console.log(`Status: ${response.status}`);
        $scope.years.push(response.data);
        // console.log(`Year: Historiske, Count: ${response.data.count}`);
        $scope.total += response.data.count;
        $scope.historiccount = response.data.count;
        angular.element(document.querySelector( '#photoalbum' ) ).addClass('active');
        if ($scope.mypictures) {
            angular.element(document.querySelector( '#myphotooverview' ) ).addClass('active');
        } else {
            angular.element(document.querySelector( '#globalphotooverview' ) ).addClass('active');
        };
    }, function errorCallback(response) {
        console.log(`Status: ${response.status}`);
    });

}])


    /* 
    $scope.uploadPicture2 = function(file) {
        console.log(`uploadPicture. filename: ${file.name}, filetype: ${file.type}`);
        var folder = $scope.year;
        var operation = 'putObject';

        $http({
            method: 'GET',
            url: `/s3ops/sign-s3?file_name=${file.name}&file_type=${file.type}&folder=${folder}&operation=${operation}`,
            headers: {
                'x-auth': localStorage.userToken
            }
        }).then(function(response) {
            console.log(response);
            console.log(response.data.url);

            $scope.errorMsg = '';
            $scope.successMsg = '';
            file.upload = Upload.upload({
                method: 'PUT',
                url: response.data.signedRequest,
                data: {
                    file: file
                },
                headers: {
                    'Content-Type': file.type
                }
            });
    
            file.upload.then(function (response) {
                $timeout(function () {
                    file.result = response.data;
                    console.log(response.data);
                    console.log(response.status);
                    $scope.picFile = null;
                    $scope.successMsg = response.data.filename + 'blev uploaded.'
                });
                }, function (response) {
                    if (response.status > 0) {
                        if (response.status == 409) {
                            $scope.errorMsg = response.status + ': Et billede med det filnavn er allerede uploaded.';
                        } else {
                            $scope.errorMsg = response.status + ': Der opstod en fejl.';
                        };
                    };
                }, function (evt) {
                // Math.min is to fix IE which reports 200% sometimes
                file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
            }, function errorCallback(response) {
                console.log(`Status: ${response.status}`);
            });
    
        }, function errorCallback(response) {
            console.log(`Status: ${response.status}`);
        });
    };

    $scope.uploadPic = function(file) {
        $scope.errorMsg = '';
        $scope.successMsg = '';
        var picturetext = 'Familielejr '+$scope.year;
        if ($scope.picturetext) {picturetext = $scope.picturetext;};
        file.upload = Upload.upload({
            url: '/photos/upload',
            data: {
                year: $scope.year,
                user: localStorage.familielejrUserId,
                text: picturetext,
                file: file
            },
            headers: {
                'x-auth': localStorage.userToken
            }
        });

        file.upload.then(function (response) {
            $timeout(function () {
                file.result = response.data;
                console.log(response.data);
                console.log(response.status);
                $scope.picFile = null;
                $scope.successMsg = response.data.filename + 'blev uploaded.'
                $scope.picturetext = "";
            });
            }, function (response) {
                if (response.status > 0) {
                    if (response.status == 409) {
                        $scope.errorMsg = response.status + ': Et billede med det filnavn er allerede uploaded.';
                    } else {
                        $scope.errorMsg = response.status + ': Der opstod en fejl.';
                    };
                };
            }, function (evt) {
            // Math.min is to fix IE which reports 200% sometimes
            file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
        }, function errorCallback(response) {
            console.log(`Status: ${response.status}`);
        });
    };

 */