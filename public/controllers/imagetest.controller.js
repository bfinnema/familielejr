angular.module('familielejr')

.controller('imagetestCtrl', ['$scope', '$http', '$location', 'AuthService', 
function($scope, $http, $location, AuthService) {
    
    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
            $scope.role = AuthService.userRole();
        };
    });

    $scope.userClientFullDesc = navigator.userAgent;
    $scope.innerWidth = window.innerWidth;
    $scope.innerHeight = window.innerHeight;
    $scope.userClient = "BROWSER";
    $scope.screenSizeIndex = screenSizing();
    imageFormatting();
    console.log(`Image Size selected: ${$scope.screenSizeIndex}`);
    detectClient();
    $scope.imagesExist = true;
/* 
    var img1 = new Image();
    img1.src = "images/2010-08-28 10.47.54.jpg";
    $scope.img1 = img1;
    console.log(`Image 1 width: ${img1.width}. Height: ${img1.height}`);
 */

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
            console.log(`screenSizing, innerHeight: ${window.innerHeight}, ${screenSizes[s].screenHeight}`);
            if (window.innerHeight > screenSizes[s].screenHeight) {
                screenSizeIndex = s;
                console.log(`Bigger!`);
            };
        };
        console.log(`screenSizeIndex: ${screenSizeIndex}`);
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

        var imgWidth1 = document.getElementById("img-horizontal1").naturalWidth;
        var imgHeight1 = document.getElementById("img-horizontal1").naturalHeight;
        var whr1 = imgWidth1/imgHeight1;
        var imgWidth2 = document.getElementById("img-vertical1").naturalWidth;
        var imgHeight2 = document.getElementById("img-vertical1").naturalHeight;
        var whr2 = imgWidth2/imgHeight2;
        var imgWidth3 = document.getElementById("img-horizontal2").naturalWidth;
        var imgHeight3 = document.getElementById("img-horizontal3").naturalHeight;
        var whr3 = imgWidth3/imgHeight3;
        var imgWidth4 = document.getElementById("img-horizontal3").naturalWidth;
        var imgHeight4 = document.getElementById("img-horizontal3").naturalHeight;
        var whr4 = imgWidth4/imgHeight4;
        console.log(`Width: ${imgWidth1}, Height: ${imgHeight1}, Relation: ${whr1}`);
        console.log(`Width: ${imgWidth2}, Height: ${imgHeight2}, Relation: ${whr2}`);
        console.log(`Width: ${imgWidth3}, Height: ${imgHeight3}, Relation: ${whr3}`);
        console.log(`Width: ${imgWidth4}, Height: ${imgHeight4}, Relation: ${whr4}`);

        var imageFormatIndex = 0;
        var imageFormatIndex1 = 0;
        var imageFormatIndex2 = 0;
        var imageFormatIndex3 = 0;
        var imageFormatIndex4 = 0;
        for (var f=0; f<imageFormats.length; f++) {
            console.log(`f: ${f}, imageFormat: ${imageFormats[f].whRelation}`);
            if (whr1 > imageFormats[f].whRelation) {imageFormatIndex1 = f};
            if (whr2 > imageFormats[f].whRelation) {imageFormatIndex2 = f};
            if (whr3 > imageFormats[f].whRelation) {imageFormatIndex3 = f};
            if (whr4 > imageFormats[f].whRelation) {imageFormatIndex4 = f};
        };
        console.log(`Indexes found: ${imageFormatIndex1}, ${imageFormatIndex2}, ${imageFormatIndex3}, ${imageFormatIndex4} screenSizeIndex: ${$scope.screenSizeIndex}`);
        console.log(`Class to be selected for img1, DIV: ${classMapDivHor[imageFormatIndex1][$scope.screenSizeIndex]}, IMG: ${classMapImgHor[imageFormatIndex1][$scope.screenSizeIndex]}, test: ${classMapDivHor[0][2]}, ${classMapImgHor[0][2]}`);
        console.log(`Class to be selected for img2, DIV: ${classMapDivVer[0][$scope.screenSizeIndex]}, IMG: ${classMapImgVer[0][$scope.screenSizeIndex]}`);
        console.log(`Class to be selected for img3, DIV: ${classMapDivHor[imageFormatIndex3][$scope.screenSizeIndex]}, IMG: ${classMapImgHor[imageFormatIndex3][$scope.screenSizeIndex]}`);
        console.log(`Class to be selected for img4, DIV: ${classMapDivHor[imageFormatIndex4][$scope.screenSizeIndex]}, IMG: ${classMapImgHor[imageFormatIndex4][$scope.screenSizeIndex]}`);
        angular.element(document.querySelector('#photo-horizontal') ).addClass(classMapDivHor[imageFormatIndex1][$scope.screenSizeIndex]);
        angular.element(document.querySelector('#img-horizontal1') ).addClass(classMapImgHor[imageFormatIndex1][$scope.screenSizeIndex]);
        angular.element(document.querySelector('#photo-vertical') ).addClass(classMapDivVer[0][$scope.screenSizeIndex]);
        angular.element(document.querySelector('#img-vertical1') ).addClass(classMapImgVer[0][$scope.screenSizeIndex]);
        angular.element(document.querySelector('#photo-horizontal2') ).addClass(classMapDivHor[imageFormatIndex3][$scope.screenSizeIndex]);
        angular.element(document.querySelector('#img-horizontal2') ).addClass(classMapImgHor[imageFormatIndex3][$scope.screenSizeIndex]);
        angular.element(document.querySelector('#photo-horizontal3') ).addClass(classMapDivHor[imageFormatIndex4][$scope.screenSizeIndex]);
        angular.element(document.querySelector('#img-horizontal3') ).addClass(classMapImgHor[imageFormatIndex4][$scope.screenSizeIndex]);
    };
    
    function detectClient() {
        $scope.userClientFullDesc = navigator.userAgent;
        console.log(navigator.userAgent);
        if (navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/iPhone/i)) {
            $scope.userClient = "MOBILE";
        } else if (navigator.userAgent.match(/iPad/i)) {
            $scope.userClient = "IPAD";
        } else {
            $scope.userClient = "BROWSER";
        };
    };
}]);
