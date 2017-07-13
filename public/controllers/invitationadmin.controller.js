angular.module('familielejr')

.controller('invitationadminCtrl', ['$scope', '$http', '$location', 'AuthService', function($scope, $http, $location, AuthService) {

    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
            $scope.role = AuthService.userRole();
        };
    });

    var currentyear = (new Date()).getFullYear();
    var now = new Date();
    var demarc = new Date(currentyear,8,1);
    var invyear = currentyear;
    if (now > demarc) {
        invyear += 1
    };
    // console.log(`Invyear: ${invyear}`);
    var invitationExists = false;
    $scope.invitationExists = invitationExists;

    $http({
        method: 'GET',
        url: '/invitations/'+invyear,
        headers: {
            'x-auth': localStorage.userToken
        }
    }).then(function(response) {
        // console.log(`Success. Status: ${response.status}`);
        if (response.data) {
            // console.log(response.data.enddate, response.data.startdate);
            invitationExists = true;
            $scope.invitationExists = invitationExists;
            $scope.invMessage = "Du ændrer i en eksisterende invitation for "+invyear+".";
            $scope.invitation = response.data;
            if ($scope.invitation.payment.meansofpayment.mobilepay) {$scope.mobilepay = true;};
            if ($scope.invitation.payment.meansofpayment.bankpay) {$scope.bankpay = true;};
            if ($scope.invitation.payment.meansofpayment.cash) {$scope.cash = true;};
            $scope.startdateView = new Date($scope.invitation.startdate);
            $scope.enddateView = new Date($scope.invitation.enddate);
            $scope.starttimeView = new Date($scope.invitation.starttime);
            $scope.endtimeView = new Date($scope.invitation.endtime);
            $scope.deadlinedateView = new Date($scope.invitation.registration.deadline);
            if ($scope.invitation.organizers[0]) {$scope.organizer1 = $scope.invitation.organizers[0].name;};
            if ($scope.invitation.organizers[1]) {$scope.organizer2 = $scope.invitation.organizers[1].name;};
            if ($scope.invitation.organizers[2]) {$scope.organizer3 = $scope.invitation.organizers[2].name;};
            if ($scope.invitation.organizers[3]) {$scope.organizer4 = $scope.invitation.organizers[3].name;};
            if ($scope.invitation.organizers[4]) {$scope.organizer5 = $scope.invitation.organizers[4].name;};
        } else {
            console.log('Invitation does not exist');
            $scope.invMessage = "Du opretter en ny invitation for " + invyear + ".";
            $http.get('../json/invitation.json').then(function(response) {
                $scope.invitation = response.data;
                $scope.invitation.year = invyear;
                if ($scope.invitation.payment.meansofpayment.mobilepay) {$scope.mobilepay = true;};
                if ($scope.invitation.payment.meansofpayment.bankpay) {$scope.bankpay = true;};
                if ($scope.invitation.payment.meansofpayment.cash) {$scope.cash = true;};
            });
        };
    }, function errorCallback(response) {
        console.log(`Error. Status: ${response.status}`);
    });

    $scope.generateInvitation = function() {

        var registration = {
            receiver: $scope.invitation.registration.receiver,
            email: $scope.invitation.registration.email,
            phone: $scope.invitation.registration.phone,
            deadline: $scope.deadlinedateView
        };

        var addr = {
            street: $scope.invitation.address.street,
            zip: $scope.invitation.address.zip,
            town: $scope.invitation.address.town
        };

        if (!$scope.mobilepay) {$scope.mobilepay = false};
        if (!$scope.bankpay) {$scope.bankpay = false};
        if (!$scope.cash) {$scope.cash = false};
        var payment = {
            adult: $scope.invitation.payment.adult,
            child: $scope.invitation.payment.child,
            meansofpayment: {
                mobilepay: $scope.mobilepay,
                bankpay: $scope.bankpay,
                cash: $scope.cash
            },
            paymentinfo: {
                mobilepay: $scope.invitation.payment.paymentinfo.mobilepay,
                bankaccount: {
                    regno: $scope.invitation.payment.paymentinfo.bankaccount.regno,
                    account: $scope.invitation.payment.paymentinfo.bankaccount.account,
                },
                cash: "Kontant afregning på lejren"
            }
        };

        var organizers = [];
        if ($scope.organizer1) {organizers.push({"name": $scope.organizer1});};
        if ($scope.organizer2) {organizers.push({"name": $scope.organizer2});};
        if ($scope.organizer3) {organizers.push({"name": $scope.organizer3});};
        if ($scope.organizer4) {organizers.push({"name": $scope.organizer4});};
        if ($scope.organizer5) {organizers.push({"name": $scope.organizer5});};

		var data = {
            headline: $scope.invitation.headline,
            year: $scope.invitation.year,
            text1: $scope.invitation.text1,
            camp: $scope.invitation.camp,
			address: addr,
            startdate: $scope.startdateView,
            starttime: $scope.starttimeView,
            enddate: $scope.enddateView,
            endtime: $scope.endtimeView,
            registration: registration,
            bring: $scope.invitation.bring,
            payment: payment,
            text2: $scope.invitation.text2,
            organizers: organizers
		};

        if (invitationExists) {
            $http({
                method: 'PATCH',
                url: '/invitations/' + $scope.invitation._id,
                headers: {
                    'x-auth': localStorage.userToken
                },
                data: data
            }).then(function(response) {
                $location.path('/eventinfo');
            }, function errorCallback(response) {
                console.log(`Status: ${response.status}`);
            });
        } else {
            $http({
                method: 'POST',
                url: '/invitations',
                headers: {
                    'x-auth': localStorage.userToken
                },
                data: data
            }).then(function(response) {
                $location.path('/eventinfo');
            }, function errorCallback(response) {
                console.log(`Status: ${response.status}`);
            });
        };

    };

}])

.controller('futurecampsCtrl', ['$scope', '$http', '$location', '$route', 'AuthService', function($scope, $http, $location, $route, AuthService) {

    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
            $scope.role = AuthService.userRole();
        };
    });

    var currentyear = (new Date()).getFullYear();
    var now = new Date();
    var demarc = new Date(currentyear,8,1);
    var invyear = currentyear;
    if (now > demarc) {
        invyear += 1
    };
    console.log(`Invyear: ${invyear}`);

    $http({
        method: 'GET',
        url: '/futurecamps',
        headers: {
            'x-auth': localStorage.userToken
        }
    }).then(function(response) {
        console.log(`Success. Status: ${response.status}`);
        if (response.data) {
            $scope.camps = response.data;
        } else {
            console.log('No future camps');
        };
    }, function errorCallback(response) {
        console.log(`Error. Status: ${response.status}`);
    });

    $scope.generateFuturecamp = function() {

        var addr = {
            street: $scope.street, zip: $scope.zip, town: $scope.town
        };

        var organizers = [];
        if ($scope.organizer1) {organizers.push({"name": $scope.organizer1});};
        if ($scope.organizer2) {organizers.push({"name": $scope.organizer2});};
        if ($scope.organizer3) {organizers.push({"name": $scope.organizer3});};
        if ($scope.organizer4) {organizers.push({"name": $scope.organizer4});};
        if ($scope.organizer5) {organizers.push({"name": $scope.organizer5});};

		var data = {
            year: $scope.year,
            camp: $scope.camp,
			address: addr,
            startdate: $scope.startdate,
            enddate: $scope.enddate,
            organizers: organizers
		};

        $http({
            method: 'POST',
            url: '/futurecamps',
            headers: {
                'x-auth': localStorage.userToken
            },
            data: data
        }).then(function(response) {
            $location.path('/futurecamps');
            $route.reload();
        }, function errorCallback(response) {
            console.log(`Status: ${response.status}`);
        });

    };

}])

.controller('futurecampeditCtrl', ['$scope', '$http', '$location', '$routeParams', 'AuthService', function($scope, $http, $location, $routeParams, AuthService) {

    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
            $scope.role = AuthService.userRole();
        };
    });

    $http({
        method: 'GET',
        url: '/futurecamps/' + $routeParams.id,
        headers: {
            'x-auth': localStorage.userToken
        }
    }).then(function(response) {
        console.log(`Success. Status: ${response.status}`);
        if (response.data) {
            $scope.camp = response.data.futurecamp;
            $scope.startdateView = new Date($scope.camp.startdate);
            $scope.enddateView = new Date($scope.camp.enddate);
            if ($scope.camp.organizers[0]) {$scope.organizer1 = $scope.camp.organizers[0].name;};
            if ($scope.camp.organizers[1]) {$scope.organizer2 = $scope.camp.organizers[1].name;};
            if ($scope.camp.organizers[2]) {$scope.organizer3 = $scope.camp.organizers[2].name;};
            if ($scope.camp.organizers[3]) {$scope.organizer4 = $scope.camp.organizers[3].name;};
            if ($scope.camp.organizers[4]) {$scope.organizer5 = $scope.camp.organizers[4].name;};
        } else {
            console.log('Camp not found');
        };
    }, function errorCallback(response) {
        console.log(`Error. Status: ${response.status}`);
    });

    $scope.editFuturecamp = function(id) {

        var addr = {
            street: $scope.camp.address.street, zip: $scope.camp.address.zip, town: $scope.camp.address.town
        };

        var organizers = [];
        if ($scope.organizer1) {organizers.push({"name": $scope.organizer1});};
        if ($scope.organizer2) {organizers.push({"name": $scope.organizer2});};
        if ($scope.organizer3) {organizers.push({"name": $scope.organizer3});};
        if ($scope.organizer4) {organizers.push({"name": $scope.organizer4});};
        if ($scope.organizer5) {organizers.push({"name": $scope.organizer5});};

		var data = {
            year: $scope.camp.year,
            camp: $scope.camp.camp,
			address: addr,
            startdate: $scope.startdateView,
            enddate: $scope.enddateView,
            organizers: organizers
		};

        $http({
            method: 'PATCH',
            url: '/futurecamps/' + $routeParams.id,
            headers: {
                'x-auth': localStorage.userToken
            },
            data: data
        }).then(function(response) {
            $location.path('/futurecamps');
        }, function errorCallback(response) {
            console.log(`Status: ${response.status}`);
        });

    };

}])
