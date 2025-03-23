angular.module('familielejr')

.controller('eventregCtrl', ['$scope', '$http', '$location', '$route', '$window', 'AuthService', 'EventregService', 
function($scope, $http, $location, $route, $window, AuthService, EventregService) {

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

    // $scope.agegroups = EventregService.ageGroups();
    // $scope.arrivaldays = EventregService.arrivalDays();
    // $scope.departuredays = EventregService.departureDays();

    $scope.editRegistration = false;
    $scope.invitationExists = false;
    $scope.invitationSelected = false;
    $scope.registrationsExist = false;

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
            url: 'events/farevents',
            headers: {
                'x-auth': localStorage.userToken
            }
        });
    }).then(function(faevents) {
        // console.log(`faevents Status: ${faevents.status}`);
        if (faevents.data) {
            $scope.faevents = faevents.data;
            $scope.invitationExists = true;
            if ($scope.faevents.length == 1) {
                $scope.selectedInvitation = $scope.faevents[0];
                $scope.selEvent = JSON.stringify($scope.selectedInvitation);
                // console.log(`Selected event: ${$scope.selEvent}`);
                getInvitationData();
            };
        } else {
            $scope.invitationExists = false;
        };

    }, function errorCallback(response) {
        console.log(`Status: ${response.status}`);
    });

    getInvitationData = function() {
        $scope.arrivalOptions = EventregService.arrivalOptions($scope.selectedInvitation.startdate, $scope.selectedInvitation.invitation.starttime, $scope.selectedInvitation.enddate);
        $scope.departureOptions = EventregService.departureOptions($scope.selectedInvitation.startdate, $scope.selectedInvitation.invitation.starttime, $scope.selectedInvitation.enddate);
        /* for (arrOpt in $scope.arrivalOptions) {
            console.log(`Arrival option: ${$scope.arrivalOptions[arrOpt].arrivalOption}`);
        };
        for (depOpt in $scope.departureOptions) {
            console.log(`Departure option: ${$scope.departureOptions[depOpt].departureOption}`);
        }; */
        $http({
            method: 'GET',
            url: '/eventtypes/'+$scope.selectedInvitation._eventtype,
            headers: {
                'x-auth': localStorage.userToken
            }
        }).then(function(eventtype) {
            // console.log(`Success, eventtype fetched. Status: ${eventtype.status}`);
            if (eventtype.data) {
                // console.log(`Eventtype Name: ${eventtype.data.eventtypeName}`);
                $scope.eventtype = eventtype.data;
                // console.log(`Eventtype Name: ${$scope.eventtype.eventtypeName}. Number categories: ${$scope.eventtype.participantCategories.length}`);
                /* for (var u=0; u<$scope.eventtype.participantCategories.length; u++) {
                    console.log(`Cat name: ${$scope.eventtype.participantCategories[u].name}`);
                }; */
                $scope.invitationSelected = true;
            } else {
                console.log('Eventtype does not exist');
            };

            return $http({
                method: 'GET',
                url: 'eventregs/event/' + $scope.selectedInvitation._id,
                headers: {
                    'x-auth': localStorage.userToken
                }
            });
        }).then(function(registrations) {
            // console.log(`Registrations status: ${registrations.status}`);
            if (registrations.data) {
                $scope.registrationsExist = true
                $scope.registrations = registrations.data;
                // console.log(`Num registrations: ${$scope.registrations.length}`);
                for (var i=0; i<$scope.registrations.length; i++) {
                    $scope.registrations[i].num = i;
                    $scope.registrations[i].EditPopoverIsVisible = false;
                    $scope.registrations[i].RemPopoverIsVisible = false;
                };
            };
    
        }, function errorCallback(response) {
            console.log(`Error. Status: ${response.status}`);
        });
    };

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
        partCat = JSON.parse($scope.participantCategory);

        if ($scope.willnotattend) {
            willattend = false;
        } else {
            var numDays = EventregService.numDays($scope.arrivalOption, $scope.departureOption);
            // console.log(`numDays: ${numDays}`);
            if (numDays == 1) {
                eventFee = partCat.priceDay;
            } else {
                eventFee = partCat.priceFull;
            };
            // console.log(`Event Fee: ${eventFee}`);
        };

        var startDate = new Date($scope.selectedInvitation.startdate);
        var year = startDate.getFullYear();
        
        var eventreg = {
            name: $scope.regname,
            _event: $scope.selectedInvitation._id,
            // agegroup: $scope.agegroup,
            participantCategory: partCat.name,
            year: year,
            willattend: willattend,
            // arrivalday: $scope.arrivalday,
            arrivalOption: $scope.arrivalOption,
            arrivaltime: $scope.arrivaltime,
            // departureday: $scope.departureday,
            departureOption: $scope.departureOption,
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
            $location.path('/eventregistration');
            $route.reload();
        }, function errorCallback(response) {
            console.log(`Status: ${response.status}`);
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
                $location.path('/eventregistration');
                $route.reload();
            }, function errorCallback(response) {
                console.log(`Status: ${response.status}`);
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
        $scope.editPartCat = registration.participantCategory;
        $scope.editYear = registration.year;
        $scope.willattend = registration.willattend;
        $scope.willnotattend = !registration.willattend;
        $scope.editArrivalOption = registration.arrivalOption;
        if (registration.arrivaltime == null) {
            $scope.editArrivaltime = null;
        } else {
            $scope.editArrivaltime = new Date(registration.arrivaltime);
        };
        $scope.editDepartureOption = registration.departureOption;
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
        // console.log(`In editEventreg. Name: ${$scope.editRegname}`);
        var eventFee = 0;
        var willattend = true;
        partCat = $scope.eventtype.participantCategories.filter(obj => {
            return obj.name == $scope.editPartCat
        })[0];
        // console.log(`In editRegistrationToggle. editPartCat: ${editPartCat.name}`);
        // console.log(`editPartCat stringified: ${JSON.stringify(editPartCat)}`);

        if ($scope.willnotattend) {
            willattend = false
        } else {
            var numDays = EventregService.numDays($scope.editArrivalOption, $scope.editDepartureOption);
            // console.log(`numDays: ${numDays}`);
            if (numDays == 1) {
                eventFee = partCat.priceDay;
            } else {
                eventFee = partCat.priceFull;
            };
            // eventFee = EventPriceService.eventFee($scope.editArrivalday ,$scope.editDepartureday, $scope.editAgegroup, $scope.invitation.payment);
            // console.log(`Event Fee: ${eventFee}`);
        };

        var eventreg = {
            name: $scope.editRegname,
            participantCategory: $scope.editPartCat,
            year: $scope.editYear,
            willattend: willattend,
            arrivalOption: $scope.editArrivalOption,
            arrivaltime: $scope.editArrivaltime,
            departureOption: $scope.editDepartureOption,
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
            $location.path('/eventregistration');
            $route.reload();
        }, function errorCallback(response) {
            console.log(`Status: ${response.status}`);
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

.controller('eventregallCtrl', ['$scope', '$http', '$window', '$location', '$route', '$routeParams', 'AuthService', 'EventregService',  'SearchService',
function($scope, $http, $window, $location, $route, $routeParams, AuthService, EventregService, SearchService) {

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

    var _event_id = $routeParams.id;
    $scope._event_id = _event_id;
    // console.log(`_event_id: ${_event_id}`);
    $scope.fyLocked = false;

    $scope.invitationExists = false;
    $scope.invitationSelected = false;
    $scope.registrationsExist = false;
    $scope.editRegistration = false;
    $scope.selectInvitationText = "Der er flere, aktive begivenheder. Vælg begivenhed:";

    $scope.searching = false;
    $scope.sorting = false;
    $scope.sortBy = "fornavn";
    $scope.sortDirection = "nedad";

    $http({
        method: 'GET',
        url: 'tenants/mytenant',
        headers: {
            'x-auth': localStorage.userToken
        }
    }).then(function(tenant) {
        // console.log(`Tenant fetched. Status: ${tenant.status}`);
        $scope.tenantName = tenant.data.tenantName;
        $scope.tenant = tenant.data;
        var currentyear = (new Date()).getFullYear();
        var firstyear = $scope.tenant.startYear;
        $scope.fys = [];
        for (var y=currentyear; y>=firstyear; y--) {
            $scope.fys.push({"fy": y});
        };
        return $http({
            method: 'GET',
            url: 'events/arevents',
            headers: {
                'x-auth': localStorage.userToken
            }
        });
    }).then(function(arevents) {
        // console.log(`arevents Status: ${arevents.status}. # arevents: ${arevents.data.length}`);
        if (arevents.data.length > 0) {
            $scope.arevents = arevents.data;
        } else {
            console.log(`There are no events`);
        };

        if (_event_id == 1000) {
            // console.log(`No specific event. _event_id: ${_event_id}`);
            $http({
                method: 'GET',
                url: 'events/futureactiveevents',
                headers: {
                    'x-auth': localStorage.userToken
                }
            }).then(function(faevents) {
                // console.log(`Events selected by future and active invitation. faevents Status: ${faevents.status}. # events: ${faevents.data.length}`);
                // console.log(`${JSON.stringify(faevents.data)}`);
                if (faevents.data.length > 0) {
                    $scope.faevents = faevents.data;
                    $scope.invitationExists = true;
                    if ($scope.faevents.length == 1) {
                        // console.log(`One event: ${$scope.faevents[0].eventName}`);
                        $scope.selectedInvitation = $scope.faevents[0];
                        $scope.selEvent = JSON.stringify($scope.selectedInvitation);
                        // console.log(`OK. Selected event: ${$scope.selEvent}`);
                        getInvitationData();
                    };
                } else {
                    $scope.selectInvitationText = "Der er ikke nogen aktiv begivenhed. Vil du se på en anden? Vælg her:"
                    $scope.invitationExists = false;
                    if ($scope.arevents) {
                        $scope.faevents = $scope.arevents;
                        if ($scope.faevents.length == 1) {
                                $scope.selectedInvitation = $scope.faevents[0];
                                $scope.selEvent = JSON.stringify($scope.selectedInvitation);
                                // console.log(`Selected event: ${$scope.selEvent}`);
                                getInvitationData();
                        };
                    } else {
                        $scope.invitationExists = false;
                        $location.path(`/eventregistrationall/1000`);
                    };
                };

            }, function errorCallback(response) {
                console.log(`Status: ${response.status}`);
            });
        } else if (_event_id > 1991 && _event_id < 2100) {
            // console.log(`Fetch event based on year instead of _event_id.`);
            $http({
                method: 'GET',
                url: 'events/year/' + _event_id,
                headers: {
                    'x-auth': localStorage.userToken
                }
            }).then(function(yearevents) {
                // console.log(`Events selected by year. yearevents Status: ${yearevents.status}. # events: ${yearevents.data.length}`);
                // console.log(`${JSON.stringify(yearevents.data)}`);
                if (yearevents.data.length > 0) {
                    // console.log(`There are at least one event for the year ${_event_id}`);
                    $scope.faevents = yearevents.data;
                    $scope.invitationExists = true;
                    if ($scope.faevents.length == 1) {
                        // console.log(`One event: ${$scope.faevents[0].eventName}`);
                        $scope.selectedInvitation = $scope.faevents[0];
                        $scope.selEvent = JSON.stringify($scope.selectedInvitation);
                        // console.log(`Selected event: ${$scope.selEvent}`);
                        getInvitationData();
                    } else {
                        $scope.selectInvitationText = "Der er flere begivenheder i " + _event_id + ". Vælg her:";
                    };
                } else {
                    console.log(`There was no events. # arevents: ${$scope.arevents.length}`);
                    $scope.invitationExists = false;
                    if ($scope.arevents.length > 0) {
                        // console.log(`There are other active events, all years.`);
                        $scope.faevents = $scope.arevents;
                        if ($scope.faevents.length == 1) {
                            // console.log(`Only one event: ${$scope.faevents[0].eventName}`);
                            $scope.selectedInvitation = $scope.faevents[0];
                            $scope.selEvent = JSON.stringify($scope.selectedInvitation);
                            // console.log(`Selected event: ${$scope.selEvent}`);
                            getInvitationData();
                        } else {
                            $scope.selectInvitationText = "Der er ikke nogen begivenheder i " + _event_id + ". Vil du se en anden? Vælg her:";
                        };
                    } else {
                        $scope.invitationExists = false;
                        $location.path(`/eventregistrationall/1000`);
                    };
                };

            }, function errorCallback(response) {
                console.log(`Status: ${response.status}`);
            });
        } else {
            // console.log(`Specific event. _event_id: ${_event_id}`);
            $http({
                method: 'GET',
                url: 'events/' + _event_id,
                headers: {
                    'x-auth': localStorage.userToken
                }
            }).then(function(event) {
                // console.log(`Specific event. Status: ${event.status}`);
                $scope.selectedInvitation = event.data.event;
                $scope.invitationExists = true;
                // console.log(`Event Name: ${$scope.selectedInvitation.eventName}, startdate: ${$scope.selectedInvitation.startdate}`);
                $scope.selEvent = JSON.stringify($scope.selectedInvitation);
                // console.log(`OK. Selected event: ${$scope.selEvent}`);
                getInvitationData();

            }, function errorCallback(response) {
                console.log(`Status: ${response.status}`);
            });
        };

    }, function errorCallback(response) {
        console.log(`Status: ${response.status}`);
    });

    /* $scope.convertToEvents = function() {
        console.log(`Year: ${$scope._event_id}`);
        $http({
            method: 'GET',
            url: 'events/year/' + $scope._event_id,
            headers: {
                'x-auth': localStorage.userToken
            }
        }).then(function(events) {
            console.log(`Events fetched. Status: ${events.status}. # Events: ${events.data.length}`);
            if (events.data.length > 0) {
                convertForEvent = events.data[0];
                $http({
                    method: 'GET',
                    url: 'eventregs/all/year/' + $scope._event_id,
                    headers: {
                        'x-auth': localStorage.userToken
                    }
                }).then(function(eventregs) {
                    if (eventregs.data.length > 0) {
                        for (er in eventregs.data) {
                            var departureday = eventregs.data[er].departureday;
                            if (eventregs.data[er].departureday == "Søndag efter morgenmad" || eventregs.data[er].departureday == "Søndag efter frokost") {
                                departureday = "Søndag";
                            };
                            data = {
                                participantCategory: eventregs.data[er].agegroup,
                                arrivalOption: eventregs.data[er].arrivalday,
                                departureOption: departureday,
                                _event: convertForEvent._id
                            };
                            console.log(`DATA: ${JSON.stringify(data)}`);
                            $http({
                                method: 'PATCH',
                                url: 'eventregs/convertToEvents/'+eventregs.data[er]._id,
                                headers: {
                                    'x-auth': localStorage.userToken
                                },
                                data: data
                            }).then(function(response) {
                                console.log(`Status: ${response.status}`);
                                console.log(response.data._id);
                            }, function errorCallback(response) {
                                console.log(`Status: ${response.status}`);
                            });
                    
                        };

                    };
                }, function errorCallback(response) {
                    console.log(`Status: ${response.status}`);
                });
            };
            $location.path('/eventregistrationall/' + $scope._event_id);
            $route.reload();
    
        }, function errorCallback(response) {
            console.log(`Status: ${response.status}`);
        });
    }; */

    getInvitationData = function() {
        $scope.arrivalOptions = EventregService.arrivalOptions($scope.selectedInvitation.startdate, $scope.selectedInvitation.invitation.starttime, $scope.selectedInvitation.enddate);
        $scope.departureOptions = EventregService.departureOptions($scope.selectedInvitation.startdate, $scope.selectedInvitation.invitation.starttime, $scope.selectedInvitation.enddate);
        /* for (arrOpt in $scope.arrivalOptions) {
            console.log(`Arrival option: ${$scope.arrivalOptions[arrOpt].arrivalOption}`);
        };
        for (depOpt in $scope.departureOptions) {
            console.log(`Departure option: ${$scope.departureOptions[depOpt].departureOption}`);
        }; */
        var invyear = $scope.selectedInvitation.year;
        $scope.invitationyear = invyear;
        // console.log(`In getInvitationData. invyear: ${invyear}`);
        _event_id = $scope.selectedInvitation._id;
        $http({
            method: 'GET',
            url: '/eventtypes/'+$scope.selectedInvitation._eventtype,
            headers: {
                'x-auth': localStorage.userToken
            }
        }).then(function(eventtype) {
            // console.log(`Success, eventtype fetched. Status: ${eventtype.status}`);
            if (eventtype.data) {
                // console.log(`Eventtype Name: ${eventtype.data.eventtypeName}`);
                $scope.eventtype = eventtype.data;
                // console.log(`Eventtype Name: ${$scope.eventtype.eventtypeName}. Number categories: ${$scope.eventtype.participantCategories.length}`);
                /* for (var u=0; u<$scope.eventtype.participantCategories.length; u++) {
                    console.log(`Cat name: ${$scope.eventtype.participantCategories[u].name}`);
                }; */
                $scope.invitationSelected = true;
            } else {
                console.log('Eventtype does not exist');
            };

            return $http({
                method: 'GET',
                url: 'eventregs/all/event/' + $scope.selectedInvitation._id,
                headers: {
                    'x-auth': localStorage.userToken
                }
            });
        }).then(function(registrations) {
            // console.log(`Registrations status: ${registrations.status}`);
            if (registrations.data) {
                $scope.registrationsExist = true
                $scope.registrations = registrations.data;
                // console.log(`Num registrations: ${$scope.registrations.length}`);

                for (var i=0; i<$scope.registrations.length; i++) {
                    $scope.registrations[i].num = i;
                    $scope.registrations[i].EditPopoverIsVisible = false;
                    $scope.registrations[i].RemPopoverIsVisible = false;
                };
                
                $scope.numAttendees = 0;
                $scope.numNonAttendees = 0;
                $scope.dinners = [[0,0],[0,0]];
                $scope.breakfasts = [[0,0],[0,0]];
                $scope.lunchs = [[0,0],[0,0]];
                $scope.friday = [0,0];
                $scope.saturday = [0,0];
                $scope.sunday = [0,0];
                $scope.feeSum = 0;
                $scope.feePaidSum = 0;
                for (var i=0; i<$scope.registrations.length; i++) {
                    // console.log(`Navn: ${$scope.registrations[i].name}, Arr: ${$scope.registrations[i].arrivalOption}, Dep: ${$scope.registrations[i].departureOption}`);
                    $scope.registrations[i].RemRegistrationPopoverIsVisible = false;
                    $scope.registrations[i].EditRegistrationPopoverIsVisible = false;
                    $scope.registrations[i].num = i;
        
                    $scope.feeSum += $scope.registrations[i].fee;
                    if ($scope.registrations[i].paid) {
                        $scope.feePaidSum += $scope.registrations[i].fee;
                    };
                    if ($scope.registrations[i].participantCategory == "Voksen") {ag = 0;} else {ag = 1;};
                    if ($scope.registrations[i].willattend) {
                        $scope.numAttendees += 1;
                        if ($scope.registrations[i].arrivalOption == "Fredag" || $scope.registrations[i].arrivalOption == "Fredag eftermiddag") {
                            $scope.dinners[ag][0] += 1;
                            $scope.friday[ag] += 1;
                            if ($scope.registrations[i].departureOption == "Søndag efter morgenmad" || $scope.registrations[i].departureOption == "Søndag" || $scope.registrations[i].departureOption == "Jeg tager aldrig hjem!!") {
                                $scope.dinners[ag][1] += 1;
                                $scope.breakfasts[ag][0] += 1;
                                $scope.breakfasts[ag][1] += 1;
                                $scope.lunchs[ag][0] += 1;
                                $scope.saturday[ag] += 1;
                                $scope.sunday[ag] += 1;
                            } else if ($scope.registrations[i].departureOption == "Lørdag efter aftensmad") {
                                $scope.dinners[ag][1] += 1;
                                $scope.breakfasts[ag][0] += 1;
                                $scope.lunchs[ag][0] += 1;
                                $scope.saturday[ag] += 1;
                            } else if ($scope.registrations[i].departureOption == "Lørdag eftermiddag") {
                                $scope.breakfasts[ag][0] += 1;
                                $scope.lunchs[ag][0] += 1;
                                $scope.saturday[ag] += 1;
                            } else if ($scope.registrations[i].departureOption == "Lørdag formiddag") {
                                $scope.breakfasts[ag][0] += 1;
                                $scope.saturday[ag] += 1;
                            };
                        } else if ($scope.registrations[i].arrivalOption == "Lørdag formiddag") {
                            if ($scope.registrations[i].departureOption == "Søndag efter morgenmad" || $scope.registrations[i].departureOption == "Søndag" || $scope.registrations[i].departureOption == "Jeg tager aldrig hjem!!") {
                                $scope.dinners[ag][1] += 1;
                                $scope.breakfasts[ag][1] += 1;
                                $scope.lunchs[ag][0] += 1;
                                $scope.saturday[ag] += 1;
                                $scope.sunday[ag] += 1;
                            } else if ($scope.registrations[i].departureOption == "Lørdag efter aftensmad") {
                                $scope.dinners[ag][1] += 1;
                                $scope.lunchs[ag][0] += 1;
                                $scope.saturday[ag] += 1;
                            } else if ($scope.registrations[i].departureOption == "Lørdag eftermiddag") {
                                $scope.lunchs[ag][0] += 1;
                                $scope.saturday[ag] += 1;
                            };
                        } else if ($scope.registrations[i].arrivalOption == "Lørdag eftermiddag") {
                            if ($scope.registrations[i].departureOption == "Søndag efter frokost") {
                                $scope.dinners[ag][1] += 1;
                                $scope.breakfasts[ag][1] += 1;
                                $scope.lunchs[ag][1] += 1;
                                $scope.saturday[ag] += 1;
                                $scope.sunday[ag] += 1;
                            } else if ($scope.registrations[i].departureOption == "Søndag efter morgenmad" || $scope.registrations[i].departureOption == "Søndag" || $scope.registrations[i].departureOption == "Jeg tager aldrig hjem!!") {
                                $scope.dinners[ag][1] += 1;
                                $scope.breakfasts[ag][1] += 1;
                                $scope.saturday[ag] += 1;
                                $scope.sunday[ag] += 1;
                            } else if ($scope.registrations[i].departureOption == "Lørdag efter aftensmad") {
                                $scope.dinners[ag][1] += 1;
                                $scope.saturday[ag] += 1;
                            };
                        };
                    } else {
                        $scope.numNonAttendees += 1;
                    };
        
                    /* console.log(`Voksne. Aftensmad fredag: ${$scope.dinners[0][0]}, lørdag: ${$scope.dinners[0][1]}`);
                    console.log(`Voksne. Morgenmad lørdag: ${$scope.breakfasts[0][0]}, søndag: ${$scope.breakfasts[0][1]}`);
                    console.log(`Voksne. Frokost lørdag: ${$scope.lunchs[0][0]}, søndag: ${$scope.lunchs[0][1]}`);
                    console.log(`Voksne. Fredag: ${$scope.friday[0]}, Lørdag: ${$scope.saturday[0]}, søndag: ${$scope.sunday[0]}`);
                    console.log(`Børn. Aftensmad fredag: ${$scope.dinners[1][0]}, lørdag: ${$scope.dinners[1][1]}`);
                    console.log(`Børn. Morgenmad lørdag: ${$scope.breakfasts[1][0]}, søndag: ${$scope.breakfasts[1][1]}`);
                    console.log(`Børn. Frokost lørdag: ${$scope.lunchs[1][0]}, søndag: ${$scope.lunchs[1][1]}`);
                    console.log(`Børn. Fredag: ${$scope.friday[1]}, Lørdag: ${$scope.saturday[1]}, søndag: ${$scope.sunday[1]}`); */
                };
            };

            /* console.log(`Voksne. Aftensmad fredag: ${$scope.dinners[0][0]}, lørdag: ${$scope.dinners[0][1]}`);
            console.log(`Voksne. Morgenmad lørdag: ${$scope.breakfasts[0][0]}, søndag: ${$scope.breakfasts[0][1]}`);
            console.log(`Voksne. Frokost lørdag: ${$scope.lunchs[0][0]}, søndag: ${$scope.lunchs[0][1]}`);
            console.log(`Voksne. Lørdag: ${$scope.saturday[0]}, søndag: ${$scope.sunday[0]}`);
            console.log(`Børn. Aftensmad fredag: ${$scope.dinners[1][0]}, lørdag: ${$scope.dinners[1][1]}`);
            console.log(`Børn. Morgenmad lørdag: ${$scope.breakfasts[1][0]}, søndag: ${$scope.breakfasts[1][1]}`);
            console.log(`Børn. Frokost lørdag: ${$scope.lunchs[1][0]}, søndag: ${$scope.lunchs[1][1]}`);
            console.log(`Børn. Lørdag: ${$scope.saturday[1]}, søndag: ${$scope.sunday[1]}`); */

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
                
        }, function errorCallback(response) {
            console.log(`Error. Status: ${response.status}`);
        });
    };

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
            url = `${url}sort/event/${$scope.selectedInvitation._id}/${sortDirection}`;
        } else if (searchOrNot) {
            url = `${url}search/event/${$scope.selectedInvitation._id}/${searchText}`;
        } else {
            url = `${url}event/${$scope.selectedInvitation._id}`;
        };
        // console.log(`url: ${url}`);
        $http({
            method: 'GET',
            url: url,
            headers: {
                'x-auth': localStorage.userToken
            }
        }).then(function(response) {
            // console.log(`Status: ${response.status}`);
            $scope.registrations = response.data;
            for (var i=0; i<$scope.registrations.length; i++) {
                $scope.registrations[i].num = i;
                $scope.registrations[i].EditPopoverIsVisible = false;
                $scope.registrations[i].RemPopoverIsVisible = false;
            };
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
                // console.log(`Status: ${response.status}`);
                // console.log(response.data._id);
                $location.path(`/eventregistrationall/${registration.year}`);
            }, function errorCallback(response) {
                console.log(`Status: ${response.status}`);
            });
        };
    };

    $scope.paidStatus = function(registration) {
        // console.log(`Payment status: ${registration.paid}`);
        var data = {
            name: registration.name,
            // agegroup: registration.agegroup,
            participantCategory: registration.participantCategory,
            year: registration.year,
            // arrivalday: registration.arrivalday,
            arrivalOption: registration.arrivalOption,
            arrivaltime: registration.arrivaltime,
            // departureday: registration.departureday,
            departureOption: $scope.departureOption,
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
        $scope.editPartCat = registration.participantCategory;
        $scope.editYear = registration.year;
        $scope.willattend = registration.willattend;
        $scope.willnotattend = !registration.willattend;
        // $scope.editArrivalday = registration.arrivalday;
        $scope.editArrivalOption = registration.arrivalOption;
        if (registration.arrivaltime == null) {
            $scope.editArrivaltime = null;
        } else {
            $scope.editArrivaltime = new Date(registration.arrivaltime);
        };
        // $scope.editDepartureday = registration.departureday;
        $scope.editDepartureOption = registration.departureOption;
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
        // console.log(`In AllEventReg controller, editEventreg. Name: ${$scope.editRegname}`)
        var eventFee = 0;
        var willattend = true;
        partCat = $scope.eventtype.participantCategories.filter(obj => {
            return obj.name == $scope.editPartCat
        })[0];
        // console.log(`In editRegistrationToggle. editPartCat: ${editPartCat.name}`);
        // console.log(`editPartCat stringified: ${JSON.stringify(editPartCat)}`);

        if ($scope.willnotattend) {
            willattend = false
        } else {
            var numDays = EventregService.numDays($scope.editArrivalOption, $scope.editDepartureOption);
            // console.log(`numDays: ${numDays}`);
            if (numDays == 1) {
                eventFee = partCat.priceDay;
            } else {
                eventFee = partCat.priceFull;
            };
            // console.log(`ArrivalOption: ${$scope.editArrivalOption}, DepartureOption: ${$scope.editDepartureOption}, Event Fee: ${eventFee}`);
        };

        var eventreg = {
            name: $scope.editRegname,
            participantCategory: $scope.editPartCat,
            year: $scope.editYear,
            willattend: willattend,
            arrivalOption: $scope.editArrivalOption,
            arrivaltime: $scope.editArrivaltime,
            departureOption: $scope.editDepartureOption,
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
            $location.path('/eventregistrationall/'+$scope.selectedInvitation._id);
        }, function errorCallback(response) {
            console.log(`Status: ${response.status}`);
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
                var numDays = EventregService.numDays($scope.registrations[i].arrivalOption, $scope.registrations[i].departureOption);
                // console.log(`numDays: ${numDays}`);
                var partCat = $scope.eventtype.participantCategories.filter(obj => {
                    return obj.name == registrations[i].participantCategory
                })[0];
                if (numDays == 1) {
                    eventFee = partCat.priceDay;
                } else {
                    eventFee = partCat.priceFull;
                };
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
            $location.path('/eventregistrationall/'+$scope.selectedInvitation._id);
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
    };

    $scope.registrationsFromOtherEvent = function() {
        // console.log(`theOtherEvent, name: ${$scope.theOtherEvent.eventName}`);
        var arEvent = JSON.parse($scope.theOtherEvent);
        // console.log(`arEvent _id: ${arEvent._id}, ${arEvent.eventName}`);
        $location.path('/eventregistrationall/' + arEvent._id);
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

