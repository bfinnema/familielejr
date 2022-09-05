angular.module('familielejr')

.controller('groceriesCtrl', ['$scope', '$http', '$location', '$route', '$window', 'AuthService', 'YearService', 
function($scope, $http, $location, $route, $window, AuthService, YearService) {

    // console.log("In the groceries controller")
    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
            $scope.role = AuthService.userRole();
        };
    });

    var fy = YearService.myYear("accounting");
    $scope.fy = fy;
    // console.log(`Groceries Ctrl. Fiscalyear new: ${fy}`);

    setTimeout(function(){
        angular.element(document.querySelector( '#organizer' ) ).addClass('active');
        angular.element(document.querySelector( '#groceries' ) ).addClass('active');
    }, 1000);

    $scope.newGrocery = false;
    $scope.editGrocery = false;
    $scope.editLog = false;
    $scope.groceryYearOne = 2022;
    $scope.groceryYearFinal = 2031;

    var years = [];
    for (var y=$scope.groceryYearOne; y<=fy; y++) {
        years.push({"year": y});
    };
    // console.log(`The years, length: ${years.length}`)
    $scope.years = years;

    var yearsAll =[];
    for (var y=$scope.groceryYearOne; y<=$scope.groceryYearFinal; y++) {
        yearsAll.push({"year": y});
    };
    // console.log(`yearsAll, length: ${yearsAll.length}`)
    $scope.yearsAll = yearsAll;

    $http({
        method: 'GET',
        url: '/groceries',
        headers: {
            'x-auth': localStorage.userToken
        }
    }).then(function(response) {
        // console.log(`Success. Status: ${response.status}`);
        $scope.groceries = response.data;
        // console.log($scope.groceries[0]);
    }, function errorCallback(response) {
        console.log(`Error. Status: ${response.status}`);
    });

    $scope.newGroceryToggle = function() {
        if ($scope.newGrocery) {
            $scope.newGrocery = false;
        } else {
            $scope.newGrocery = true;
        };
    };

    $scope.addGrocery = function() {
        var logging = [];
        for (i=0; i<yearsAll.length; i++) {
            if (yearsAll[i].year == fy) {
                logging.push({"year":yearsAll[i].year, "quantityconsumed": $scope.quantityconsumed});
            } else {
                logging.push({"year":yearsAll[i].year, "quantityconsumed": 0});
            }
            // console.log(yearsAll[i].year);
        };

        var grocery = {
            groceryname: $scope.groceryname,
            grocerytype: "none",
            measure: $scope.measure,
            logging: logging
        };

        $http({
            method: 'POST',
            url: 'groceries',
            headers: {
                'x-auth': localStorage.userToken
            },
            data: grocery
        }).then(function(response) {
            // console.log(`Status: ${response.status}`);
            // console.log(response.data._id);
            $location.path('/groceries');
            $route.reload();
        }, function errorCallback(response) {
            console.log(`Status: ${response.status}`);
        });
    };

    $scope.editLogToggle = function(grocery, year) {
        if ($scope.editLog) {
            $scope.editLog = false;
        } else {
            $scope.editLog = true;
            $scope.editGroceryname = grocery.groceryname;
            $scope.editMeasure = grocery.measure;
            $scope.editLogging = grocery.logging;
            for (i=0; i<grocery.logging.length; i++) {
                if (grocery.logging[i].year == year) {
                    $scope.editQuantityconsumed = grocery.logging[i].quantityconsumed;
                    // console.log(`THAT Year: ${grocery.logging[i].year}`)
                } else {
                    // console.log(`Not that Year: ${grocery.logging[i].year}`)
                };
            };
            $scope.editQuantityconsumed = $scope.editLogging.quantityconsumed;
            $scope.editYear = year;
            $scope.editID = grocery._id;
        };
    };

    $scope.loggingAdd = function() {
        for (i=0; i<$scope.editLogging.length; i++) {
            if ($scope.editLogging[i].year == $scope.editYear) {
                $scope.editLogging[i].quantityconsumed = $scope.editQuantityconsumed;
                // console.log(`Found year ${$scope.editLogging[i].year}. Consumed: ${$scope.editLogging[i].quantityconsumed}`);
            };
        };
        
        var data = {
            logging: $scope.editLogging
        };

        $http({
            method: 'PATCH',
            url: '/groceries/logging/'+$scope.editID,
            headers: {
                'x-auth': localStorage.userToken
            },
            data: data
        }).then(function(response) {
            $location.path('/groceries');
            $route.reload();
        }, function errorCallback(response) {
            console.log(`editGroceryLoggingStatus: ${response.status}`);
        });

    };

    $scope.editGroceryToggle = function(grocery) {
        if ($scope.editGrocery) {
            $scope.editGrocery = false;
        } else {
            $scope.editGroceryname = grocery.groceryname;
            $scope.editGrocerytype = grocery.grocerytype;
            $scope.editMeasure = grocery.measure;
            $scope.editID = grocery._id;
            $scope.editGrocery = true;
        };
    };

    $scope.groceryEdit = function() {
        console.log(`Name: ${$scope.editGroceryname}, Measure: ${$scope.editMeasure}`)
        var data = {
            groceryname: $scope.editGroceryname,
            grocerytype: $scope.editGrocerytype,
            measure: $scope.editMeasure,
        };

        $http({
            method: 'PATCH',
            url: '/groceries/'+$scope.editID,
            headers: {
                'x-auth': localStorage.userToken
            },
            data: data
        }).then(function(response) {
            $location.path('/groceries');
            $route.reload();
        }, function errorCallback(response) {
            console.log(`editGroceriesStatus: ${response.status}`);
        });

    };

    $scope.removeGrocery = function(grocery) {
        if ($window.confirm('Bekræft venligst at du vil slette varen '+grocery.groceryname)) {
            $http({
                method: 'DELETE',
                url: 'groceries/'+grocery._id,
                headers: {
                    'x-auth': localStorage.userToken
                }
            }).then(function(response) {
                // console.log(`Status: ${response.status}`);
                // console.log(response.data);
                $location.path('/groceries');
                $route.reload();
            }, function errorCallback(response) {
                console.log(`Status: ${response.status}`);
            });
        };
    };

}]);
