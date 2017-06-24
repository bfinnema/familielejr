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

    $scope.uploadPic = function(file) {
        file.upload = Upload.upload({
            url: '/upload/photo',
            data: {
                year: $scope.year,
                user: localStorage.familielejrUserId,
                file: file
            }
        });

        file.upload.then(function (response) {
            $timeout(function () {
                file.result = response.data;
                console.log(response.data);
                console.log(response.status);
                $scope.picFile = null;
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
}]);