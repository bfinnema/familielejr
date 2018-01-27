angular.module('familielejr')

.controller('galleriaCtrl', ['$scope', '$http', '$routeParams', '$window', '$route', '$location', 'AuthService', function($scope, $http, $routeParams, $window, $route, $location, AuthService) {

    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
            $scope.role = AuthService.userRole();
        };
    });

    var currentPhoto = 0;
    $scope.year = $routeParams.year;
    //console.log(`Photos from year ${$scope.year}`)
    $scope.imagesExist = true;

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
            // console.log('No photos for year '+$scope.year)
            $scope.imagesExist = false;
        } else {
            $scope.imagesExist = true;
            // $scope.mainImage = $scope.images[0].path + $scope.images[0].filename;  // Old method
            $scope.mainImageObj = $scope.images[0];
            $scope.orientation = $scope.mainImageObj.orientation;
            getImage(0);
            
            for (x=0; x<$scope.images.length; x++) {
                $scope.images[x].num = x;
                // console.log(`${$scope.images[x].num}: ${$scope.images[x].filename}`);
            };
        };
    }, function errorCallback(response) {
        console.log(`Status: ${response.status}`);
    });

	$scope.setImage = function(image){
		// $scope.mainImage = image.path + image.filename;  // Old method
        currentPhoto = image.num;
        $scope.mainImage = $scope.images[currentPhoto].signedRequest;
        $scope.mainImageObj = $scope.images[currentPhoto];
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
        // console.log(`Current Photo: ${$scope.mainImageObj.num}, ${$scope.mainImageObj.filename}`);
    };

    $scope.removeImage = function(image) {
        if ($window.confirm('Bekræft venligst at du vil slette billedet '+image.filename) && $scope.role == 0) {

            $http({
                method: 'GET',
                url: `/photos/sign-s3-deleteimage?file_name=${image.filename}&file_type=${image.filetype}&folder=${image.year}&operation=${'deleteObject'}`
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
            $location.path('/photoalbum/' + $scope.year);
            $route.reload();
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
            url: `/photos/sign-s3-getimage?file_name=${filename}&file_type=${filetype}&folder=${folder}&operation=${operation}`
        }).then(function(response) {
            // console.log("Signed request: "+response.data.signedRequest);
            $scope.mainImage = response.data.signedRequest;
            $scope.images[photoNum].signedRequest = response.data.signedRequest;
            // console.log(`mainImage: ${$scope.mainImage}`);
        }, function errorCallback(response) {
            console.log(`Status: ${response.status}`);
        });
    };
}])

.controller('photooverview2Ctrl', ['$scope', '$http', '$routeParams', 'AuthService', function($scope, $http, $routeParams, AuthService) {

    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
            $scope.role = AuthService.userRole();
        };
    });

    $scope.imagescope = $routeParams.imagescope;
    var currentyear = (new Date()).getFullYear();
    var firstyear = 1993
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
    console.log(`My pictures?: ${$scope.mypictures}`);

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
            // console.log(response.data);
            $scope.years.push(response.data);
            // console.log(`Year: ${y.toString()}, Count: ${response.data}`);
            $scope.total += response.data.count;
        }, function errorCallback(response) {
            console.log(`Status: ${response.status}`);
        });
    };
    
}])

