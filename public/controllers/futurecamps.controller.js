angular.module('familielejr')

.controller('futurecampsCtrl', ['$scope', '$http', '$location', '$route', '$window', 'AuthService', 'YearService', 
function($scope, $http, $location, $route, $window, AuthService, YearService) {

    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
            $scope.role = AuthService.userRole();
        };
    });

    var invyear = YearService.myYear(7,20);
    var pastyear = invyear - 1;
    // console.log(`futurecampsCtrl: Invyear: ${invyear}, Pastyear: ${pastyear}`);

    $http({
        method: 'GET',
        url: '/futurecamps/future/' + pastyear,
        headers: {
            'x-auth': localStorage.userToken
        }
    }).then(function(response) {
        // console.log(`Success. Status: ${response.status}`);
        if (response.data) {
            $scope.camps = response.data;
        } else {
            console.log('No future camps');
        };
        angular.element(document.querySelector( '#organizer' ) ).addClass('active');
        angular.element(document.querySelector( '#futurecamps' ) ).addClass('active');
    }, function errorCallback(response) {
        console.log(`Error. Status: ${response.status}`);
    });

    $scope.commArr = [0,1,2];
    $scope.commMemArr = [0,1,2,3,4];
    $scope.organizers = ["","","","",""];
    $scope.organizerBtnShow = [false,true,false,false,false];
    $scope.organizerShow = [true,false,false,false,false];
    var numOrgLines = 0;

    $scope.committeeName = ["","",""];
    $scope.committeeDesc = ["","",""];
    $scope.committeeMembers = [["","","","",""],["","","","",""],["","","","",""]];
    $scope.committeeBtnShow = [true,false,false];
    $scope.committeeShow = [false,false,false];
    var numCommLines = 0;
    var initCommittees = false;
/* 
    console.log(`----- committeeMembers -----`);
    for (var u=0; u<3; u++) {
        for (var o=0; o<5; o++) {
            console.log($scope.committeeMembers[u][o]);
        };
    };
 */
    $scope.commMemBtnShow = [[false,true,false,false,false],[false,true,false,false,false],[false,true,false,false,false]];
    $scope.commMemShow = [[true,false,false,false,false],[true,false,false,false,false],[true,false,false,false,false]];
    var numCommMemLines = [0,0,0];
    $scope.numCommMemLines = numCommMemLines;

    $scope.showOrgLine = function() {
        // console.log("Entering showOrgline. numOrgLines: "+numOrgLines);
        if ($scope.organizers[numOrgLines]) {
            // console.log("numOrgLines: "+numOrgLines+", Organizer: "+$scope.organizers[numOrgLines]);
            numOrgLines = numOrgLines + 1;
            $scope.numOrgLines = numOrgLines;
            $scope.organizerShow[numOrgLines] = true;
            $scope.organizerBtnShow[numOrgLines] = false;
            $scope.organizerBtnShow[numOrgLines+1] = true;
        }
        else {
            $window.alert("Du skal udfylde det tomme arrangør felt.");
        };
    };
    
    $scope.removeOrganizer = function(orgNum) {
        console.log("Entering removeOrganizer. numOrgLines: "+numOrgLines);
        for (var i=orgNum; i<numOrgLines; i++) {
            $scope.organizers[i] = $scope.organizers[i+1];
        };
        $scope.organizers[numOrgLines] = "";
        $scope.organizerShow[numOrgLines] = false;
        $scope.organizerBtnShow[numOrgLines] = true;
        $scope.organizerBtnShow[numOrgLines+1] = false;
        numOrgLines -= 1;
        $scope.numOrgLines = numOrgLines;
    };

    $scope.showCommLine = function() {
        // console.log("Entering showCommLine. numCommLines: "+numCommLines);
        if (!initCommittees) {
            $scope.committeeShow[numCommLines] = true;
            $scope.committeeBtnShow[numCommLines] = false;
            $scope.committeeBtnShow[numCommLines+1] = true;
            initCommittees = true;
        }
        else if ($scope.committeeName[numCommLines]) {
            // console.log("numCommLines: "+numCommLines+", Committee: "+$scope.committeeName[numCommLines]);
            numCommLines = numCommLines + 1;
            $scope.committeeShow[numCommLines] = true;
            $scope.committeeBtnShow[numCommLines] = false;
            $scope.committeeBtnShow[numCommLines+1] = true;
        }
        else {
            $window.alert("Du skal udfylde navnet på udvalget.");
        };
    };
    
    $scope.showCommMemLine = function(numComm) {
        // console.log("Entering showCommMemLine. numCommMemLines for Committee: "+numComm+": "+numCommMemLines[numComm]);
        // console.log($scope.committeeMembers[numComm][numCommMemLines[numComm]])
        if ($scope.committeeMembers[numComm][numCommMemLines[numComm]]) {
            // console.log("numCommMemLines for Committee: "+numComm+": "+numCommMemLines[numComm]+", Committeemember: "+$scope.committeeMembers[numComm][numCommMemLines[numComm]]);
            // console.log(`commMemShow: ${$scope.commMemShow[numComm]}`);
            // console.log(`commMemBtnShow: ${$scope.commMemBtnShow[numComm]}`);
            // console.log(`numCommMemLines: ${numCommMemLines}`);
            numCommMemLines[numComm] = numCommMemLines[numComm] + 1;
            $scope.commMemShow[numComm][numCommMemLines[numComm]] = true;
            $scope.commMemBtnShow[numComm][numCommMemLines[numComm]] = false;
            $scope.commMemBtnShow[numComm][numCommMemLines[numComm]+1] = true;
            // console.log(`commMemShow: ${$scope.commMemShow[numComm]}`);
            // console.log(`commMemBtnShow: ${$scope.commMemBtnShow[numComm]}`);
            // console.log(`numCommMemLines: ${numCommMemLines}`);
            $scope.numCommMemLines[numComm] = numCommMemLines[numComm];
        }
        else {
            $window.alert("Du skal udfylde navnet på udvalgsmedlemmet.");
        };
    };

    $scope.removeCommMem = function(numComm, commMemNum) {
        console.log("Entering removeCommMem. numOrgLines: "+numCommMemLines[numComm]);
        for (var i=commMemNum; i<numCommMemLines[numComm]; i++) {
            $scope.committeeMembers[numComm][i] = $scope.committeeMembers[numComm][i+1];
        };
        $scope.committeeMembers[numComm][numCommMemLines[numComm]] = "";
        $scope.commMemShow[numComm][numCommMemLines[numComm]] = false;
        $scope.commMemBtnShow[numComm][numCommMemLines[numComm]] = true;
        $scope.commMemBtnShow[numComm][numCommMemLines[numComm]+1] = false;
        numCommMemLines[numComm] -= 1;
        $scope.numCommMemLines[numComm] = numCommMemLines[numComm];
    };
    
    $scope.newCampEntryToggle = function() {
        if ($scope.newCampEntry) {
            $scope.newCampEntry = false;
        } else {
            $scope.newCampEntry = true;
        };
    };

    $scope.generateFuturecamp = function() {

        var addr = {
            street: $scope.street, houseno: 0, zip: $scope.zip, town: $scope.town
        };

        var organizers = [];
        for (var i=0; i<numOrgLines+1; i++) {
            if ($scope.organizers[i] != "") {
                organizers.push({orgname: $scope.organizers[i]});
            };
        };

        var committees = [];
        for (var x=0; x<numCommLines+1; x++) {
            if ($scope.committeeName[x] != "") {
                var members = [];
                for (var y=0; y<numCommMemLines[x]+1; y++) {
                    members.push({membername: $scope.committeeMembers[x][y]});
                };
                var committee = {
                    name: $scope.committeeName[x],
                    description: $scope.committeeDesc[x],
                    members: members
                };
                committees.push(committee);
            };
        };
 
        var data = {
            year: $scope.year,
            camp: $scope.camp,
            address: addr,
            website: $scope.website,
            startdate: $scope.startdate,
            enddate: $scope.enddate
        };
        
        if (organizers.length > 0) {data.organizers = organizers;};
        if (committees.length > 0) {data.committees = committees;};

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

.controller('futurecampeditCtrl', ['$scope', '$http', '$location', '$routeParams', '$window', 'AuthService', function($scope, $http, $location, $routeParams, $window, AuthService) {

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
            // console.log(`Received the futurecamp`);
            $scope.camp = response.data.futurecamp;
            $scope.startdateView = new Date($scope.camp.startdate);
            $scope.enddateView = new Date($scope.camp.enddate);

            $scope.commArr = [0,1,2];
            $scope.commMemArr = [0,1,2,3,4];
            $scope.organizers = ["","","","",""];
            $scope.organizerBtnShow = [false,true,false,false,false];
            $scope.organizerShow = [true,false,false,false,false];
            $scope.numOrgLines = $scope.camp.organizers.length;
            // console.log(`numOrgLines: ${$scope.numOrgLines}`);
            for (var i=0; i<$scope.numOrgLines; i++) {
                $scope.organizerShow[i] = true;
                $scope.organizerBtnShow[i] = false;
                if (i<4) {$scope.organizerBtnShow[i+1] = true;};
                $scope.organizers[i] = $scope.camp.organizers[i].orgname;
            };

            $scope.committeeName = ["","",""];
            $scope.committeeDesc = ["","",""];
            $scope.committeeMembers = [["","","","",""],["","","","",""],["","","","",""]];
            $scope.committeeBtnShow = [true,false,false];
            $scope.committeeShow = [false,false,false];
            $scope.numCommLines = $scope.camp.committees.length;

            $scope.commMemBtnShow = [[false,true,false,false,false],[false,true,false,false,false],[false,true,false,false,false]];
            $scope.commMemShow = [[true,false,false,false,false],[true,false,false,false,false],[true,false,false,false,false]];
            $scope.numCommMemLines = [0,0,0];

            for (var x=0; x<$scope.numCommLines; x++) {
                $scope.committeeShow[x] = true;
                $scope.committeeBtnShow[x] = false;
                if (x<2) {$scope.committeeBtnShow[x+1] = true;};
                $scope.committeeName[x] = $scope.camp.committees[x].name;
                $scope.committeeDesc[x] = $scope.camp.committees[x].description;
                $scope.numCommMemLines[x] = $scope.camp.committees[x].members.length;
                for (var y=0; y<$scope.numCommMemLines[x];y++) {
                    $scope.commMemShow[x][y] = true;
                    $scope.commMemBtnShow[x][y] = false;
                    if (y<4) {$scope.commMemBtnShow[x][y+1] = true;};
                    $scope.committeeMembers[x][y] = $scope.camp.committees[x].members[y].membername;
                }
                // console.log(`commMemShow for ${x}: ${$scope.commMemShow[x]}`);
                // console.log(`commMemBtnShow for ${x}: ${$scope.commMemBtnShow[x]}`);
            };
            $scope.initCommittees = false;
            if ($scope.numCommLines>0) {$scope.initCommittees = true;};

            for (var w=0; w<$scope.numCommLines; w++) {
                if ($scope.numCommMemLines[w] > 0) {
                    $scope.numCommMemLines[w] -= 1;
                };
            };
            if ($scope.numCommLines > 0) {$scope.numCommLines -= 1;};
            if ($scope.numOrgLines > 0) {$scope.numOrgLines -= 1;};

        } else {
            console.log('Camp not found');
        };
        angular.element(document.querySelector( '#organizer' ) ).addClass('active');
        angular.element(document.querySelector( '#futurecamps' ) ).addClass('active');
    }, function errorCallback(response) {
        console.log(`Error. Status: ${response.status}`);
    });

    $scope.showOrgLine = function() {
        // console.log("Entering showOrgline. numOrgLines: "+$scope.numOrgLines);
        if ($scope.organizers[$scope.numOrgLines]) {
            // console.log("numOrgLines: "+$scope.numOrgLines+", Organizer: "+$scope.organizers[$scope.numOrgLines]);
            $scope.numOrgLines = $scope.numOrgLines + 1;
            $scope.organizerShow[$scope.numOrgLines] = true;
            $scope.organizerBtnShow[$scope.numOrgLines] = false;
            $scope.organizerBtnShow[$scope.numOrgLines+1] = true;
        }
        else {
            $window.alert("Du skal udfylde det tomme arrangør felt.");
        };
    };
    
    $scope.removeOrganizer = function(orgNum) {
        // console.log("Entering removeOrganizer. numOrgLines: "+$scope.numOrgLines);
        for (var i=orgNum; i<$scope.numOrgLines; i++) {
            $scope.organizers[i] = $scope.organizers[i+1];
        };
        $scope.organizers[$scope.numOrgLines] = "";
        $scope.organizerShow[$scope.numOrgLines] = false;
        $scope.organizerBtnShow[$scope.numOrgLines] = true;
        $scope.organizerBtnShow[$scope.numOrgLines+1] = false;
        $scope.numOrgLines -= 1;
        numOrgLines = $scope.numOrgLines;
    };

    $scope.showCommLine = function() {
        // console.log("Entering showCommLine. numCommLines: "+$scope.numCommLines);
        if (!$scope.initCommittees) {
            $scope.committeeShow[$scope.numCommLines] = true;
            $scope.committeeBtnShow[$scope.numCommLines] = false;
            $scope.committeeBtnShow[$scope.numCommLines+1] = true;
            $scope.initCommittees = true;
        }
        else if ($scope.committeeName[$scope.numCommLines]) {
            // console.log("numCommLines: "+$scope.numCommLines+", Committee: "+$scope.committeeName[$scope.numCommLines]);
            $scope.numCommLines = $scope.numCommLines + 1;
            $scope.committeeShow[$scope.numCommLines] = true;
            $scope.committeeBtnShow[$scope.numCommLines] = false;
            $scope.committeeBtnShow[$scope.numCommLines+1] = true;
        }
        else {
            $window.alert("Du skal udfylde navnet på udvalget.");
        };
    };
    
    $scope.showCommMemLine = function(numComm) {
        // console.log("Entering showCommMemLine. numCommMemLines for Committee: "+numComm+": "+$scope.numCommMemLines[numComm]);
        // console.log($scope.committeeMembers[numComm][$scope.numCommMemLines[numComm]])
        if ($scope.committeeMembers[numComm][$scope.numCommMemLines[numComm]]) {
            // console.log("numCommMemLines for Committee: "+numComm+": "+$scope.numCommMemLines[numComm]+", Committeemember: "+$scope.committeeMembers[numComm][$scope.numCommMemLines[numComm]]);
            // console.log(`commMemShow: ${$scope.commMemShow[numComm]}`);
            // console.log(`commMemBtnShow: ${$scope.commMemBtnShow[numComm]}`);
            // console.log(`numCommMemLines: ${$scope.numCommMemLines}`);
            $scope.numCommMemLines[numComm] = $scope.numCommMemLines[numComm] + 1;
            $scope.commMemShow[numComm][$scope.numCommMemLines[numComm]] = true;
            $scope.commMemBtnShow[numComm][$scope.numCommMemLines[numComm]] = false;
            $scope.commMemBtnShow[numComm][$scope.numCommMemLines[numComm]+1] = true;
            // console.log(`commMemShow: ${$scope.commMemShow[numComm]}`);
            // console.log(`commMemBtnShow: ${$scope.commMemBtnShow[numComm]}`);
            // console.log(`numCommMemLines: ${$scope.numCommMemLines}`);
        }
        else {
            $window.alert("Du skal udfylde navnet på udvalgsmedlemmet.");
        };
    };
    
    $scope.removeCommMem = function(numComm, commMemNum) {
        console.log("Entering removeCommMem. numOrgLines: "+$scope.numCommMemLines[numComm]);
        for (var i=commMemNum; i<$scope.numCommMemLines[numComm]; i++) {
            $scope.committeeMembers[numComm][i] = $scope.committeeMembers[numComm][i+1];
        };
        $scope.committeeMembers[numComm][$scope.numCommMemLines[numComm]] = "";
        $scope.commMemShow[numComm][$scope.numCommMemLines[numComm]] = false;
        $scope.commMemBtnShow[numComm][$scope.numCommMemLines[numComm]] = true;
        $scope.commMemBtnShow[numComm][$scope.numCommMemLines[numComm]+1] = false;
        $scope.numCommMemLines[numComm] -= 1;
        numCommMemLines[numComm] = $scope.numCommMemLines[numComm];
    };
    
    $scope.editFuturecamp = function(id) {

        var addr = {
            houseno: $scope.camp.address.houseno, street: $scope.camp.address.street, zip: $scope.camp.address.zip, town: $scope.camp.address.town
        };

        var organizers = [];
        for (var i=0; i<$scope.numOrgLines+1; i++) {
            if ($scope.organizers[i] != "") {
                organizers.push({orgname: $scope.organizers[i]});
            };
        };

        var committees = [];
        for (var x=0; x<$scope.numCommLines+1; x++) {
            if ($scope.committeeName[x] != "") {
                var members = [];
                for (var y=0; y<$scope.numCommMemLines[x]+1; y++) {
                    members.push({membername: $scope.committeeMembers[x][y]});
                };
                var committee = {
                    name: $scope.committeeName[x],
                    description: $scope.committeeDesc[x],
                    members: members
                };
                committees.push(committee);
            };
        };
 
        var data = {
            year: $scope.year,
            camp: $scope.camp.camp,
			address: addr,
            website: $scope.camp.website,
            startdate: $scope.startdateView,
            enddate: $scope.enddateView
        };
        
        if (organizers.length > 0) {data.organizers = organizers;};
        if (committees.length > 0) {data.committees = committees;};

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

.controller('futurecampdetailsCtrl', ['$scope', '$http', '$location', '$routeParams', '$window', 'AuthService', function($scope, $http, $location, $routeParams, $window, AuthService) {

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
            console.log(`Received the futurecamp`);
            $scope.camp = response.data.futurecamp;
        } else {
            console.log('Camp not found');
        };
        angular.element(document.querySelector( '#organizer' ) ).addClass('active');
        angular.element(document.querySelector( '#futurecamps' ) ).addClass('active');
    }, function errorCallback(response) {
        console.log(`Error. Status: ${response.status}`);
    });

    $scope.removeCamp = function() {
        if ($window.confirm('Bekræft venligst at du vil slette lejren for '+$scope.camp.year)) {
            $http({
                method: 'DELETE',
                url: 'futurecamps/'+$routeParams.id,
                headers: {
                    'x-auth': localStorage.userToken
                }
            }).then(function(response) {
                console.log(`Status: ${response.status}`);
                console.log(response.data._id);
                $location.path('/futurecamps');
            }, function errorCallback(response) {
                console.log(`Status: ${response.status}`);
            });
        };
    };

}])
