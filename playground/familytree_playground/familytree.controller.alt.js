angular.module('familielejr')

.controller('familytreeCtrl', ['$scope', '$http', '$window', '$route', '$location', 'AuthService', function($scope, $http, $window, $route, $location, AuthService) {
    
    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
            $scope.role = AuthService.userRole();
        };
    });

    $scope.addNamesForm = false;
    $scope.editNamesForm = false;
    var newFamId = [0,0,0,0,0];
    $scope.familytree = [];
    $scope.displayFamilytree = [];
    $scope.rootDisplayLevel = 0;

    $http({
        method: 'GET',
        url: '/families/0',
        headers: {
            'x-auth': localStorage.userToken
        }
    }).then(function(response) {
        // console.log(`FamilytreeStatus: ${response.status}`);
        $scope.familytree[0] = response.data;
        // $scope.familytreeL0 = response.data;
        // console.log($scope.familytree);
        // console.log(`Klan: ${$scope.familytreeL0.klan}, Person: ${$scope.familytreeL0.persons[0].firstname}`);
        $http({
            method: 'GET',
            url: '/families/1',
            headers: {
                'x-auth': localStorage.userToken
            }
        }).then(function(response) {
            // console.log(`FamilytreeStatus: ${response.status}`);
            $scope.familytree[1] = response.data;
            $scope.displayFamilytree = $scope.familytree;
            // console.log($scope.familytree);
            // console.log(`Klan: ${$scope.familytreeL0.klan}, Person: ${$scope.familytreeL0.persons[0].firstname}`);
        }, function errorCallback(response) {
            console.log(`FamilytreeStatus: ${response.status}`);
        });
    }, function errorCallback(response) {
        console.log(`FamilytreeStatus: ${response.status}`);
    });

    $scope.firstname = ["","","",""];
    $scope.middlename = ["","","",""];
    $scope.surname = ["","","",""];
    $scope.birth = [];
    $scope.passdate = [];
    $scope.BtnShow = [false,true,false,false];
    $scope.newnameShow = [true,false,false,false];
    var numLines = 0;
    // console.log(`BtnShow: ${$scope.BtnShow}`);
    // console.log(`newnameShow: ${$scope.newnameShow}`);
    // console.log(`addNamesForm: ${$scope.addNamesForm}`);

    $scope.addFamily = function(level, parent_id, chain) {
        if ($scope.addNamesForm) {
            $scope.addNamesForm = false;
        } else {
            $scope.addNamesForm = true;
            $scope.headLine = "Personer der skal tilføjes";
            $scope.addAtLevel = level;
            $scope.parent_id = parent_id;
            $scope.addToChain = chain;
            $http({
                method: 'GET',
                url: '/familiescount/'+level,
                headers: {
                    'x-auth': localStorage.userToken
                }
            }).then(function(response) {
                console.log(`FamilytreeStatus: ${response.status}`);
                count = response.data;
                newFamId[level] = level*1000+count;
                $scope.newFamId = newFamId;
                console.log(`newFamId: ${newFamId}`);
                console.log(`scope.newFamId: ${$scope.newFamId}`);
            }, function errorCallback(response) {
                console.log(`FamilytreeStatus: ${response.status}`);
            });
            if ($scope.rootDisplayLevel == 0 && level < 2) {
                console.log(`Do nothing`);
            } else if ($scope.rootDisplayLevel == 0 && level == 2) {
                $scope.displayFamilytree = [];
                for (i=0; i<$scope.familytree[1].length; i++) {
                    if ($scope.familytree[1][i]._parent_id == parent_id) {
                        $scope.displayFamilytree[0].push($scope.familytree[1][i]);
                        console.log(`displayFamilyTree root parent_id: ${$scope.displayFamilytree[0][0]._parent_id}`);
                        console.log(`displayFamilyTree root: ${$scope.displayFamilytree[0][0]}`);
                    };
                };
                $http({
                    method: 'GET',
                    url: '/familiesinklan/'+level-1,
                    data: {
                        _parent_id: parent_id
                    },
                    headers: {
                        'x-auth': localStorage.userToken
                    }
                }).then(function(response) {
                    console.log(`FamilytreeStatus: ${response.status}`);
                    
                    // console.log($scope.familytree);
                    // console.log(`Klan: ${$scope.familytreeL0.klan}, Person: ${$scope.familytreeL0.persons[0].firstname}`);
                }, function errorCallback(response) {
                    console.log(`FamilytreeStatus: ${response.status}`);
                });
                        
            };
        };
    };

    $scope.editSecondLevelFamily = function(slid) {
        $scope.slid = slid;
        // console.log(`Entering editSecondLevelFamily, slid: ${slid}`);
        if ($scope.editNamesForm) {
            $scope.editNamesForm = false;
        } else {
            $scope.editNamesForm = true;
            $scope.headLine = "Ændringer til navne og datoer:";
            $scope.firstname = ["","","",""];
            $scope.middlename = ["","","",""];
            $scope.surname = ["","","",""];
            $scope.birth = [];
            $scope.passdate = [];
            $scope.BtnShow = [false,true,false,false];
            $scope.newnameShow = [true,false,false,false];
            for (var j=0; j<$scope.familytree.secondlevel.length; j++) {
                var f = $scope.familytree.secondlevel[j];
                console.log(`slid in loop: ${f._slid}`);
                if (slid == f._slid) {
                    var family = f;
                    $scope.numLines = f.persons.length;
                    console.log(`Found slid ${f._slid}, numLines: ${$scope.numLines}`);
                    numLines = $scope.numLines;
                };
            };
            for (var i=0; i<$scope.numLines; i++) {
                $scope.newnameShow[i] = true;
                $scope.BtnShow[i] = false;
                if (i<3) {$scope.BtnShow[i+1] = true;};
                $scope.firstname[i] = family.persons[i].firstname;
                $scope.middlename[i] = family.persons[i].middlename;
                $scope.surname[i] = family.persons[i].surname;
                if (family.persons[i].birth != null) {$scope.birth[i] = new Date(family.persons[i].birth);};
                if (family.persons[i].pass != null) {$scope.passdate[i] = new Date(family.persons[i].pass);};
                console.log(`${$scope.firstname[i]}, ${$scope.middlename[i]}, ${$scope.surname[i]}`);
            };
            console.log(`BtnShow: ${$scope.BtnShow}`);
            console.log(`newnameShow: ${$scope.newnameShow}`);
            console.log(`editNamesForm: ${$scope.addNamesForm}`);
            numLines -= 1; $scope.numLines = numLines;
        };
    };

    $scope.showLine = function() {
        // console.log("Entering showline. numLines: "+numLines);
        if ($scope.firstname[numLines]) {
            // console.log("numLines: "+numLines+", Person: "+$scope.firstname[numLines]);
            numLines = numLines + 1;
            $scope.newnameShow[numLines] = true;
            $scope.BtnShow[numLines] = false;
            $scope.BtnShow[numLines+1] = true;
        }
        else {
            $window.alert("Du skal udfylde person "+(numLines+1)+"'s fornavn.");
        };
    };

    $scope.addOrEditNames = function() {
        if ($scope.addNamesForm) {addNames();} else {editNames();};
    };
    
    addNames = function() {
        // console.log(`Entering addNames. numLines: ${numLines}`);
        var persons = [];
        for (i=0; i<numLines+1; i++) {
            persons.push(
                {
                    firstname: $scope.firstname[i],
                    middlename: $scope.middlename[i],
                    surname: $scope.surname[i],
                    birth: $scope.birth[i],
                    pass: $scope.passdate[i]
                }
            );
        };

        var data = {
            _admin: "596345a3fc89f0d78cbc06fd",
            level: $scope.addAtLevel,
            klan: "Flensburg",
            _family_id: $scope.newFamId[$scope.addAtLevel],
            _parent_id: $scope.parent_id,
            _kid: 0,
            persons: persons
        };

        $http({
            method: 'POST',
            url: '/families/',
            headers: {
                'x-auth': localStorage.userToken
            },
            data: data
        }).then(function(response) {
            $route.reload();
        }, function errorCallback(response) {
            console.log(`Status: ${response.status}`);
        });

    };

    editNames = function() {
        // console.log(`Entering editNames. numLines: ${numLines}. SLID: ${$scope.slid}`);
        var persons = [];
        for (i=0; i<numLines+1; i++) {
            persons.push(
                {
                    firstname: $scope.firstname[i],
                    middlename: $scope.middlename[i],
                    surname: $scope.surname[i],
                    birth: $scope.birth[i],
                    pass: $scope.passdate[i]
                }
            );
        };

        var data = {
            slid: $scope.slid,
            persons: persons
        };

        $http({
            method: 'PATCH',
            url: '/familytreeedit/' + $scope.familytree._id,
            headers: {
                'x-auth': localStorage.userToken
            },
            data: data
        }).then(function(response) {
            $route.reload();
        }, function errorCallback(response) {
            console.log(`Status: ${response.status}`);
        });

    };

    $scope.deleteSecondLevelFamily = function(slid) {
        // console.log(`Entering deleteNames.`);
        var data = {
            slid: slid
        };

        if ($window.confirm('Bekræft venligst at du vil slette familie' + slid)) {
            $http({
                method: 'PATCH',
                url: '/familytreedeletesl/' + $scope.familytree._id,
                headers: {
                    'x-auth': localStorage.userToken
                },
                data: data
            }).then(function(response) {
                // $location.path('/familytree');
                $route.reload();
            }, function errorCallback(response) {
                console.log(`Status: ${response.status}`);
            });
        };

    };

    $scope.addThirdLevelFamily = function(slfamily) {
        console.log(`First firstname: ${slfamily.persons[0].firstname}`);

        $http({
            method: 'GET',
            url: '/familytreesl/' + slfamily._slid,
            headers: {
                'x-auth': localStorage.userToken
            }
        }).then(function(response) {
            console.log(`FamilytreeStatus: ${response.status}`);
            $location.path('/familytree/' + slfamily._slid);
        }, function errorCallback(response) {
            console.log(`FamilytreeStatus: ${response.status}`);
            console.log(`First firstname: ${slfamily.persons[0].firstname}`);
            if (response.status == 404) {
                $http({
                    method: 'POST',
                    url: '/familytree',
                    headers: {
                        'x-auth': localStorage.userToken
                    },
                    data: {
                        admin_id: "596345a3fc89f0d78cbc06fd",
                        _kid: slfamily._slid,
                        klan: slfamily.persons[0].firstname,
                        persons: slfamily.persons
                    }
                }).then(function(response) {
                    $location.path('/familytree/' + slfamily._slid);
                }, function errorCallback(response) {
                    console.log(`Status: ${response.status}`);
                });
            } else {
                $location.path('/familytree');
            };
        });
    };

}])

.controller('familytreeslCtrl', ['$scope', '$http', '$routeParams', '$window', '$route', '$location', 'AuthService', function($scope, $http, $routeParams, $window, $route, $location, AuthService) {
    
    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
            $scope.role = AuthService.userRole();
        };
    });

    var slid = $routeParams.slid;
    var level = 1;
    
    $http({
        method: 'GET',
        url: '/familytreesl/' + slid,
        headers: {
            'x-auth': localStorage.userToken
        }
    }).then(function(response) {
        // console.log(`FamilytreeStatus: ${response.status}`);
        $scope.familytree = response.data;
        // console.log($scope.familytree);
        // console.log(`Klan: ${$scope.familytree.klan}, Person: ${$scope.familytree.persons[0].firstname}`);
    }, function errorCallback(response) {
        console.log(`FamilytreeStatus: ${response.status}`);
    });

    $scope.firstname = ["","","",""];
    $scope.middlename = ["","","",""];
    $scope.surname = ["","","",""];
    $scope.birth = [];
    $scope.passdate = [];
    $scope.BtnShow = [false,true,false,false];
    $scope.newnameShow = [true,false,false,false];
    var numLines = 0;
    // console.log(`BtnShow: ${$scope.BtnShow}`);
    // console.log(`newnameShow: ${$scope.newnameShow}`);
    // console.log(`addNamesForm: ${$scope.addNamesForm}`);

    $scope.addFamily = function(level) {
        if ($scope.addNamesForm) {
            $scope.addNamesForm = false;
        } else {
            $scope.addNamesForm = true;
            $scope.headLine = "Personer der skal tilføjes";
            $scope.addAtLevel = level;
        };
    };

    $scope.showLine = function() {
        // console.log("Entering showline. numLines: "+numLines);
        if ($scope.firstname[numLines]) {
            // console.log("numLines: "+numLines+", Person: "+$scope.firstname[numLines]);
            numLines = numLines + 1;
            $scope.newnameShow[numLines] = true;
            $scope.BtnShow[numLines] = false;
            $scope.BtnShow[numLines+1] = true;
        }
        else {
            $window.alert("Du skal udfylde person "+(numLines+1)+"'s fornavn.");
        };
    };

    $scope.addOrEditNames = function() {
        if ($scope.addNamesForm) {addNames();} else {editNames();};
    };
    
    addNames = function() {
        // console.log(`Entering addNames. numLines: ${numLines}`);
        var persons = [];
        for (i=0; i<numLines+1; i++) {
            persons.push(
                {
                    firstname: $scope.firstname[i],
                    middlename: $scope.middlename[i],
                    surname: $scope.surname[i],
                    birth: $scope.birth[i],
                    pass: $scope.passdate[i]
                }
            );
        };

        var url = "/familytreesl"
        switch ($scope.level) {
            case 1: 
        }

        var data = {
            slid: $scope.newSlid,
            persons: persons
        };

        $http({
            method: 'PATCH',
            url: '/familytree/' + $scope.familytree._id,
            headers: {
                'x-auth': localStorage.userToken
            },
            data: data
        }).then(function(response) {
            $route.reload();
        }, function errorCallback(response) {
            console.log(`Status: ${response.status}`);
        });

    };

}])
