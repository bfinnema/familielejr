angular.module('familielejr')

.controller('photouploadCtrl', ['$scope', 'Upload', '$timeout', 'AuthService', function ($scope, Upload, $timeout, AuthService) {

    var currentyear = (new Date()).getFullYear();
    var firstyear = 1993
    $scope.years = [];

    for (y=firstyear; y<=currentyear; y++) {
        $scope.years.push({"year": y.toString()});
    };
    
    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
            $scope.role = AuthService.userRole();
        };
    });

    $scope.errorMsg = '';
    $scope.successMsg = '';

    $scope.uploadPic = function(file) {
        $scope.errorMsg = '';
        $scope.successMsg = '';
        file.upload = Upload.upload({
            url: '/photos/upload',
            data: {
                year: $scope.year,
                user: localStorage.familielejrUserId,
                text: $scope.picturetext,
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
}])

.controller('photoalbumCtrl', ['$scope', '$http', '$routeParams', '$route', '$location', 'AuthService', function($scope, $http, $routeParams, $route, $location, AuthService) {

    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
            $scope.role = AuthService.userRole();
        };
    });

    var photosId = 1;
    var currentPhoto = 0;
    $scope.year = $routeParams.year;
    //console.log(`Photos from year ${$scope.year}`)

    $http({
        method: 'GET',
        url: '/photos/'+$routeParams.year,
        headers: {
            'x-auth': localStorage.userToken
        }
    }).then(function(response) {
        console.log(`Status: ${response.status}`);
        $scope.images = response.data;
        if (!response.data[0]) {
            // console.log('No photos for year '+$scope.year)
            $scope.imagesExist = false;
        } else {
            $scope.imagesExist = true;
            $scope.mainImage = $scope.images[0].path + $scope.images[0].filename;
            $scope.mainImageObj = $scope.images[0];
            // console.log(`mainImage: ${$scope.mainImage}`);
            // console.log($scope.images[1].imagetext[0].textobj.text);
            for (x=0; x<$scope.images.length; x++) {
                $scope.images[x].num = x;
                // console.log(`${$scope.images[x].num}: ${$scope.images[x].filename}`);
            };
        }
    }, function errorCallback(response) {
        console.log(`Status: ${response.status}`);
    });

	$scope.setImage = function(image){
		$scope.mainImage = image.path + image.filename;
        currentPhoto = image.num;
        $scope.mainImageObj = $scope.images[currentPhoto];
        // console.log(`Current Photo: ${image.num}, ${image.filename}`);
	};

    $scope.nextImage = function() {
        if (currentPhoto < $scope.images.length-1) {
            currentPhoto = currentPhoto + 1;
        }
        else {currentPhoto = 0};
        $scope.mainImage = $scope.images[currentPhoto].path + $scope.images[currentPhoto].filename;
        $scope.mainImageObj = $scope.images[currentPhoto];
        // console.log(`Current Photo: ${$scope.mainImageObj.num}, ${$scope.mainImageObj.filename}`);
    };

    $scope.prevImage = function() {
        if (currentPhoto < 1) {
            currentPhoto = $scope.images.length-1;
        }
        else {currentPhoto = currentPhoto - 1};
        $scope.mainImage = $scope.images[currentPhoto].path + $scope.images[currentPhoto].filename;
        $scope.mainImageObj = $scope.images[currentPhoto];
        // console.log(`Current Photo: ${$scope.mainImageObj.num}, ${$scope.mainImageObj.filename}`);
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
            $location.path('/photoalbum/' + $scope.year);
            $route.reload();
        }, function errorCallback(response) {
            console.log(`Status: ${response.status}`);
        });
    };

}])

.controller('myphotoalbumCtrl', ['$scope', '$http', '$routeParams', '$window', '$location', '$route', 'AuthService', function($scope, $http, $routeParams, $window, $location, $route, AuthService) {

    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
            $scope.role = AuthService.userRole();
        };
    });
    // console.log('My Photo Album Controller.');

    var photosId = 1;
    var currentPhoto = 0;

    $http({
        method: 'GET',
        url: '/myphotos',
        headers: {
            'x-auth': localStorage.userToken
        }
    }).then(function(response) {
        // console.log(`Status: ${response.status}`);
        $scope.images = response.data;
        if (!response.data[0]) {
            // console.log('No photos for year '+$scope.year)
            $scope.imagesExist = false;
        } else {
            $scope.imagesExist = true;
            $scope.mainImage = $scope.images[0].path + $scope.images[0].filename;
            $scope.mainImageObj = $scope.images[0];
            // console.log(`mainImage: ${$scope.mainImage}`);
            for (x=0; x<$scope.images.length; x++) {
                $scope.images[x].num = x;
                // console.log(`${$scope.images[x].num}: ${$scope.images[x].filename}`);
            };
        }
    }, function errorCallback(response) {
        console.log(`Status: ${response.status}`);
    });

	$scope.setImage = function(image){
		$scope.mainImage = image.path + image.filename;
        currentPhoto = image.num;
        $scope.mainImageObj = $scope.images[currentPhoto];
        // console.log(`Current Photo: ${image.num}, ${image.filename}`);
	};

    $scope.nextImage = function() {
        if (currentPhoto < $scope.images.length-1) {
            currentPhoto = currentPhoto + 1;
        }
        else {currentPhoto = 0};
        $scope.mainImage = $scope.images[currentPhoto].path + $scope.images[currentPhoto].filename;
        $scope.mainImageObj = $scope.images[currentPhoto];
        // console.log(`Current Photo: ${$scope.mainImageObj.num}, ${$scope.mainImageObj.filename}`);
    };

    $scope.prevImage = function() {
        if (currentPhoto < 1) {
            currentPhoto = $scope.images.length-1;
        }
        else {currentPhoto = currentPhoto - 1};
        $scope.mainImage = $scope.images[currentPhoto].path + $scope.images[currentPhoto].filename;
        $scope.mainImageObj = $scope.images[currentPhoto];
        // console.log(`Current Photo: ${$scope.mainImageObj.num}, ${$scope.mainImageObj.filename}`);
    };

    $scope.removeImage = function(image) {
        if ($window.confirm('Bekræft venligst at du vil slette billedet '+image.filename)) {
            $http({
                method: 'DELETE',
                url: '/photos/'+image._id,
                headers: {
                    'x-auth': localStorage.userToken
                }
            }).then(function(response) {
                // console.log(`Status: ${response.status}`);
                // console.log(response.data._id);
                $location.path('/myphotoalbum');
                $route.reload();
            }, function errorCallback(response) {
                console.log(`Status: ${response.status}`);
            });
        }
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
            $location.path('/photoalbum/' + $scope.year);
            $route.reload();
        }, function errorCallback(response) {
            console.log(`Status: ${response.status}`);
        });
    };

}])