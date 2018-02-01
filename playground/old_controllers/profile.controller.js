angular.module('familielejr')

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
