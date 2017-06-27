angular.module('familielejr')

.controller('photouploadCtrl', ['$scope', 'Upload', '$timeout', 'AuthService', function ($scope, Upload, $timeout, AuthService) {

    $scope.years = [
        {"year": "1993"},
        {"year": "1994"},
        {"year": "1995"},
        {"year": "1996"},
        {"year": "1997"},
        {"year": "1998"},
        {"year": "1999"},
        {"year": "2000"},
        {"year": "2001"},
        {"year": "2002"},
        {"year": "2003"},
        {"year": "2004"},
        {"year": "2005"},
        {"year": "2006"},
        {"year": "2007"},
        {"year": "2008"},
        {"year": "2009"},
        {"year": "2010"},
        {"year": "2011"},
        {"year": "2012"},
        {"year": "2013"},
        {"year": "2014"},
        {"year": "2015"},
        {"year": "2016"},
        {"year": "2017"}
    ];
    
    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
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

.controller('photoalbumCtrl', ['$scope', '$http', '$routeParams', 'AuthService', function($scope, $http, $routeParams, AuthService) {

    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
        };
    });

    var photosId = 1;
    var currentPhoto = 0;
    $scope.year = $routeParams.year;
    console.log(`Photos from year ${$scope.year}`)

    $http({
        method: 'GET',
        url: 'photos/'+$routeParams.year,
        headers: {
            'x-auth': localStorage.userToken
        }
    }).then(function(response) {
        console.log(`Status: ${response.status}`);
        console.log(response.data);
        $scope.images = response.data;
        $scope.mainImage = $scope.images[0].path + $scope.images[0].filename;
        $scope.uploadedBy = $scope.images[0].uploader;
        console.log(`mainImage: ${$scope.mainImage}`);
    }, function errorCallback(response) {
        console.log(`Status: ${response.status}`);
    });

	$scope.setImage = function(image){
		$scope.mainImage = image.path + image.filename;
	};

    $scope.nextImage = function() {
        if (currentPhoto < $scope.images.length-1) {
            currentPhoto = currentPhoto + 1;
        }
        else {currentPhoto = 0};
        $scope.mainImage = $scope.images[currentPhoto].path + $scope.images[currentPhoto].filename;
        $scope.uploadedBy = $scope.images[currentPhoto].uploader;
    };

    $scope.prevImage = function() {
        if (currentPhoto < 1) {
            currentPhoto = $scope.images.length-1;
        }
        else {currentPhoto = currentPhoto - 1};
        $scope.mainImage = $scope.images[currentPhoto].path + $scope.images[currentPhoto].filename;
        $scope.uploadedBy = $scope.images[currentPhoto].uploader;
    }
}])