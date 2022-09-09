angular.module('familielejr')

.controller('eventregCtrl', ['$scope', '$http', '$location', '$route', '$window', 'AuthService', 'YearService', 'EventPriceService', 'EventregService', 
function($scope, $http, $location, $route, $window, AuthService, YearService, EventPriceService, EventregService) {

    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
            $scope.role = AuthService.userRole();
        };
    });

    setTimeout(function(){
        angular.element(document.querySelector( '#nextcamp' ) ).addClass('active');
        angular.element(document.querySelector( '#eventreg' ) ).addClass('active');
    }, 1000);

    var invyear = YearService.myYear("default");
    // console.log(`Invyear in eventregCtrl: ${invyear}`);
    $scope.invitationyear = invyear;

    $scope.agegroups = EventregService.ageGroups();
    $scope.arrivaldays = EventregService.arrivalDays();
    $scope.departuredays = EventregService.departureDays();

    $scope.editRegistration = false;

    $http({
        method: 'GET',
        url: 'eventregs/' + invyear,
        headers: {
            'x-auth': localStorage.userToken
        }
    }).then(function(response) {
        // console.log(`Status: ${response.status}`);
        // console.log(response.data);
        $scope.registrations = response.data;
        for (var i=0; i<$scope.registrations.length; i++) {
            $scope.registrations[i].num = i;
            $scope.registrations[i].EditPopoverIsVisible = false;
            $scope.registrations[i].RemPopoverIsVisible = false;
        }

        $http({
            method: 'GET',
            url: '/invitations/year/'+invyear,
            headers: {
                'x-auth': localStorage.userToken
            }
        }).then(function(response) {
            // console.log(`Success, invitation fetched. Status: ${response.status}`);
            // console.log(response.data.year);
            if (response.data) {
                // console.log(response.data.enddate, response.data.startdate);
                $scope.invitation = response.data;
                invitationExists = true;
            } else {
                console.log('Invitation does not exist');
            };
        }, function errorCallback(response) {
            console.log(`Error. Status: ${response.status}`);
        });

    }, function errorCallback(response) {
        console.log(`Status: ${response.status}`);
    });

    $scope.errorHappened = false;

    $scope.attendPositive = function() {
        $scope.willnotattend = false;
    };
    
    $scope.attendNegative = function() {
        $scope.willattend = false;
    };
    
    $scope.addEventreg = function() {
        // console.log(`Name: ${$scope.regname}`)
        var eventFee = 0;
        var willattend = true;

        if ($scope.willnotattend) {
            willattend = false;
        } else {
            eventFee = EventPriceService.eventFee($scope.arrivalday ,$scope.departureday, $scope.agegroup, $scope.invitation.payment);
            // console.log(`Event Fee: ${eventFee}`);
        };
        
        var eventreg = {
            name: $scope.regname,
            agegroup: $scope.agegroup,
            year: invyear,
            willattend: willattend,
            arrivalday: $scope.arrivalday,
            arrivaltime: $scope.arrivaltime,
            departureday: $scope.departureday,
            departuretime: $scope.departuretime,
            fee: eventFee,
            diet: $scope.diet
        };

        $http({
            method: 'POST',
            url: 'eventregs',
            headers: {
                'x-auth': localStorage.userToken
            },
            data: eventreg
        }).then(function(response) {
            // console.log(`Status: ${response.status}`);
            // console.log(response.data._id);
            $scope.errorHappened = false;
            $location.path('/eventregistration');
            $route.reload();
        }, function errorCallback(response) {
            console.log(`Status: ${response.status}`);
            $scope.errorHappened = true;
        });
    };

    $scope.removeReg = function(registration) {
        if ($window.confirm('Bekræft venligst at du vil slette tilmelding af '+registration.name)) {
            $http({
                method: 'DELETE',
                url: 'eventregs/'+registration._id,
                headers: {
                    'x-auth': localStorage.userToken
                }
            }).then(function(response) {
                // console.log(`Status: ${response.status}`);
                // console.log(response.data._id);
                $scope.errorHappened = false;
                $location.path('/eventregistration');
                $route.reload();
            }, function errorCallback(response) {
                console.log(`Status: ${response.status}`);
                $scope.errorHappened = true;
            });
        };
    };

    $scope.editRegistrationToggle = function(registration) {
        if ($scope.editRegistration) {
            $scope.editRegistration = false;
        } else {
            $scope.editRegistration = true;
        };
        $scope.editRegname = registration.name;
        $scope.editAgegroup = registration.agegroup;
        $scope.willattend = registration.willattend;
        $scope.willnotattend = !registration.willattend;
        $scope.editArrivalday = registration.arrivalday;
        if (registration.arrivaltime == null) {
            $scope.editArrivaltime = null;
        } else {
            $scope.editArrivaltime = new Date(registration.arrivaltime);
        };
        $scope.editDepartureday = registration.departureday;
        if (registration.departuretime == null) {
            $scope.editDeparturetime = null;
        } else {
            $scope.editDeparturetime = new Date(registration.departuretime);
        };
        $scope.editDiet = registration.diet;
        $scope.editPaid = registration.paid;
        $scope.editID = registration._id;
    };

    $scope.editEventreg = function() {
        // console.log(`Name: ${$scope.editRegname}`);
        var eventFee = 0;
        var willattend = true;

        if ($scope.willnotattend) {
            willattend = false
        } else {
            eventFee = EventPriceService.eventFee($scope.editArrivalday ,$scope.editDepartureday, $scope.editAgegroup, $scope.invitation.payment);
            // console.log(`Event Fee: ${eventFee}`);
        };

        var eventreg = {
            name: $scope.editRegname,
            agegroup: $scope.editAgegroup,
            year: invyear,
            willattend: willattend,
            arrivalday: $scope.editArrivalday,
            arrivaltime: $scope.editArrivaltime,
            departureday: $scope.editDepartureday,
            departuretime: $scope.editDeparturetime,
            fee: eventFee,
            diet: $scope.editDiet,
            paid: $scope.editPaid
        };

        $http({
            method: 'PATCH',
            url: 'eventregs/'+$scope.editID,
            headers: {
                'x-auth': localStorage.userToken
            },
            data: eventreg
        }).then(function(response) {
            // console.log(`Status: ${response.status}`);
            // console.log(response.data._id);
            $scope.errorHappened = false;
            $location.path('/eventregistration');
            $route.reload();
        }, function errorCallback(response) {
            console.log(`Status: ${response.status}`);
            $scope.errorHappened = true;
        });
    };

    $scope.cancelEdit = function() {
        $scope.editRegistration = false;
    };

    $scope.showPopoverEdit = function(x) {
        $scope.registrations[x].EditPopoverIsVisible = true;
        // console.log(`EditPopoverVisible`);
    };
      
      $scope.hidePopoverEdit = function (x) {
        $scope.registrations[x].EditPopoverIsVisible = false;
        // console.log(`EditPopoverNOTVisible`);
    };

    $scope.showPopoverRem = function(x) {
        $scope.registrations[x].RemPopoverIsVisible = true; 
        // console.log(`RemPopoverVisible`);
    };
      
      $scope.hidePopoverRem = function (x) {
        $scope.registrations[x].RemPopoverIsVisible = false;
        // console.log(`RemPopoverNOTVisible`);
    };

}])

.controller('eventregallCtrl', ['$scope', '$http', '$window', '$location', '$route', '$routeParams', 'AuthService', 'YearService', 'EventPriceService', 'EventregService',  'SearchService',
function($scope, $http, $window, $location, $route, $routeParams, AuthService, YearService, EventPriceService, EventregService, SearchService) {

    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
            $scope.role = AuthService.userRole();
        };
    });

    setTimeout(function(){
        angular.element(document.querySelector( '#nextcamp' ) ).addClass('active');
        angular.element(document.querySelector( '#eventregall' ) ).addClass('active');
    }, 1000);

    var invyear = $routeParams.year;
    var currentYear = YearService.myYear("default");
    if (invyear < 1990) {
        invyear = currentYear;
    };

    var fys = [];
    var firstyear = 2018;
    for (var y=currentYear; y>=firstyear; y--) {
        fys.push({"fy": y});
    };
    $scope.fys = fys;
    $scope.fyLocked = false;

    // console.log(`Invyear in eventregall: ${invyear}`);
    $scope.invitationyear = invyear;
    $scope.agegroups = EventregService.ageGroups();
    $scope.arrivaldays = EventregService.arrivalDays();
    $scope.departuredays = EventregService.departureDays();
    $scope.editRegistration = false;

    $scope.searching = false;
    $scope.sorting = false;
    $scope.sortBy = "fornavn";
    $scope.sortDirection = "nedad";

    $http({
        method: 'GET',
        url: 'eventregs/all/year/' + invyear
    }).then(function(response) {
        // console.log(`Status: ${response.status}`);
        $scope.registrations = response.data;
        $scope.dinners = [[0,0],[0,0]];
        $scope.breakfasts = [[0,0],[0,0]];
        $scope.lunchs = [[0,0],[0,0]];
        $scope.friday = [0,0];
        $scope.saturday = [0,0];
        $scope.sunday = [0,0];
        $scope.feeSum = 0;
        $scope.feePaidSum = 0;
        for (var i=0; i<$scope.registrations.length; i++) {
            // console.log(`Navn: ${$scope.registrations[i].name}, Arr: ${$scope.registrations[i].arrivalday}, Dep: ${$scope.registrations[i].departureday}`);
            $scope.registrations[i].RemRegistrationPopoverIsVisible = false;
            $scope.registrations[i].EditRegistrationPopoverIsVisible = false;
            $scope.registrations[i].num = i;

            $scope.feeSum += $scope.registrations[i].fee;
            if ($scope.registrations[i].paid) {
                $scope.feePaidSum += $scope.registrations[i].fee;
            };
            if ($scope.registrations[i].agegroup == "Voksen") {ag = 0;} else {ag = 1;};
            if ($scope.registrations[i].willattend) {
                if ($scope.registrations[i].arrivalday == "Fredag") {
                    $scope.dinners[ag][0] += 1;
                    $scope.friday[ag] += 1;
                    if ($scope.registrations[i].departureday == "Søndag efter frokost") {
                        $scope.dinners[ag][1] += 1;
                        $scope.breakfasts[ag][0] += 1;
                        $scope.breakfasts[ag][1] += 1;
                        $scope.lunchs[ag][0] += 1;
                        $scope.lunchs[ag][1] += 1;
                        $scope.saturday[ag] += 1;
                        $scope.sunday[ag] += 1;
                    } else if ($scope.registrations[i].departureday == "Søndag efter morgenmad" || $scope.registrations[i].departureday == "Søndag" || $scope.registrations[i].departureday == "Jeg tager aldrig hjem!!") {
                        $scope.dinners[ag][1] += 1;
                        $scope.breakfasts[ag][0] += 1;
                        $scope.breakfasts[ag][1] += 1;
                        $scope.lunchs[ag][0] += 1;
                        $scope.saturday[ag] += 1;
                        $scope.sunday[ag] += 1;
                    } else if ($scope.registrations[i].departureday == "Lørdag efter aftensmad") {
                        $scope.dinners[ag][1] += 1;
                        $scope.breakfasts[ag][0] += 1;
                        $scope.lunchs[ag][0] += 1;
                        $scope.saturday[ag] += 1;
                    } else if ($scope.registrations[i].departureday == "Lørdag eftermiddag") {
                        $scope.breakfasts[ag][0] += 1;
                        $scope.lunchs[ag][0] += 1;
                        $scope.saturday[ag] += 1;
                    } else if ($scope.registrations[i].departureday == "Lørdag formiddag") {
                        $scope.breakfasts[ag][0] += 1;
                        $scope.saturday[ag] += 1;
                    };
                } else if ($scope.registrations[i].arrivalday == "Lørdag formiddag") {
                    if ($scope.registrations[i].departureday == "Søndag efter frokost") {
                        $scope.dinners[ag][1] += 1;
                        $scope.breakfasts[ag][1] += 1;
                        $scope.lunchs[ag][0] += 1;
                        $scope.lunchs[ag][1] += 1;
                        $scope.saturday[ag] += 1;
                        $scope.sunday[ag] += 1;
                    } else if ($scope.registrations[i].departureday == "Søndag efter morgenmad" || $scope.registrations[i].departureday == "Søndag" || $scope.registrations[i].departureday == "Jeg tager aldrig hjem!!") {
                        $scope.dinners[ag][1] += 1;
                        $scope.breakfasts[ag][1] += 1;
                        $scope.lunchs[ag][0] += 1;
                        $scope.saturday[ag] += 1;
                        $scope.sunday[ag] += 1;
                    } else if ($scope.registrations[i].departureday == "Lørdag efter aftensmad") {
                        $scope.dinners[ag][1] += 1;
                        $scope.lunchs[ag][0] += 1;
                        $scope.saturday[ag] += 1;
                    } else if ($scope.registrations[i].departureday == "Lørdag eftermiddag") {
                        $scope.lunchs[ag][0] += 1;
                        $scope.saturday[ag] += 1;
                    };
                } else if ($scope.registrations[i].arrivalday == "Lørdag eftermiddag") {
                    if ($scope.registrations[i].departureday == "Søndag efter frokost") {
                        $scope.dinners[ag][1] += 1;
                        $scope.breakfasts[ag][1] += 1;
                        $scope.lunchs[ag][1] += 1;
                        $scope.saturday[ag] += 1;
                        $scope.sunday[ag] += 1;
                    } else if ($scope.registrations[i].departureday == "Søndag efter morgenmad" || $scope.registrations[i].departureday == "Søndag" || $scope.registrations[i].departureday == "Jeg tager aldrig hjem!!") {
                        $scope.dinners[ag][1] += 1;
                        $scope.breakfasts[ag][1] += 1;
                        $scope.saturday[ag] += 1;
                        $scope.sunday[ag] += 1;
                    } else if ($scope.registrations[i].departureday == "Lørdag efter aftensmad") {
                        $scope.dinners[ag][1] += 1;
                        $scope.saturday[ag] += 1;
                    };
                };
            };
/* 
            console.log(`Voksne. Aftensmad fredag: ${$scope.dinners[0][0]}, lørdag: ${$scope.dinners[0][1]}`);
            console.log(`Voksne. Morgenmad lørdag: ${$scope.breakfasts[0][0]}, søndag: ${$scope.breakfasts[0][1]}`);
            console.log(`Voksne. Frokost lørdag: ${$scope.lunchs[0][0]}, søndag: ${$scope.lunchs[0][1]}`);
            console.log(`Voksne. Fredag: ${$scope.friday[0]}, Lørdag: ${$scope.saturday[0]}, søndag: ${$scope.sunday[0]}`);
            console.log(`Børn. Aftensmad fredag: ${$scope.dinners[1][0]}, lørdag: ${$scope.dinners[1][1]}`);
            console.log(`Børn. Morgenmad lørdag: ${$scope.breakfasts[1][0]}, søndag: ${$scope.breakfasts[1][1]}`);
            console.log(`Børn. Frokost lørdag: ${$scope.lunchs[1][0]}, søndag: ${$scope.lunchs[1][1]}`);
            console.log(`Børn. Fredag: ${$scope.friday[1]}, Lørdag: ${$scope.saturday[1]}, søndag: ${$scope.sunday[1]}`);
 */            
        };
/* 
        console.log(`Voksne. Aftensmad fredag: ${$scope.dinners[0][0]}, lørdag: ${$scope.dinners[0][1]}`);
        console.log(`Voksne. Morgenmad lørdag: ${$scope.breakfasts[0][0]}, søndag: ${$scope.breakfasts[0][1]}`);
        console.log(`Voksne. Frokost lørdag: ${$scope.lunchs[0][0]}, søndag: ${$scope.lunchs[0][1]}`);
        console.log(`Voksne. Lørdag: ${$scope.saturday[0]}, søndag: ${$scope.sunday[0]}`);
        console.log(`Børn. Aftensmad fredag: ${$scope.dinners[1][0]}, lørdag: ${$scope.dinners[1][1]}`);
        console.log(`Børn. Morgenmad lørdag: ${$scope.breakfasts[1][0]}, søndag: ${$scope.breakfasts[1][1]}`);
        console.log(`Børn. Frokost lørdag: ${$scope.lunchs[1][0]}, søndag: ${$scope.lunchs[1][1]}`);
        console.log(`Børn. Lørdag: ${$scope.saturday[1]}, søndag: ${$scope.sunday[1]}`);
 */        

        return $http({
            method: 'GET',
            url: '/fiscalyears/year/'+invyear,
            headers: {
                'x-auth': localStorage.userToken
            }
        });
    }).then(function(fiscalyear) {
        // console.log(`Success. Status: ${fiscalyear.status}`);
        if (fiscalyear.locked) {
            $scope.fyLocked = true;
            // console.log(`FY is locked`);
        } else {
            // console.log(`FY is NOT locked`);
        };
        return $http({
            method: 'GET',
            url: '/invitations/year/'+invyear,
            headers: {
                'x-auth': localStorage.userToken
            }
        });
    }).then(function(invitation) {
        // console.log(`Success, invitation fetched. Status: ${invitation.status}`);
        // console.log(invitation.data.year);
        if (invitation.data) {
            // console.log(invitation.data.enddate, invitation.data.startdate);
            $scope.invitation = invitation.data;
            invitationExists = true;
        } else {
            console.log('Invitation does not exist');
        };
    }, function errorCallback(response) {
        console.log(`Status: ${response.status}`);
    });

    $scope.sortByName = function(sortDirection) {
        $scope.sorting = true;
        $scope.searching = false;
        $scope.searchtext = "";
        // console.log(`sortDirection: ${sortDirection}`);
        if (sortDirection == "up") {
            $scope.sortDirection = "opad";
        } else {
            $scope.sortDirection = "nedad";
        };
        getEventregs(true, sortDirection, false, "none");
    };

    $scope.searchUser = function() {
        $scope.searching = true;
        $scope.sorting = false;
        // console.log(`Text: ${$scope.searchtext}`);
        getEventregs(false, "none", true, $scope.searchtext);
    };

    $scope.resetSortSearch = function() {
        $scope.searching = false;
        $scope.sorting = false;
        $scope.searchtext = "";
        getEventregs(false, "none", false, "none");
    };

    getEventregs = function(sortOrNot, sortDirection, searchOrNot, searchText) {
        var url = "eventregs/all/";
        if (sortOrNot) {
            url = `${url}sort/${$scope.invitationyear}/${sortDirection}`;
        } else if (searchOrNot) {
            url = `${url}search/${$scope.invitationyear}/${searchText}`;
        } else {
            url = `${url}year/${$scope.invitationyear}`;
        };
        // console.log(`url: ${url}`);
        $http({
            method: 'GET',
            url: url
        }).then(function(response) {
            // console.log(`Status: ${response.status}`);
            // console.log(response.data);
            $scope.registrations = response.data;
        }, function errorCallback(response) {
            console.log(`Status: ${response.status}`);
        });
    };

    $scope.adminRemoveReg = function(registration) {
        if ($window.confirm('Bekræft venligst at du vil slette tilmelding af '+registration.name)) {
            $http({
                method: 'DELETE',
                url: 'eventregs/admin/'+registration._id,
                headers: {
                    'x-auth': localStorage.userToken
                }
            }).then(function(response) {
                console.log(`Status: ${response.status}`);
                console.log(response.data._id);
                $scope.errorHappened = false;
                $location.path(`/eventregistrationall/${registration.year}`);
                $route.reload();
            }, function errorCallback(response) {
                console.log(`Status: ${response.status}`);
                $scope.errorHappened = true;
            });
        };
    };

    $scope.paidStatus = function(registration) {
        // console.log(`Payment status: ${registration.paid}`);
        var data = {
            name: registration.name,
            agegroup: registration.agegroup,
            year: registration.year,
            arrivalday: registration.arrivalday,
            arrivaltime: registration.arrivaltime,
            departureday: registration.departureday,
            departuretime: registration.departuretime,
            diet: registration.diet,
            _creator: registration._creator,
            registeree: registration.registeree,
            paid: registration.paid
        };

        $http({
            method: 'PATCH',
            url: '/eventregs/'+registration._id,
            headers: {
                'x-auth': localStorage.userToken
            },
            data: data
        }).then(function(response) {
            $location.path(`/eventregistrationall/${registration.year}`);
            // $route.reload();
        }, function errorCallback(response) {
            console.log(`editEventregStatus: ${response.status}`);
        });

    };

    $scope.attendPositive = function() {
        $scope.willnotattend = false;
    };
    
    $scope.attendNegative = function() {
        $scope.willattend = false;
    };
    
    $scope.editRegistrationToggle = function(registration) {
        if ($scope.editRegistration) {
            $scope.editRegistration = false;
        } else {
            $scope.editRegistration = true;
        };
        $scope.editRegname = registration.name;
        $scope.editAgegroup = registration.agegroup;
        $scope.willattend = registration.willattend;
        $scope.willnotattend = !registration.willattend;
        $scope.editArrivalday = registration.arrivalday;
        if (registration.arrivaltime == null) {
            $scope.editArrivaltime = null;
        } else {
            $scope.editArrivaltime = new Date(registration.arrivaltime);
        };
        $scope.editDepartureday = registration.departureday;
        if (registration.departuretime == null) {
            $scope.editDeparturetime = null;
        } else {
            $scope.editDeparturetime = new Date(registration.departuretime);
        };
        $scope.editDiet = registration.diet;
        $scope.editPaid = registration.paid;
        $scope.editID = registration._id;
    };

    $scope.editEventreg = function() {
        console.log(`In AllEventReg controller, editEventreg. Name: ${$scope.editRegname}`)
        var eventFee = 0;
        var willattend = true;

        if ($scope.willnotattend) {
            willattend = false
        } else {
            eventFee = EventPriceService.eventFee($scope.editArrivalday ,$scope.editDepartureday, $scope.editAgegroup, $scope.invitation.payment);
            console.log(`Arrivalday: ${$scope.editArrivalday}, Departureday: ${$scope.editDepartureday}, Event Fee: ${eventFee}`);
        };

        var eventreg = {
            name: $scope.editRegname,
            agegroup: $scope.editAgegroup,
            year: invyear,
            willattend: willattend,
            arrivalday: $scope.editArrivalday,
            arrivaltime: $scope.editArrivaltime,
            departureday: $scope.editDepartureday,
            departuretime: $scope.editDeparturetime,
            diet: $scope.editDiet,
            fee: eventFee,
            paid: $scope.editPaid
        };

        $http({
            method: 'PATCH',
            url: 'eventregs/'+$scope.editID,
            headers: {
                'x-auth': localStorage.userToken
            },
            data: eventreg
        }).then(function(response) {
            // console.log(`Status: ${response.status}`);
            // console.log(response.data._id);
            $scope.errorHappened = false;
            $location.path('/eventregistrationall/'+invyear);
            $route.reload();
        }, function errorCallback(response) {
            console.log(`Status: ${response.status}`);
            $scope.errorHappened = true;
        });
    };

    $scope.cancelEdit = function() {
        $scope.editRegistration = false;
    };

    $scope.recalcFees = function() {

        // console.log(`In recalcfees: Adult, two days: ${priceModel.adult[1].price}`);

        for (var i=0; i<$scope.registrations.length; i++) {
            var eventFee = 0;
            if ($scope.registrations[i].willattend) {
                eventFee = EventPriceService.eventFee($scope.registrations[i].arrivalday ,$scope.registrations[i].departureday, $scope.registrations[i].agegroup, $scope.invitation.payment);
                // console.log(`Event Fee in recalcFees: ${eventFee}`);
            };
            
    
            $http({
                method: 'PATCH',
                url: 'eventregs/fee/'+$scope.registrations[i]._id,
                headers: {
                    'x-auth': localStorage.userToken
                },
                data: {eventFee: eventFee}
            }).then(function(response) {
                // console.log(`Status of recalcFee ${i}: ${response.status}`);
                // console.log(response.data._id);
            }, function errorCallback(response) {
                console.log(`Error Status, recalcFee ${i}: ${response.status}`);
            });
        };
            
        setTimeout(function(){
            $location.path('/eventregistrationall/'+invyear);
            $route.reload();
        }, 1000);
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
		$location.path('/eventregistrationall/'+$scope.fy);
        $route.reload();
    };

    $scope.showPopoverEditRegistration = function(x) {
        $scope.registrations[x].EditRegistrationPopoverIsVisible = true;
    };
      
    $scope.hidePopoverEditRegistration = function (x) {
        $scope.registrations[x].EditRegistrationPopoverIsVisible = false;
    };

    $scope.showPopoverRemRegistration = function(x) {
        $scope.registrations[x].RemRegistrationPopoverIsVisible = true; 
    };
      
    $scope.hidePopoverRemRegistration = function (x) {
        $scope.registrations[x].RemRegistrationPopoverIsVisible = false;
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

    // Not currently used
    $scope.showPopoverExcelFileInfo = function() {
        console.log(`Show`);
        $scope.ExcelFileInfoPopoverIsVisible = true; 
    };
      
    // Not currently used
    $scope.hidePopoverExcelFileInfo = function () {
        console.log(`Hide`);
        $scope.ExcelFileInfoPopoverIsVisible = false;
    };
    
}])

