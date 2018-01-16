angular.module('familielejr')

.controller('registerCtrl', ['$scope', '$http', '$location', 'AuthService', function($scope, $http, $location, AuthService) {
    
    $scope.countries = [
        {"name": "Danmark"},
        {"name": "Sverige"},
        {"name": "Tyskland"},
        {"name": "Norge"},
        {"name": "Finland"},
        {"name": "Holland"},
        {"name": "Belgien"},
        {"name": "Spanien"},
        {"name": "Italien"},
        {"name": "Frankrig"},
        {"name": "Grækenland"},
        {"name": "Polen"},
        {"name": "UK"},
        {"name": "Irland"},
        {"name": "Syd-Sudan"},
        {"name": "Langtbortistan"},
        {"name": "Jylland"},
        {"name": "USA"},
        {"name": "Statsløs"}
    ];
    
    $scope.directions = [
        {"dir": "th."},
        {"dir": "tv."},
        {"dir": "mf."}
    ];
    
    $scope.floors = [
        {"floor": "st."},
        {"floor": "1."},
        {"floor": "2."},
        {"floor": "3."},
        {"floor": "4."},
        {"floor": "5."},
        {"floor": "6."},
        {"floor": "7."},
        {"floor": "8."},
        {"floor": "9."},
        {"floor": "10."},
        {"floor": "11."},
        {"floor": "12."},
        {"floor": "13."},
        {"floor": "14."},
        {"floor": "15."}
    ];

    $scope.maxUserCount = 100;
    $scope.registrationAllowed = false;

    $http({
        method: 'GET',
        url: '/users/count'
    }).then(function(response) {
        // console.log(`Users count Status: ${response.status}`);
        // console.log(`Users count: ${response.data}`);
        $scope.userCount = response.data;
        if ($scope.userCount < $scope.maxUserCount) {
            $scope.registrationAllowed = true;
        } else {
            console.log("Too many users. You cannot register");
        };
    }, function errorCallback(response) {
        console.log(`Users count Status: ${response.status}`);
    });

    $scope.registerUser = function() {
        // console.log(`inputEmail: ${$scope.inputEmail}, inputPassword: ${$scope.inputPassword}`);

        var name = {
            firstname: $scope.firstname, middlename: $scope.middlename, surname: $scope.surname
        };

        var addr = {
            street: $scope.street, houseno: $scope.houseno, floor: $scope.floor, direction: $scope.direction, zip: $scope.zip, town: $scope.town, country: $scope.country
        };
        
		var data = {
            email: $scope.inputEmail,
            password: $scope.inputPassword,
            confirmpwd: $scope.repeatPassword,
            role: 2, // by default the registrant is an ordinary user.
            name: name,
			address: addr,
            phone: $scope.phone,
            secret: $scope.secret
		};

        if ($scope.registrationAllowed) {
            $http.post('/users', data).then(function(response) {
                // console.log(response.headers());
                // console.log('Status: ' + response.status);
                // console.log(response.data._id, response.data.email);
                localStorage.userToken = response.headers()['x-auth'];
                localStorage.familielejrUserId = response.data._id;
                $location.path('/home');
                $scope.isLoggedIn = true;
            }, function errorCallback(response) {
                console.log(`getUserStatus: ${response.status}`);
                alert('Indtastede du korrekt hemmelighed? De to kodeord skal være identiske.');
            });
        };

    };

}])

.controller('profileCtrl', ['$scope', '$http', '$location', '$route', 'AuthService', function($scope, $http, $location, $route, AuthService) {

    $scope.countries = [
        {"name": "Danmark"},
        {"name": "Sverige"},
        {"name": "Tyskland"},
        {"name": "Norge"},
        {"name": "Finland"},
        {"name": "Holland"},
        {"name": "Belgien"},
        {"name": "Spanien"},
        {"name": "Italien"},
        {"name": "Frankrig"},
        {"name": "Grækenland"},
        {"name": "Polen"},
        {"name": "UK"},
        {"name": "Irland"},
        {"name": "Syd-Sudan"},
        {"name": "Langtbortistan"},
        {"name": "Jylland"},
        {"name": "USA"},
        {"name": "Statsløs"}
    ];
    
    $scope.directions = [
        {"dir": "th."},
        {"dir": "tv."},
        {"dir": "mf."}
    ];
    
    $scope.floors = [
        {"floor": "st."},
        {"floor": "1."},
        {"floor": "2."},
        {"floor": "3."},
        {"floor": "4."},
        {"floor": "5."},
        {"floor": "6."},
        {"floor": "7."},
        {"floor": "8."},
        {"floor": "9."},
        {"floor": "10."},
        {"floor": "11."},
        {"floor": "12."},
        {"floor": "13."},
        {"floor": "14."},
        {"floor": "15."}
    ];

    $scope.isLoggedIn = false;
    $scope.editProfile = false;

    var token;
    if (localStorage.userToken) {
        token = localStorage.userToken;
    } else {
        token = '123';
    };
    $http({
        method: 'GET',
        url: '/users/me',
        headers: {
            'x-auth': token
        }
    }).then(function(response) {
        console.log(`profileUserStatus: ${response.status}`);
        console.log(response.data._id, response.data.email);
        if (response.data._id === localStorage.familielejrUserId) {
            $scope.isLoggedIn = true;
            $scope.user = response.data;
            $scope.role = response.data.role;
            // console.log(`Role: ${$scope.role}`);
            // console.log(`User: ${$scope.user.name.firstname} ${$scope.user.name.surname}`);
        } else {
            alert('Something fishy...');
        };
    }, function errorCallback(response) {
        console.log(`getUserStatus: ${response.status}`);
    });

    $scope.editProfileToggle = function() {
        if ($scope.editProfile) {
            $scope.editProfile = false;
        } else {
            $scope.editProfile = true;
        };
    };

    $scope.profileEdit = function() {
        console.log(`Firstname: ${$scope.user.name.firstname}`);

        var name = {
            firstname: $scope.user.name.firstname,
            middlename: $scope.user.name.middlename,
            surname: $scope.user.name.surname
        };

        var addr = {
            street: $scope.user.address.street,
            houseno: $scope.user.address.houseno,
            floor: $scope.user.address.floor,
            direction: $scope.user.address.direction,
            zip: $scope.user.address.zip,
            town: $scope.user.address.town,
            country: $scope.user.address.country
        };
        
		var data = {
            name: name,
			address: addr,
            phone: $scope.user.phone
		};

        $http({
            method: 'PATCH',
            url: '/users/me/edit/'+$scope.user._id,
            headers: {
                'x-auth': token
            },
            data: data
        }).then(function(response) {
            $scope.isLoggedIn = true;
            $scope.user = response.data;
            // console.log(`User: ${$scope.user.name.firstname} ${$scope.user.name.surname}`);
            localStorage.userToken = response.headers()['x-auth'];
            $scope.editProfile = false;
            $location.path('/profile');
            $route.reload();
        }, function errorCallback(response) {
            console.log(`editUserStatus: ${response.status}`);
        });

    };
}])

.controller('changepwdCtrl', ['$scope', '$http', '$location', 'AuthService', function($scope, $http, $location, AuthService) {
    
    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
            $scope.role = AuthService.userRole();
        };
    });

    $scope.changePwd = function() {

        token = localStorage.userToken;

        var data = {
            password: $scope.currentPassword,
            newpassword: $scope.newPassword,
            confirmnpwd: $scope.repeatnewPassword
        };

        $http({
            method: 'POST',
            url: '/users/me/password',
            headers: {
                'x-auth': token
            },
            data: data
        }).then(function(response) {
            localStorage.userToken = response.headers()['x-auth'];
            $location.path('/profile');
            $scope.isLoggedIn = true;
        }, function errorCallback(response) {
            console.log(`getUserStatus: ${response.status}`);
            if (response.status == 400) {
                alert('Indtastede du korrekt kodeord?');
            } else if (response.status == 401) {
                alert('Kodeord og gentaget kodeord skal være ens');
            } else {
                alert('Noget gik galt');
            };
        });

    };

}])

.controller('usersCtrl', ['$scope', '$http', '$location', '$route', '$window', 'AuthService', function($scope, $http, $location, $route, $window, AuthService) {

    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
            $scope.role = AuthService.userRole();
        };
    });

    $http({
        method: 'GET',
        url: '/users',
        headers: {
            'x-auth': localStorage.userToken
        }
    }).then(function(response) {
        console.log(`UsersStatus: ${response.status}`);
        $scope.users = response.data;
        $scope.allEmails = "";
        for (var i=0; i<response.data.length; i++) {
            console.log(`Email address: ${response.data[i].email}`);
            $scope.allEmails += response.data[i].email;
            if (i+1 < response.data.length) {
                $scope.allEmails += ", ";
            };
        };
    }, function errorCallback(response) {
        console.log(`getUserStatus: ${response.status}`);
    });

    $scope.removeUser = function(id) {
        if ($window.confirm('Bekræft venligst at du vil slette brugeren')) {
            $http({
                method: 'DELETE',
                url: 'users/'+id,
                headers: {
                    'x-auth': localStorage.userToken
                }
            }).then(function(response) {
                console.log(`Status: ${response.status}`);
                console.log(response.data._id);
                $location.path('/usersadmin');
                $route.reload();
            }, function errorCallback(response) {
                console.log(`Status: ${response.status}`);
            });
        };
    };

    $scope.changeRole = function(id, role, name) {
        var rolename = 'bruger';
        if (role == 0) {rolename = 'administrator';};
        if (role == 1) {rolename = 'arrangør';};
        if ($window.confirm(`Bekræft venligst at du vil ændre ${name}'s rolle til ${rolename}`)) {

            var data = {
                role: role
            };

            $http({
                method: 'PATCH',
                url: '/users/role/'+id,
                headers: {
                    'x-auth': localStorage.userToken
                },
                data: data
            }).then(function(response) {
                $scope.user = response.data;
                // console.log(`User: ${response.data.name.firstname} ${response.data.name.surname}`);
                $location.path('/usersadmin');
                $route.reload();
            }, function errorCallback(response) {
                console.log(`Status: ${response.status}`);
            });
        };
    };

}])

.controller('userpwdCtrl', ['$scope', '$http', '$location', '$routeParams', 'AuthService', function($scope, $http, $location, $routeParams, AuthService) {
    
    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
            $scope.role = AuthService.userRole();
        };
    });

    $http({
        method: 'GET',
        url: '/users/user/' + $routeParams.id,
        headers: {
            'x-auth': localStorage.userToken
        }
    }).then(function(response) {
        console.log(`UserStatus: ${response.status}`);
        $scope.user = response.data;
        console.log(`User: ${$scope.user.email}`);
    }, function errorCallback(response) {
        console.log(`getUserStatus: ${response.status}`);
    });

    $scope.adminchangePwd = function() {

        var data = {
            newpassword: $scope.newPassword,
            confirmnpwd: $scope.repeatnewPassword
        };

        $http({
            method: 'POST',
            url: '/users/password/' + $scope.user._id,
            headers: {
                'x-auth': localStorage.userToken
            },
            data: data
        }).then(function(response) {
            $location.path('/usersadmin');
        }, function errorCallback(response) {
            console.log(`getUserStatus: ${response.status}`);
            if (response.status == 401) {
                alert('Kodeord og gentaget kodeord skal være ens');
            } else {
                alert('Noget gik galt');
            };
        });

    };

}])
