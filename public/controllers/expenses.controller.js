angular.module('familielejr')

.controller('expensesCtrl', ['$scope', '$http', '$location', '$route', '$window', 'AuthService', 'YearService', 
function($scope, $http, $location, $route, $window, AuthService, YearService) {

    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
            $scope.role = AuthService.userRole();
        };
    });

    var fy = YearService.myYear("accounting");
    $scope.fy = fy;
    // console.log(`Expenses Ctrl. Fiscalyear new: ${fy}`);

    setTimeout(function(){
        angular.element(document.querySelector( '#organizer' ) ).addClass('active');
        angular.element(document.querySelector( '#expenselist' ) ).addClass('active');
    }, 1000);

    $scope.expensetypes = [
        {"expensetype": "Lejren"},
        {"expensetype": "Mad"},
        {"expensetype": "Drikkevarer"},
        {"expensetype": "Underholdning"},
        {"expensetype": "Hjemmeside"},
        {"expensetype": "Andet"}
    ];

    $http({
        method: 'GET',
        url: '/expenses/year/'+fy,
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
            year: fy,
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
            // console.log(`Status: ${response.status}`);
            // console.log(response.data._id);
            $location.path('/expenses');
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
        $scope.editFy = expense.fy;
        $scope.editExpensetype = expense.expensetype;
        $scope.editDescription = expense.description;
        $scope.editVendor = expense.vendor;
        $scope.editExpensedate = new Date(expense.expensedate);
        $scope.editExpenseprice = expense.expenseprice;
        $scope.editID = expense._id;
    };

    $scope.expenseEdit = function() {
        var data = {
            year: $scope.editFy,
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
            $location.path('/expenses');
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
                $location.path('/expenses');
                $route.reload();
            }, function errorCallback(response) {
                console.log(`Status: ${response.status}`);
            });
        };
    };

}]);
