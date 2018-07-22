angular.module('familielejr')

.controller('expenselistCtrl', ['$scope', '$http', '$location', '$route', '$window', 'AuthService', 
function($scope, $http, $location, $route, $window, AuthService) {

    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
            $scope.role = AuthService.userRole();
        };
    });

    var currentyear = (new Date()).getFullYear();
    var now = new Date();
    var demarc = new Date(currentyear,10,1);
    var lastDateOfYear = new Date(currentyear,11,31);
    var fiscalyear = currentyear;
    var pastyear = currentyear - 1;
    if (now > demarc && lastDateOfYear >= now) {
        fiscalyear += 1;
        pastyear += 1;
    };
    console.log(`Invyear: ${fiscalyear}`);

    setTimeout(function(){
        angular.element(document.querySelector( '#organizer' ) ).addClass('active');
        angular.element(document.querySelector( '#expenselist' ) ).addClass('active');
    }, 1000);

    $scope.expensetypes = [
        {"expensetype": "Lejren"},
        {"expensetype": "Mad"},
        {"expensetype": "Drikkevarer"},
        {"expensetype": "Underholdning"},
        {"expensetype": "Andet"}
    ];

    $http({
        method: 'GET',
        url: '/expenses',
        headers: {
            'x-auth': localStorage.userToken
        }
    }).then(function(response) {
        // console.log(`Success. Status: ${response.status}`);
        $scope.expenses = response.data;
        // console.log($scope.expenses[0]);
    }, function errorCallback(response) {
        console.log(`Error. Status: ${response.status}`);
    });

    $scope.newExpense = false;
    $scope.editExpense = false;

    $scope.newExpenseToggle = function() {
        if ($scope.newExpense) {
            $scope.newExpense = false;
        } else {
            $scope.newExpense = true;
        };
    };

    $scope.addExpense = function() {
        var expense = {
            year: fiscalyear,
            expensetype: $scope.expensetype,
            description: $scope.description,
            vendor: $scope.vendor,
            expensedate: $scope.expensedate,
            expenseprice: $scope.expenseprice
        };

        $http({
            method: 'POST',
            url: 'expenses',
            headers: {
                'x-auth': localStorage.userToken
            },
            data: expense
        }).then(function(response) {
            console.log(`Status: ${response.status}`);
            console.log(response.data._id);
            $location.path('/expenselist');
            $route.reload();
        }, function errorCallback(response) {
            console.log(`Status: ${response.status}`);
        });
    };

    $scope.editExpenseToggle = function(expense) {
        if ($scope.editExpense) {
            $scope.editExpense = false;
        } else {
            $scope.editExpense = true;
        };
        $scope.editExpensetype = expense.expensetype;
        $scope.editDescription = expense.description;
        $scope.editVendor = expense.vendor;
        $scope.editExpensedate = new Date(expense.expensedate);
        $scope.editExpenseprice = expense.expenseprice;
        $scope.editID = expense._id;
    };

    $scope.expenseEdit = function() {
        var data = {
            year: editFiscalyear,
            expensetype: $scope.editExpensetype,
            description: $scope.editDescription,
            vendor: $scope.editVendor,
            expensedate: $scope.editExpensedate,
            expenseprice: $scope.editExpenseprice
        };

        $http({
            method: 'PATCH',
            url: '/expenses/'+$scope.editID,
            headers: {
                'x-auth': localStorage.userToken
            },
            data: data
        }).then(function(response) {
            $location.path('/expenselist');
            $route.reload();
        }, function errorCallback(response) {
            console.log(`editUserStatus: ${response.status}`);
        });

    };

    $scope.removeExpense = function(expense) {
        if ($window.confirm('Bekræft venligst at du vil slette udgiften '+expense.description)) {
            $http({
                method: 'DELETE',
                url: 'expenses/'+expense._id,
                headers: {
                    'x-auth': localStorage.userToken
                }
            }).then(function(response) {
                // console.log(`Status: ${response.status}`);
                // console.log(response.data);
                $location.path('/expenselist');
                $route.reload();
            }, function errorCallback(response) {
                console.log(`Status: ${response.status}`);
            });
        };
    };

}]);
