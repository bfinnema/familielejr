angular.module('familielejr')

.controller('accountingCtrl', ['$scope', '$http', '$location', '$route', '$window', '$routeParams', 'AuthService', 'YearService', 
function($scope, $http, $location, $route, $window, $routeParams, AuthService, YearService) {

    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
            $scope.role = AuthService.userRole();
        };
    });

    var year = $routeParams.year;
    // var currentYear = YearService.myYear("accounting");
    var currentYear = new Date().getFullYear();
    // console.log(`currentYear: ${currentYear}`);
    var fy = year;
    if (year < 1990) {
        fy = currentYear;
    };
    $scope.fy = fy;
    // console.log(`Fiscalyear: ${$scope.fy}`);
    var pastyear = fy-1;

    var fys = [];
    var firstyear = 2018;
    for (var y=currentYear+5; y>=firstyear; y--) {
        fys.push({"fy": y});
    };
    $scope.fys = fys;

    setTimeout(function(){
        angular.element(document.querySelector( '#organizer' ) ).addClass('active');
        angular.element(document.querySelector( '#accounting' ) ).addClass('active');
    }, 1000);

    $scope.newExpense = false;
    $scope.editAnExpense = false;
    $scope.newIncome = false;
    $scope.editAnIncome = false;
    $scope.editFy = false;

    $scope.expensetypes = [
        {"expensetype": "Lejren"},
        {"expensetype": "Mad"},
        {"expensetype": "Drikkevarer"},
        {"expensetype": "Underholdning"},
        {"expensetype": "Hjemmeside"},
        {"expensetype": "Andet"}
    ];

    $scope.incometypes = [
        {"incometype": "Lejren"},
        {"incometype": "Mad"},
        {"incometype": "Drikkevarer"},
        {"incometype": "Underholdning"},
        {"incometype": "Andet"}
    ];

    $http({
        method: 'GET',
        url: 'tenants/mytenant',
        headers: {
            'x-auth': localStorage.userToken
        }
    }).then(function(tenant) {
        // console.log(`Tenant fetched. Status: ${tenant.status}`);
        $scope.tenantName = tenant.data.tenantName;
        // $scope.tenant = tenant.data;
        return $http({
            method: 'GET',
            url: 'fiscalyears/year/' + fy,
            headers: {
                'x-auth': localStorage.userToken
            }
        });
    }).then(function(fiscalyear) {
        $scope.fiscalyear = fiscalyear.data;
        // console.log(`FY description: ${$scope.fiscalyear.description}`);
        return $http({
            method: 'GET',
            url: 'fiscalyears/year/' + pastyear,
            headers: {
                'x-auth': localStorage.userToken
            }
        });
    }).then(function(pastFY) {
        $scope.pastFY = pastFY.data;
        // console.log(`Past FY description: ${$scope.pastFY.description}`);
        return $http({
            method: 'GET',
            url: '/expenses/year/'+fy,
            headers: {
                'x-auth': localStorage.userToken
            }
        });
    }).then(function(expenses) {
        $scope.expenses = expenses.data;
        // console.log(`Expense description: ${$scope.expenses[0].description}`);
        return $http({
            method: 'GET',
            url: 'eventregs/all/year/' + fy,
            headers: {
                'x-auth': localStorage.userToken
            }
        });
    }).then(function(eventregs) {
        $scope.eventregs = eventregs.data;
        // console.log(`Eventregs fee: ${$scope.eventregs[0].fee}`);
        return $http({
            method: 'GET',
            url: '/incomes/year/'+fy,
            headers: {
                'x-auth': localStorage.userToken
            }
        });
    }).then(function(incomes) {
        $scope.incomes = incomes.data;
        // console.log(`Income description: ${$scope.incomes[0].description}`);
        return $http({
            method: 'GET',
            url: '/docs/yearandcat/'+fy+'/6',
            headers: {
                'x-auth': localStorage.userToken
            }
        });
    }).then(function(records) {
        $scope.records = records.data;
        // console.log(`DONE. Expense description: ${$scope.expenses[0].description}. Income description: ${$scope.incomes[0].description}. Record description: ${$scope.records[0].description}`)
        if ($scope.fiscalyear.locked) {
            $scope.participantsFee = $scope.fiscalyear.participantsFee;
            $scope.incomeTotal = $scope.fiscalyear.incomeTotal;
            $scope.expensesTotal = $scope.fiscalyear.expensesTotal;
            $scope.assetsStart = $scope.fiscalyear.assetsStart;
            $scope.incomeTotal = $scope.fiscalyear.incomeTotal;
            $scope.result = $scope.fiscalyear.result;
            $scope.assetsEnd = $scope.fiscalyear.assetsEnd;
        } else {
            $scope.expensesTotal = 0;
            for (var i=0; i<$scope.expenses.length; i++) {
                $scope.expensesTotal += $scope.expenses[i].expenseprice;
            };
            // console.log(`Sum of expenses: ${$scope.expensesTotal}`);
            $scope.participantsFee = 0;
            for (var j=0; j<$scope.eventregs.length; j++) {
                $scope.participantsFee += $scope.eventregs[j].fee;
            };
            // console.log(`Sum of participants fees: ${$scope.participantsFee}`);
            $scope.incomeSum = 0;
            for (var k=0; k<$scope.incomes.length; k++) {
                $scope.incomeSum += $scope.incomes[k].incomeamount;
            };
            // console.log(`Sum of incomes: ${$scope.incomeSum}`);
            $scope.assetsStart = $scope.pastFY.assetsEnd;
            $scope.incomeTotal = $scope.participantsFee + $scope.incomeSum;
            $scope.result = $scope.incomeTotal - $scope.expensesTotal;
            $scope.assetsEnd = $scope.assetsStart + $scope.result;
            var data = {
                year: $scope.fiscalyear.year,
                description: $scope.fiscalyear.description,
                locked: $scope.fiscalyear.locked,
                initiated: $scope.fiscalyear.initiated,
                assetsStart: $scope.pastFY.assetsEnd,
                participantsFee: $scope.participantsFee,
                incomeTotal: $scope.incomeTotal,
                expensesTotal: $scope.expensesTotal,
                result: $scope.result,
                assetsEnd: $scope.assetsEnd
            };
            $http({
                method: 'PATCH',
                url: 'fiscalyears/'+$scope.fiscalyear._id,
                headers: {
                    'x-auth': localStorage.userToken
                },
                data: data
            }).then(function(response) {
                // console.log(`THE END: Status: ${response.status}`);
            }, function errorCallback(response) {
                console.log(`Status: ${response.status}`);
            });
        };
    }, function errorCallback(response) {
        console.log(`Error Status: ${response.status}`);
    });


    $scope.newExpenseToggle = function() {
        if ($scope.newExpense) {
            $scope.newExpense = false;
        } else {
            $scope.newExpense = true;
        };
    };

    $scope.editExpenseToggle = function(expense) {
        if ($scope.editAnExpense) {
            $scope.editAnExpense = false;
        } else {
            $scope.editAnExpense = true;
        };
        $scope.editFy = expense.fy;
        $scope.editExpensetype = expense.expensetype;
        $scope.editDescription = expense.description;
        $scope.editVendor = expense.vendor;
        $scope.editExpensedate = new Date(expense.expensedate);
        $scope.editExpenseprice = expense.expenseprice;
        $scope.editID = expense._id;
    };

    $scope.newIncomeToggle = function() {
        if ($scope.newIncome) {
            $scope.newIncome = false;
        } else {
            $scope.newIncome = true;
        };
    };

    $scope.editIncomeToggle = function(income) {
        if ($scope.editAnIncome) {
            $scope.editAnIncome = false;
        } else {
            $scope.editAnIncome = true;
        };
        $scope.editFy = income.fy;
        $scope.editIncometype = income.incometype;
        $scope.editDescription = income.description;
        $scope.editSource = income.source;
        $scope.editIncomedate = new Date(income.incomedate);
        $scope.editIncomeamount = income.incomeamount;
        $scope.editID = income._id;
    };

    $scope.addExpense = function() {
        var method = 'POST';
        var url = 'expenses';
        var data = {
            year: fy,
            expensetype: $scope.expensetype,
            description: $scope.description,
            vendor: $scope.vendor,
            expensedate: $scope.expensedate,
            expenseprice: $scope.expenseprice
        };
        apiCall(method, url, data);
    };

    $scope.editExpense = function() {
        var method = 'PATCH';
        var url = '/expenses/'+$scope.editID;
        var data = {
            year: $scope.editFy,
            expensetype: $scope.editExpensetype,
            description: $scope.editDescription,
            vendor: $scope.editVendor,
            expensedate: $scope.editExpensedate,
            expenseprice: $scope.editExpenseprice
        };
        apiCall(method, url, data);
    };

    $scope.removeExpense = function(expense) {
        if ($window.confirm('Bekræft venligst at du vil slette udgiften '+expense.description)) {
            var method = 'DELETE';
            var url = 'expenses/'+expense._id;
            var data = '';
            apiCall(method, url, data);
        };
    };

    $scope.addIncome = function() {
        var method = 'POST';
        var url = 'incomes';
        var data = {
            year: fy,
            incometype: $scope.incometype,
            description: $scope.description,
            source: $scope.source,
            incomedate: $scope.incomedate,
            incomeamount: $scope.incomeamount
        };
        apiCall(method, url, data);
    };

    $scope.editIncome = function() {
        var method = 'PATCH';
        var url = '/incomes/'+$scope.editID;
        var data = {
            year: $scope.editFy,
            incometype: $scope.editIncometype,
            description: $scope.editDescription,
            source: $scope.editSource,
            incomedate: $scope.editIncomedate,
            incomeamount: $scope.editIncomeamount
        };
        apiCall(method, url, data);
    };

    $scope.removeIncome = function(income) {
        if ($window.confirm('Bekræft venligst at du vil slette indtægten '+income.description)) {
            var method = 'DELETE';
            var url = 'incomes/'+income._id;
            var data = '';
            apiCall(method, url, data);
        };
    };

    apiCall = function(method, url, data) {
        $http({
            method: method,
            url: url,
            headers: {
                'x-auth': localStorage.userToken
            },
            data: data
        }).then(function(response) {
            // console.log(`Status: ${response.status}`);
            // console.log(response.data._id);
            $location.path('/accounting/'+$scope.fy);
            $route.reload();
        }, function errorCallback(response) {
            console.log(`Status: ${response.status}`);
        });
    };

    $scope.newFy = function () {
		// console.log("Entering newFy, period: "+$scope.theOtherFy);
        var i=-1;
        do {
            i++;
        }
        while ($scope.fys[i].fy != $scope.theOtherFy);
        $scope.fy = $scope.fys[i].fy;
        // console.log(`The new fy is: ${$scope.fy}`);
		$location.path('/accounting/'+$scope.fy);
        $route.reload();
    };
    
    $scope.closeOrOpenFy = function(locked) {
        var s = "afslutte";
        if (locked) {
            // console.log(`The FY: ${$scope.fy} is locked`);
            s = "afslutte";
        } else {
            // console.log(`The FY: ${$scope.fy} is not locked`);
            s = "genåbne";
        };
        if ($window.confirm('Venligst bekræft at du vil '+s+' regnskabsåret '+$scope.fy)) {
            $http({
                method: 'PATCH',
                url: '/fiscalyears/locked/'+$scope.fiscalyear._id,
                headers: {
                    'x-auth': localStorage.userToken
                },
                data: {locked: locked}
            }).then(function(response) {
                // console.log(`Status: ${response.status}`);
                $location.path('/accounting/' + $scope.fy);
                $route.reload();
            }, function errorCallback(response) {
                console.log(`Status: ${response.status}`);
            });
        };
    };

    $scope.getDoc = function(doc) {
        var operation = 'getObject';
        var filename = doc.filename;
        var filetype = doc.filetype;
        // var folder = "archive/" + categories[doc.category].folder;   // Could not make that work
        var folder = "archive"
        // console.log(`Folder: ${folder}`);
        $http({
            method: 'GET',
            url: `/photos/sign-s3-getimage?file_name=${filename}&file_type=${filetype}&folder=${folder}&operation=${operation}`
        }).then(function(response) {
            // console.log("Signed request: "+response.data.signedRequest);
            $window.open(response.data.signedRequest, '_blank');
        }, function errorCallback(response) {
            console.log(`Status: ${response.status}`);
        });

    };

}]);
