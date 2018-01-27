angular.module('familielejr')

.controller('photouploadCtrl', ['$scope', '$http', '$route', '$window', '$timeout', 'AuthService', function ($scope, $http, $route, $window, $timeout, AuthService) {

    var currentyear = (new Date()).getFullYear();
    var firstyear = 1993
    $scope.years = [];

    for (var y=firstyear; y<=currentyear; y++) {
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
    $scope.showImagesList = false;
    $scope.imageReplica = true;

    $scope.uploadPicture = function(file) {
        // console.log(`uploadPicture. filename: ${file.name}, filetype: ${file.type}`);
        var folder = $scope.year;
        var operation = 'putObject';
        var picturetext = 'Familielejr '+$scope.year;
        if ($scope.picturetext) {picturetext = $scope.picturetext;};

        $http({
            method: 'GET',
            url: `/photos/sign-s3?file_name=${file.name}&file_type=${file.type}&folder=${folder}&operation=${operation}`
        }).then(function(response) {
            // console.log(response);
            // console.log(response.data.url);
            $scope.successMsg = 'VENT VENLIGST. Billedet '+file.name+' bliver uploaded.......'
            const xhr = new XMLHttpRequest();
            xhr.open('PUT', response.data.signedRequest);
            xhr.onreadystatechange = () => {
                if(xhr.readyState === 4){
                    if(xhr.status === 200){
                        // console.log("Success!");
                        $http({
                            method: 'POST',
                            url: '/photos/upload',
                            headers: {
                                'x-auth': localStorage.userToken
                            },
                            data: {
                                year: $scope.year,
                                filename: file.name,
                                filetype: file.type,
                                user: localStorage.familielejrUserId,
                                text: picturetext,
                                orientation: 0
                            }
                        }).then(function(response) {
                            // console.log(`Status: ${response.status}`);
                            // console.log(response.data._id);
                            $scope.picFile = null;
                            $scope.picturetext = "";
                            $scope.errorMsg = "";
                            $scope.successMsg = file.name + 'blev uploaded.'
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

        $http({
            method: 'GET',
            url: '/photos/my/'+$scope.year,
            headers: {
                'x-auth': localStorage.userToken
            }
        }).then(function(response) {
            console.log(`MyphotosStatus: ${response.status}`);
            $scope.images = response.data;
            if (!response.data[0]) {
                // console.log('No photos for year '+$scope.year)
                $scope.imagesExist = false;
            } else {
                $scope.imagesExist = true;
                // $scope.mainImage = $scope.images[0].path + $scope.images[0].filename;  // Old method

                for (x=0; x<$scope.images.length; x++) {
                    $scope.images[x].num = x;
                };

            };
            $scope.showImagesList = true;
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

    $scope.orientation = 0;
    var currentPhoto = 0;
    $scope.year = $routeParams.year;
    //console.log(`Photos from year ${$scope.year}`)

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
                console.log(`orientation: ${$scope.images[x].orientation}`);
                if (!$scope.images[x].orientation) {
                    $scope.images[x].orientation = 0;
                };
                console.log(`${$scope.images[x].num}: ${$scope.images[x].filename}, orientation: ${$scope.images[x].orientation}`);
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

.controller('myphotoalbumCtrl', ['$scope', '$http', '$routeParams', '$window', '$location', '$route', 'AuthService', function($scope, $http, $routeParams, $window, $location, $route, AuthService) {

    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
            $scope.role = AuthService.userRole();
        };
    });

    $scope.orientation = 0;
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
        url: photosurl,
        headers: {
            'x-auth': localStorage.userToken
        }
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
                console.log(`orientation: ${$scope.images[x].orientation}`);
                if (!$scope.images[x].orientation) {
                    $scope.images[x].orientation = 0;
                };
                console.log(`${$scope.images[x].num}: ${$scope.images[x].filename}, orientation: ${$scope.images[x].orientation}`);
            };
        };
    }, function errorCallback(response) {
        console.log(`Status: ${response.status}`);
    });

	$scope.setImage = function(image){
        currentPhoto = image.num;
        $scope.mainImage = $scope.images[currentPhoto].signedRequest;
        $scope.mainImageObj = $scope.images[currentPhoto];
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
    };

    $scope.removeImage = function(image) {
        if ($window.confirm('Bekræft venligst at du vil slette billedet '+image.filename)) {

            $http({
                method: 'GET',
                url: `/photos/sign-s3-deleteimage?file_name=${image.filename}&file_type=${image.filetype}&folder=${image.year}&operation=${'deleteObject'}`
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
                        $location.path('/myphotoalbum');
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

.controller('photooverviewCtrl', ['$scope', '$http', '$routeParams', 'AuthService', function($scope, $http, $routeParams, AuthService) {

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


    /* 
    $scope.uploadPicture2 = function(file) {
        console.log(`uploadPicture. filename: ${file.name}, filetype: ${file.type}`);
        var folder = $scope.year;
        var operation = 'putObject';

        $http({
            method: 'GET',
            url: `/sign-s3?file_name=${file.name}&file_type=${file.type}&folder=${folder}&operation=${operation}`
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