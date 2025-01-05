angular.module('familielejr')

.controller('todolistCtrl', ['$scope', '$http', '$location', '$route', '$window', 'AuthService', function($scope, $http, $location, $route, $window, AuthService) {

    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
            $scope.role = AuthService.userRole();
        };
    });

    setTimeout(function(){
        angular.element(document.querySelector( '#organizer' ) ).addClass('active');
        angular.element(document.querySelector( '#todolist' ) ).addClass('active');
    }, 1000);

    $scope.categories = [
        {"category": "Lejren"},
        {"category": "Invitation"},
        {"category": "Mad"},
        {"category": "Drikkevarer"},
        {"category": "Underholdning"},
        {"category": "Regnskab / økonomi"},
        {"category": "Andet"}
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
            url: '/todos',
            headers: {
                'x-auth': localStorage.userToken
            }
        });
    }).then(function(response) {
        // console.log(`Success. Status: ${response.status}`);
        $scope.todos = response.data;
        // console.log($scope.todos[0]);
    }, function errorCallback(response) {
        console.log(`Error. Status: ${response.status}`);
    });

    $scope.newTodo = false;
    $scope.editTodo = false;

    $scope.newTodoToggle = function() {
        if ($scope.newTodo) {
            $scope.newTodo = false;
        } else {
            $scope.newTodo = true;
        };
    };

    $scope.addTodo = function() {
        var todo = {
            category: $scope.category,
            text: $scope.text
        };

        $http({
            method: 'POST',
            url: 'todos',
            headers: {
                'x-auth': localStorage.userToken
            },
            data: todo
        }).then(function(response) {
            console.log(`Status: ${response.status}`);
            console.log(response.data._id);
            $location.path('/todolist');
            $route.reload();
        }, function errorCallback(response) {
            console.log(`Status: ${response.status}`);
        });
    };

    $scope.completionStatus = function(todo) {
        // console.log(`Todo completed status: ${todo.completed}`);
        var data = {
            category: todo.category,
            text: todo.text,
            completed: todo.completed
        };

        $http({
            method: 'PATCH',
            url: '/todos/'+todo._id,
            headers: {
                'x-auth': localStorage.userToken
            },
            data: data
        }).then(function(response) {
            $location.path('/todolist');
            $route.reload();
        }, function errorCallback(response) {
            console.log(`editUserStatus: ${response.status}`);
        });

    };

    $scope.editTodoToggle = function(todo) {
        if ($scope.editTodo) {
            $scope.editTodo = false;
        } else {
            $scope.editTodo = true;
        };
        $scope.editCategory = todo.category;
        $scope.editText = todo.text;
        $scope.editID = todo._id;
    };

    $scope.todoEdit = function() {
        var data = {
            category: $scope.editCategory,
            text: $scope.editText
        };

        $http({
            method: 'PATCH',
            url: '/todos/'+$scope.editID,
            headers: {
                'x-auth': localStorage.userToken
            },
            data: data
        }).then(function(response) {
            $location.path('/todolist');
            $route.reload();
        }, function errorCallback(response) {
            console.log(`editUserStatus: ${response.status}`);
        });

    };

    $scope.removeTodo = function(todo) {
        if ($window.confirm('Bekræft venligst at du vil slette punktet')) {
            $http({
                method: 'DELETE',
                url: 'todos/'+todo._id,
                headers: {
                    'x-auth': localStorage.userToken
                }
            }).then(function(response) {
                // console.log(`Status: ${response.status}`);
                // console.log(response.data);
                $location.path('/todolist');
                $route.reload();
            }, function errorCallback(response) {
                console.log(`Status: ${response.status}`);
            });
        };
    };

    $scope.clearExecuted = function() {
        for (i=0; i<$scope.todos.length; i++) {
            var data = {
                category: $scope.todos[i].category,
                text: $scope.todos[i].text,
                completed: false
            };
    
            $http({
                method: 'PATCH',
                url: '/todos/'+$scope.todos[i]._id,
                headers: {
                    'x-auth': localStorage.userToken
                },
                data: data
            }).then(function(response) {
                console.log(response.status);
            }, function errorCallback(response) {
                console.log(`editUserStatus: ${response.status}`);
            });
        };
        $location.path('/todolist');
        $route.reload();
    };

}]);
