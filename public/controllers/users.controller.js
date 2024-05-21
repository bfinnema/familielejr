angular.module('familielejr')

.controller('newtenantCtrl', ['$scope', '$http', '$location', 'ProfileService', 
function($scope, $http, $location, ProfileService) {

    $scope.countries = ProfileService.countries();
    $scope.floors = ProfileService.floors();
    $scope.directions = ProfileService.directions();

    $scope.maxUserCount = 100;
    $scope.registrationAllowed = false;

    $http({
        method: 'GET',
        url: '/users/count/all'
    }).then(function(response) {
        // console.log(`Users count Status: ${response.status}`);
        // console.log(`Users count: ${response.data}`);
        $scope.userCount = response.data;
        if ($scope.userCount < $scope.maxUserCount) {
            $scope.registrationAllowed = true;
            $http({
                method: 'GET',
                url: '/tenants/noauth'
            }).then(function(response) {
                // console.log(`Success. Status: ${response.status}`);
                $scope.tenants = response.data;
                // console.log($scope.tenants[0]);
            }, function errorCallback(response) {
                console.log(`Error. Status: ${response.status}`);
            });
        
        } else {
            console.log("Too many users. You cannot register");
        };
        angular.element(document.querySelector( '#register' ) ).addClass('active');
    }, function errorCallback(response) {
        console.log(`Users count Status: ${response.status}`);
    });

    $scope.addTenant = function() {
        // console.log(`inputEmail: ${$scope.inputEmail}, inputPassword: ${$scope.inputPassword}`);

        var subscriptions = {
            events: {
                subscribe: $scope.events,
                multipleEventsPerYear: $scope.multipleevents
            },
            familyTree: $scope.familytree,
            photoGallery: $scope.photogallery,
            summaries: $scope.summaries,
            accounting: $scope.accounting
        };

        var tenant = {
            tenantName: $scope.tenantname,
            description: $scope.description,
            startYear: (new Date()).getFullYear(),
            subscriptions: subscriptions
        };

        var textHeadlines = [];
        var headline = {
            h3: "Indtast dine egne overskrifter",
            paragraphs: [{paragraph: "Din første paragraf"}, {paragraph: "Din anden paragraf"}]
        };
        textHeadlines.push(headline);
 
        var about = {
            communityName: $scope.tenantname,
            subHeading: "Din sub-overskrift",
            nextHeadline: "Din næste begivenhed",
            upcomingHeadline: "Dine kommende begivenheder",
            metadata: "Dine metadata",
            textHeadlines: textHeadlines
        };

        var name = {
            firstname: $scope.firstname, middlename: $scope.middlename, surname: $scope.surname
        };

        var addr = {
            street: $scope.street, houseno: $scope.houseno, floor: $scope.floor, direction: $scope.direction, zip: $scope.zip, town: $scope.town, country: $scope.country
        };
        
		var tenantAdmin = {
            email: $scope.inputEmail,
            password: $scope.inputPassword,
            confirmpwd: $scope.repeatPassword,
            role: 0, // The one who registers a new tenant is Admin of the tenant.
            name: name,
			address: addr,
            phone: $scope.phone,
            secret: $scope.secret
		};

        if ($scope.registrationAllowed) {

            $http({
                method: 'POST',
                url: 'tenants/noauth',
                data: tenant
            }).then(function(tenant_response) {
                console.log(`Tenant Status: ${tenant_response.status}`);
                console.log(`Tenant ID: ${tenant_response.data._id}`);
                $scope._tenant = tenant_response.data._id;
                about._tenant = $scope._tenant;
                return $http({
                    method: 'POST',
                    url: 'abouts/noauth',
                    data: about
                });
            }).then(function(about_response) {
                console.log(`About Status 1: ${about_response.status}`);
                console.log(`About ID 1: ${about_response.data._id}`);
                $scope.aboutID = about_response.data._id;
                console.log(`Tenant ID: ${$scope._tenant}`);
                console.log(`tenantAdmin name: ${tenantAdmin.name}`);
                console.log(`tenantAdmin email: ${tenantAdmin.email}`);
                tenantAdmin._tenant = $scope._tenant;
                console.log(`tenantAdmin name: ${tenantAdmin.name}`);
                console.log(`tenantAdmin email: ${tenantAdmin.email}`);
                return $http({
                    method: 'POST',
                    url: '/users',
                    data: tenantAdmin
                });
            }).then(function(user_response) {
                console.log(`User Status: ${user_response.status}`);
                console.log(`User ID: ${user_response.data._id}`);
                localStorage.userToken = response.headers()['x-auth'];
                localStorage.familielejrUserId = response.data._id;
                $location.path('/home');
                $scope.isLoggedIn = true;
                var tenant = {
                    _creator: user_response.data._id,
                    _admin: user_response.data._id
                };
                $scope._creator = user_response.data._id;
                $scope._admin = user_response.data._id;
                return $http({
                    method: 'PATCH',
                    url: 'tenants/noauth/'+$scope._tenant,
                    data: tenant
                });
            }).then(function(tenant2_response) {
                console.log(`Second Tenant Status: ${tenant2_response.status}`);
                console.log(`Tenant ID second time: ${tenant2_response.data._id}`);
                var about = {
                    _creator: $scope._creator
                };
                return $http({
                    method: 'PATCH',
                    url: 'abouts/noauth/'+$scope.aboutID,
                    data: about
                });
            }).then(function(about2_response) {
                console.log(`About Status: ${about2_response.status}`);
                console.log(`About ID: ${about2_response.data._id}`);
                $location.path('/home');
                // $route.reload();
            }, function errorCallback(response) {
                console.log(`User Status: ${response.status}`);
                alert('Indtastede du korrekt hemmelighed? De to kodeord skal være identiske.');
            });
    
            /* $http.post('/users', data).then(function(response) {
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
            }); */
        };
    };
}])

.controller('registerCtrl', ['$scope', '$http', '$location', 'ProfileService', 
function($scope, $http, $location, ProfileService) {

    $scope.countries = ProfileService.countries();
    $scope.floors = ProfileService.floors();
    $scope.directions = ProfileService.directions();

    $scope.maxUserCount = 100;
    $scope.registrationAllowed = false;

    $http({
        method: 'GET',
        url: '/users/count/all'
    }).then(function(response) {
        // console.log(`Users count Status: ${response.status}`);
        // console.log(`Users count: ${response.data}`);
        $scope.userCount = response.data;
        if ($scope.userCount < $scope.maxUserCount) {
            $scope.registrationAllowed = true;
            $http({
                method: 'GET',
                url: '/tenants/noauth'
            }).then(function(response) {
                // console.log(`Success. Status: ${response.status}`);
                $scope.tenants = response.data;
                // console.log($scope.tenants[0]);
            }, function errorCallback(response) {
                console.log(`Error. Status: ${response.status}`);
            });
        
        } else {
            console.log("Too many users. You cannot register");
        };
        angular.element(document.querySelector( '#register' ) ).addClass('active');
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
            secret: $scope.secret,
            _tenant: $scope._tenant
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

.controller('profileCtrl', ['$scope', '$http', '$location', '$route', 'AuthService', 'ProfileService',
function($scope, $http, $location, $route, AuthService, ProfileService) {

    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
            $scope.role = AuthService.userRole();
        };
    });

    $scope.countries = ProfileService.countries();
    $scope.floors = ProfileService.floors();
    $scope.directions = ProfileService.directions();

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
        // console.log(`profileUserStatus: ${response.status}`);
        // console.log(response.data._id, response.data.email);
        if (response.data._id === localStorage.familielejrUserId) {
            $scope.isLoggedIn = true;
            $scope.user = response.data;
            $scope.role = response.data.role;
            // console.log(`Role: ${$scope.role}`);
            // console.log(`User: ${$scope.user.name.firstname} ${$scope.user.name.surname}`);
        } else {
            alert('Something fishy...');
        };
        angular.element(document.querySelector( '#myprofile' ) ).addClass('active');
        angular.element(document.querySelector( '#myaccount' ) ).addClass('active');
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
        angular.element(document.querySelector( '#myaccount' ) ).addClass('active');
        angular.element(document.querySelector( '#changepassword' ) ).addClass('active');
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

.controller('usersCtrl', ['$scope', '$http', '$location', '$route', '$window', 'AuthService', 'ProfileService', 'SearchService',
function($scope, $http, $location, $route, $window, AuthService, ProfileService, SearchService) {

    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
            $scope.role = AuthService.userRole();
        };
    });

    $scope.countries = ProfileService.countries();
    $scope.floors = ProfileService.floors();
    $scope.directions = ProfileService.directions();
    $scope.searchcriterias = SearchService.searchcriterias();

    $scope.searching = false;
    $scope.sorting = false;
    $scope.sortBy = "fornavn";
    $scope.sortDirection = "nedad";

    getUsers = function(sortOrNot, sortBy, sortDirection, searchOrNot, searchCriteria, searchText) {
        var usersUrl = '/users';
        var nausersUrl = '/nonactiveusers';
        if (sortOrNot) {
            usersUrl = `${usersUrl}/sort/${sortBy}/${sortDirection}`;
            nausersUrl = `${nausersUrl}/sort/${sortBy}/${sortDirection}`;
        } else if (searchOrNot) {
            usersUrl = `${usersUrl}/search/${searchCriteria}/${searchText}`;
            nausersUrl = `${nausersUrl}/search/${searchCriteria}/${searchText}`;
        };
        // console.log(`usersUrl: ${usersUrl}, nausersUrl: ${nausersUrl}`);
        
        $http({
            method: 'GET',
            url: usersUrl,
            headers: {
                'x-auth': localStorage.userToken
            }
        }).then(function(response) {
            // console.log(`UsersStatus: ${response.status}`);
            $scope.users = response.data;
            // if ($scope.users.length>0) {console.log($scope.users[0].name.firstname);};
    
            return $http({
                method: 'GET',
                url: nausersUrl,
                headers: {
                    'x-auth': localStorage.userToken
                }
            });
        }).then(function(response) {
            // console.log(`NonactiveUsersStatus: ${response.status}`);
            $scope.nausers = response.data;
            // if ($scope.nausers.length > 0) {console.log($scope.nausers[0].name.firstname);};
            
            $scope.allEmails = "";
            for (var i=0; i<$scope.users.length; i++) {
                $scope.allEmails += $scope.users[i].email;
                if (i+1 < $scope.users.length) {
                    $scope.allEmails += ", ";
                };
                $scope.users[i].RemPopoverIsVisible = false;
                $scope.users[i].PwdPopoverIsVisible = false;
                $scope.users[i].R2PopoverIsVisible = false;
                $scope.users[i].R1PopoverIsVisible = false;
                $scope.users[i].R0PopoverIsVisible = false;
                $scope.users[i].num = i;
                // console.log(`Email address: ${$scope.users[i].email}, Num: ${$scope.users[i].num}`);
                // console.log(`RemPopoverIsVisible: ${$scope.users[i].RemPopoverIsVisible}`);
                // console.log(`R2PopoverIsVisible: ${$scope.users[i].R2PopoverIsVisible}`);
                if ($scope.users[i].hasOwnProperty('address')) {
                    $scope.users[i].fullAddress = aggregateAddress($scope.users[i].address);
                };
            };
            if ($scope.nausers.length > 0) {
                $scope.allEmails += ", ";
            };
    
            for (var j=0; j<$scope.nausers.length; j++) {
                // console.log(`Email address, nauser: ${$scope.nausers[j].email}`);
                $scope.allEmails += $scope.nausers[j].email;
                if (j+1 < $scope.nausers.length) {
                    $scope.allEmails += ", ";
                };
                $scope.nausers[j].RemNauserPopoverIsVisible = false;
                $scope.nausers[j].EditNauserPopoverIsVisible = false;
                $scope.nausers[j].num = j;
                if ($scope.nausers[j].hasOwnProperty('address')) {
                    $scope.nausers[j].fullAddress = aggregateAddress($scope.nausers[j].address);
                };
            };
    
            angular.element(document.querySelector( '#admin' ) ).addClass('active');
            angular.element(document.querySelector( '#organizer' ) ).addClass('active');
            angular.element(document.querySelector( '#usersorg' ) ).addClass('active');
            angular.element(document.querySelector( '#usersadmin' ) ).addClass('active');
        }, function errorCallback(response) {
            console.log(`getUsersStatus: ${response.status}`);
        });
    };

    getUsers(false, "none", "none", false, "none", "none");

    $scope.removeUser = function(id) {
        if ($window.confirm('Bekræft venligst at du vil slette brugeren')) {
            $http({
                method: 'DELETE',
                url: 'users/'+id,
                headers: {
                    'x-auth': localStorage.userToken
                }
            }).then(function(response) {
                // console.log(`Status: ${response.status}`);
                // console.log(response.data._id);
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

    $scope.addNauserToggle = function() {
        if ($scope.showAddNauser) {
            $scope.showAddNauser = false;
        } else {
            $scope.showAddNauser = true;
        };
    };

    $scope.editNauserToggle = function(nauser) {
        if ($scope.showEditNauser) {
            $scope.showEditNauser = false;
            $scope.editFirstname = null;
            $scope.editMiddlename = null;
            $scope.editSurname = null;
            $scope.editStreet = null;
            $scope.editHouseno = null;
            $scope.editFloor = null;
            $scope.editDirection = null;
            $scope.editZip = null;
            $scope.editTown = null;
            $scope.editCountry = null;
            $scope.editPhone = null;
            $scope.editID = null;
        } else {
            $scope.showEditNauser = true;
            $scope.editInputEmail = nauser.email;
            $scope.editFirstname = nauser.name.firstname;
            $scope.editMiddlename = nauser.name.middlename;
            $scope.editSurname = nauser.name.surname;
            $scope.editStreet = nauser.address.street;
            $scope.editHouseno = nauser.address.houseno;
            $scope.editFloor = nauser.address.floor;
            $scope.editDirection = nauser.address.direction;
            $scope.editZip = nauser.address.zip;
            $scope.editTown = nauser.address.town;
            $scope.editCountry = nauser.address.country;
            $scope.editPhone = nauser.phone;
            $scope.editID = nauser._id;
        };
    };

    $scope.addNauser = function() {
        var method = 'POST';
        var url = 'nonactiveusers';
        var name = {
            firstname: $scope.firstname, middlename: $scope.middlename, surname: $scope.surname
        };

        var addr = {
            street: $scope.street, houseno: $scope.houseno, floor: $scope.floor, direction: $scope.direction, zip: $scope.zip, town: $scope.town, country: $scope.country
        };
        
		var data = {
            email: $scope.inputEmail,
            name: name,
			address: addr,
            phone: $scope.phone
		};
        apiCall(method, url, data);
    };

    $scope.editNauser = function() {
        var method = 'PATCH';
        var url = '/nonactiveusers/'+$scope.editID;
        var name = {
            firstname: $scope.editFirstname, middlename: $scope.editMiddlename, surname: $scope.editSurname
        };

        var addr = {
            street: $scope.editStreet, houseno: $scope.editHouseno, floor: $scope.editFloor, direction: $scope.editDirection, zip: $scope.editZip, town: $scope.editTown, country: $scope.editCountry
        };
        
		var data = {
            email: $scope.editInputEmail,
            name: name,
			address: addr,
            phone: $scope.editPhone
		};
        apiCall(method, url, data);
    };

    $scope.removeNauser = function(nauser) {
        if ($window.confirm('Bekræft venligst at du vil slette deltageren '+nauser.name.firstname)) {
            var method = 'DELETE';
            var url = 'nonactiveusers/'+nauser._id;
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
            $location.path('/usersadmin');
            $route.reload();
        }, function errorCallback(response) {
            console.log(`Status: ${response.status}`);
        });
    };

    $scope.sortByName = function(sortBy, sortDirection) {
        $scope.sorting = true;
        $scope.searching = false;
        $scope.searchcriteria = null;
        $scope.searchtext = "";
        // console.log(`sortBy: ${sortBy}, sortDirection: ${sortDirection}`);
        if (sortBy == "surname") {
            $scope.sortBy = "efternavn";
        } else {
            $scope.sortBy = "fornavn";
        };
        if (sortDirection == "up") {
            $scope.sortDirection = "opad";
        } else {
            $scope.sortDirection = "nedad";
        };
        getUsers(true, sortBy, sortDirection, false, "none", "none");
    };

    $scope.searchUser = function() {
        $scope.searching = true;
        $scope.sorting = false;
        // console.log(`Criteria: ${$scope.searchcriteria}, Text: ${$scope.searchtext}`);
        getUsers(false, "none", "none", true, $scope.searchcriteria, $scope.searchtext);
    };

    $scope.resetSortSearch = function() {
        $scope.searching = false;
        $scope.sorting = false;
        $scope.searchcriteria = null;
        $scope.searchtext = "";
        getUsers(false, "none", "none", false, "none", "none");
    };

    $scope.showPopoverEdit = function(x) {
        $scope.users[x].EditPopoverIsVisible = true;
    };
      
      $scope.hidePopoverEdit = function (x) {
        $scope.users[x].EditPopoverIsVisible = false;
    };

    $scope.showPopoverRem = function(x) {
        $scope.users[x].RemPopoverIsVisible = true; 
    };
      
      $scope.hidePopoverRem = function (x) {
        $scope.users[x].RemPopoverIsVisible = false;
    };

    $scope.showPopoverPwd = function(x) {
        $scope.users[x].PwdPopoverIsVisible = true; 
    };
      
      $scope.hidePopoverPwd = function (x) {
        $scope.users[x].PwdPopoverIsVisible = false;
    };

    $scope.showPopoverR2 = function(x) {
        $scope.users[x].R2PopoverIsVisible = true; 
    };
      
      $scope.hidePopoverR2 = function (x) {
        $scope.users[x].R2PopoverIsVisible = false;
    };

    $scope.showPopoverR1 = function(x) {
        $scope.users[x].R1PopoverIsVisible = true; 
    };
      
      $scope.hidePopoverR1 = function (x) {
        $scope.users[x].R1PopoverIsVisible = false;
    };

    $scope.showPopoverR0 = function(x) {
        $scope.users[x].R0PopoverIsVisible = true; 
    };
      
      $scope.hidePopoverR0 = function (x) {
        $scope.users[x].R0PopoverIsVisible = false;
    };

    $scope.showPopoverEditNauser = function(x) {
        $scope.nausers[x].EditNauserPopoverIsVisible = true;
    };
      
    $scope.hidePopoverEditNauser = function (x) {
        $scope.nausers[x].EditNauserPopoverIsVisible = false;
    };

    $scope.showPopoverRemNauser = function(x) {
        $scope.nausers[x].RemNauserPopoverIsVisible = true; 
    };
      
    $scope.hidePopoverRemNauser = function (x) {
        $scope.nausers[x].RemNauserPopoverIsVisible = false;
    };

    $scope.showPopoverSortFnUp = function() {
        $scope.FnUpPopoverIsVisible = true;
    };
      
    $scope.hidePopoverSortFnUp = function () {
        $scope.FnUpPopoverIsVisible = false;
    };

    $scope.showPopoverSortFnDn = function() {
        $scope.FnDnPopoverIsVisible = true;
    };
      
    $scope.hidePopoverSortFnDn = function () {
        $scope.FnDnPopoverIsVisible = false;
    };

    $scope.showPopoverSortSnUp = function() {
        $scope.SnUpPopoverIsVisible = true;
    };
      
    $scope.hidePopoverSortSnUp = function () {
        $scope.SnUpPopoverIsVisible = false;
    };

    $scope.showPopoverSortSnDn = function() {
        $scope.SnDnPopoverIsVisible = true;
    };
      
    $scope.hidePopoverSortSnDn = function () {
        $scope.SnDnPopoverIsVisible = false;
    };

    aggregateAddress = function(addressObj) {
        var fullAddress = "";
        if (addressObj.hasOwnProperty('street')) {
            fullAddress = addressObj.street;
        };
        if (addressObj.hasOwnProperty('houseno')) {
            fullAddress = fullAddress + " " + addressObj.houseno;
        };
        if (addressObj.hasOwnProperty('floor')) {
            if (fullAddress != "") {fullAddress = fullAddress + ", ";}
            fullAddress = fullAddress + addressObj.floor;
        };
        if (addressObj.hasOwnProperty('direction')) {
            if (fullAddress != "") {fullAddress = fullAddress + " ";}
            fullAddress = fullAddress + addressObj.direction;
        };
        if (addressObj.hasOwnProperty('zip')) {
            if (fullAddress != "") {fullAddress = fullAddress + ", ";}
            fullAddress = fullAddress + addressObj.zip;
        };
        if (addressObj.hasOwnProperty('town')) {
            if (fullAddress != "") {fullAddress = fullAddress + " ";}
            fullAddress = fullAddress + addressObj.town;
        };
        return fullAddress;
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
        // console.log(`UserStatus: ${response.status}`);
        $scope.user = response.data;
        // console.log(`User: ${$scope.user.email}`);
        angular.element(document.querySelector( '#admin' ) ).addClass('active');
        angular.element(document.querySelector( '#usersadmin' ) ).addClass('active');
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
            // console.log(`getUserStatus: ${response.status}`);
            if (response.status == 401) {
                alert('Kodeord og gentaget kodeord skal være ens');
            } else {
                alert('Noget gik galt');
            };
        });

    };

}])
