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

    $scope.registerUser = function() {
        console.log(`inputEmail: ${$scope.inputEmail}, inputPassword: ${$scope.inputPassword}`);

        var name = {
            firstname: $scope.firstname, middlename: $scope.middlename, surname: $scope.surname
        };

        var addr = {
            street: $scope.street, houseno: $scope.houseno, floor: $scope.floor, direction: $scope.direction, zip: $scope.zip, town: $scope.town, country: $scope.country
        };
        
		var data = {
            email: $scope.inputEmail,
            password: $scope.inputPassword,
            name: name,
			address: addr,
            phone: $scope.phone,
            secret: $scope.secret
		};

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
            alert('Indtastede du korrekt hemmelighed?');
        });

    };

}]);
