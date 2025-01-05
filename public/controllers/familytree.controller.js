angular.module('familielejr')

.controller('familytreeCtrl', ['$scope', '$http', '$routeParams', '$window', '$route', '$location', 'AuthService', function($scope, $http, $routeParams, $window, $route, $location, AuthService) {
    
    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
            $scope.role = AuthService.userRole();
        };
    });

    setTimeout(function(){
        angular.element(document.querySelector( '#familytree' ) ).addClass('active');
    }, 1000);

    $scope.addNamesForm = false;
    $scope.editNamesForm = false;
    $scope.famIdBases = [0, 10, 200, 3000, 40000, 500000];
    $scope.nameArr = [0,1,2,3];
    $scope.initiatingFamilytree = false;
    $scope.newTreeEntry = false;
    $scope._L0_family_id = $routeParams._L0_family_id;

    $http({
        method: 'GET',
        url: '/tenants/mytenant',
        headers: {
            'x-auth': localStorage.userToken
        }
    }).then(function(tenant) {
        // console.log(`Tenant fetched. Status: ${tenant.status}. Tenant name: ${tenant.data.tenantName}`);
        $scope.tenantName = tenant.data.tenantName;
        // $scope.tenant = tenant.data;
        return $http({
            method: 'GET',
            url: '/familytrees/0',
            headers: {
                'x-auth': localStorage.userToken
            }
        })
    }).then(function(response) {
        // console.log(`FamilytreeStatus: ${response.status}`);
        // console.log(response.data)
        var lidBase = $scope.famIdBases[1];
        var newFamilyId = 0;
        var family_idArray = [];
        if (response.data.length == 0) {
            console.log(`No familytree exists yet.`);
            $scope.initiatingFamilytree = true;
            $scope.newFamilyId = newFamilyId;
            $scope.familytreeDescription = "Stamtræ er ikke startet. Klik på + og indtast navne";
            // $location.path('/familytreeedit');
        } else {
            // console.log(`There are one or more family trees in the tenant`);
            $scope.familytrees = response.data;
            $scope.familytree = response.data[$scope._L0_family_id];
            // $scope.familytreeDescription = $scope.familytree.description;
            // console.log($scope.familytree)
            // console.log(`Klan: ${$scope.familytree.klan}, Person: ${$scope.familytree.persons[0].firstname}`);
            for (x=0; x<$scope.familytree.secondlevel.length; x++) {
                // console.log(`Family ID in secondlevel in root tree: ${$scope.familytree.secondlevel[x]._family_id}`);
                family_idArray[x] = $scope.familytree.secondlevel[x]._family_id;
            };
            if (family_idArray.length == 0) {
                newFamilyId = lidBase;
            } else {
                family_idArray.sort();
                if (newFamilyId == 0) {
                    newFamilyId = family_idArray[family_idArray.length-1]+10;
                };
            };
            // console.log(`newFamilyId: ${newFamilyId}`);
            $scope.newFamilyId = newFamilyId;
        };
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

    $scope.newFamilyTreeToggle = function() {
        $scope.treeName = "";
        if ($scope.newTreeEntry) {
            $scope.newTreeEntry = false;
        } else {
            $scope.newTreeEntry = true;
        };
    };

    $scope.generateFamilyTree = function() {

        var klan_id = 0;
        if (!$scope.initiatingFamilytree) {
            klan_id = $scope.familytrees.length;
            // console.log(`The new klan_id is: ${klan_id}`);
        };
        var persons = [];
        var person = {
            firstname: $scope.newFirstname,
            middlename: $scope.newMiddlename,
            surname: $scope.newSurname,
            birth: $scope.newBirth,
            pass: $scope.newPassdate
        };
        persons.push(person);
        // console.log(`New familytree, klan_id: ${klan_id}`);
        // console.log(`Add at level 0`);
        var data = {
            // _admin: "596345a3fc89f0d78cbc06fd",     // _admin is added by the server
            level: 0,
            _kid: klan_id,
            klan: $scope.newFirstname + "_root",
            description: $scope.newDescription,
            _family_id: klan_id,
            _parent_id: 0,
            persons: persons
        };
        $http({
            method: 'POST',
            url: '/familytrees/',
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

    $scope.changeTree = function() {
        // console.log(`In changeTree. Change to _id: ${$scope.tree_id}`);
        if ($scope.tree_id == $scope.familytree._id) {
            // console.log(`Same familytree.`);
        } else {
            // console.log(`New Familytree`);
            for (var i=0; i<$scope.familytrees.length; i++) {
                // console.log(`${$scope.familytrees[i].description}: ${$scope.familytrees[i]._id}`);
                if ($scope.tree_id == $scope.familytrees[i]._id) {
                    $scope.familytree = $scope.familytrees[i];
                    $scope._L0_family_id = $scope.familytree._family_id;
                    // console.log(`Selected ${$scope.familytrees[i].description}.`);
                };
            };
            $route.reload;
        };
    };

    $scope.addFamily = function(level, parent_id) {
        // console.log(`Entering the addFamily function. level: ${level}, parent_id: ${parent_id}`);
        if ($scope.addNamesForm) {
            $scope.addNamesForm = false;
        } else {
            $scope.addNamesForm = true;
            $scope.headLine = "Personer der skal tilføjes";
            $scope.addAtLevel = level;
            $scope.parent_id = parent_id;
        };
    };

    $scope.editFamily = function(family_id, level) {
        // console.log(`Entering editFamily, family_id: ${family_id}, level: ${level}`);
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
            $scope.parent_id = 0;
            $scope.family_id = family_id;
            $scope.editAtLevel = level;
            $scope.l2index = 0;
            $scope.tree_id = $scope.familytree._id;
            // console.log(`Family id from view: ${$scope.family_id}`);
            
            if (level == 0) {
                var family = $scope.familytree;
                $scope.numLines = family.persons.length;
                // console.log(`Found family_id ${family._family_id}, numLines: ${$scope.numLines}`);
                numLines = $scope.numLines;
            } else if (level == 1) {
                // console.log(`**** Level 1 ****`);
                for (var j=0; j<$scope.familytree.secondlevel.length; j++) {
                    var f = $scope.familytree.secondlevel[j];
                    // console.log(`family_id in loop: ${f._family_id}`);
                    if (family_id == f._family_id) {
                        var family = f;
                        $scope.numLines = f.persons.length;
                        $scope.family_id = f._family_id;
                        // console.log(`Found family_id ${f._family_id}, numLines: ${$scope.numLines}`);
                        numLines = $scope.numLines;
                    };
                };
            } else {
                console.log(`GOD DAMN IT!`);
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
                // console.log(`In editFamily function. ${$scope.firstname[i]}, ${$scope.middlename[i]}, ${$scope.surname[i]}`);
            };
            numLines -= 1; $scope.numLines = numLines;
        };
    };

    $scope.showLine = function() {
        // console.log("Entering showline. numLines: "+numLines);
        if ($scope.firstname[numLines]) {
            // console.log("numLines: "+numLines+", Person: "+$scope.firstname[numLines]);
            numLines = numLines + 1; $scope.numLines = numLines;
            $scope.newnameShow[numLines] = true;
            $scope.BtnShow[numLines] = false;
            $scope.BtnShow[numLines+1] = true;
        }
        else {
            $window.alert("Du skal udfylde person "+(numLines+1)+"'s fornavn.");
        };
    };

    $scope.removeLine = function(nameNum) {
        for (var i=nameNum; i<$scope.numLines; i++) {
            $scope.firstname[i] = $scope.firstname[i+1];
            $scope.middlename[i] = $scope.middlename[i+1];
            $scope.surname[i] = $scope.surname[i+1];
            $scope.birth[i] = $scope.birth[i+1];
            $scope.passdate[i] = $scope.passdate[i+1];
        };
        $scope.firstname[numLines] = "";
        $scope.middlename[numLines] = "";
        $scope.surname[numLines] = "";
        $scope.birth[numLines] = null;
        $scope.passdate[numLines] = null;
        $scope.newnameShow[numLines] = false;
        $scope.BtnShow[numLines] = true;
        $scope.BtnShow[numLines+1] = false;
        numLines -= 1; $scope.numLines = numLines;
    };

    $scope.addOrEditNames = function() {
        if ($scope.addNamesForm) {addNames();} else {editNames();};
    };
    
    addNames = function() {
        // console.log(`Entering addNames. numLines: ${numLines}`);
        var persons = personArr(numLines);
        // console.log(`Persons: ${JSON.stringify(persons)}`);

        if ($scope.initiatingFamilytree) {
            // console.log(`New familytree, thus need to use POST`);
            // console.log(`Add at level 0`);
            var data = {
                // _admin: "596345a3fc89f0d78cbc06fd",    // _admin is added by the server
                level: $scope.addAtLevel,
                _kid: 0,
                klan: persons[0].firstname + "_root",
                description: $scope.description,
                _family_id: $scope.newFamilyId,
                _parent_id: $scope.parent_id,
                persons: persons
            };
            $http({
                method: 'POST',
                url: '/familytrees/',
                headers: {
                    'x-auth': localStorage.userToken
                },
                data: data
            }).then(function(response) {
                $route.reload();
            }, function errorCallback(response) {
                console.log(`Status: ${response.status}`);
            });
        } else {
            // console.log(`Existing familytree, thus using PATCH`);
            var data = {
                _family_id: $scope.newFamilyId,
                persons: persons
            };

            $http({
                method: 'PATCH',
                url: '/familytrees/' + $scope.familytree._id,
                headers: {
                    'x-auth': localStorage.userToken
                },
                data: data
            }).then(function(response) {
                $route.reload();
            }, function errorCallback(response) {
                console.log(`Status: ${response.status}`);
            });
        }

    };

    editNames = function() {
        // console.log(`Entering editNames. numLines: ${numLines}. FamilyId: ${$scope.family_id}`);
        var persons = personArr(numLines);
        // console.log(`Persons: ${persons}`);

        var data = {
            level: $scope.editAtLevel,
            _family_id: $scope.family_id,
            _parent_id: $scope.parent_id,
            l1index: 0,
            l2index: 0,
            persons: persons
        };
    
        $http({
            method: 'PATCH',
            url: '/familytrees/edit/' + $scope.tree_id,
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

    $scope.deleteFamily = function(family_id, level, id) {
        // console.log(`Entering the deleteFamily function. ID from view: ${id}`);
        $scope.parent_id = 0;

        var data = {
            _family_id: family_id,
            _parent_id: $scope.parent_id,
            level: level,
            l1index: 0,
            l2index: 0
        };

        if ($window.confirm('Bekræft venligst at du vil slette familie' + family_id)) {
            $http({
                method: 'PATCH',
                url: '/familytrees/delete/' + id,
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
    };

    function personArr(nl) {
        var persons = [];
        for (i=0; i<nl+1; i++) {
            person = {
                firstname: $scope.firstname[i],
                middlename: $scope.middlename[i],
                surname: $scope.surname[i],
                birth: $scope.birth[i],
                pass: $scope.passdate[i]
            };
            if (i == nl) {
                if ($scope.firstname[i] != '' || $scope.surname[i] != '') {
                    persons.push(person);
                };
            } else {
                persons.push(person);
            };
        };
        return persons;
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

    setTimeout(function(){
        angular.element(document.querySelector( '#familytree' ) ).addClass('active');
    }, 1000);

    $scope._L0_family_id = $routeParams._L0_family_id;
    $scope._L1_family_id = $routeParams._L1_family_id;
    var level = 1;
    $scope.L3Familytree = [];
    $scope.showL3Family = 0;
    $scope.famIdBases = [0, 10, 200, 3000, 40000, 500000];
    $scope.nameArr = [0,1,2,3];
    
    $http({
        method: 'GET',
        url: '/tenants/mytenant',
        headers: {
            'x-auth': localStorage.userToken
        }
    }).then(function(tenant) {
        // console.log(`Tenant fetched. Status: ${tenant.status}. Tenant name: ${tenant.data.tenantName}`);
        $scope.tenantName = tenant.data.tenantName;
        // $scope.tenant = tenant.data;
        return $http({
            method: 'GET',
            url: '/familytrees/0',
            headers: {
                'x-auth': localStorage.userToken
            }
        });
    }).then(function(response) {
        // console.log(`In familytreeslCtrl. FamilytreeStatus: ${response.status}`);
        $scope.familytree = response.data[$scope._L0_family_id];
        $scope.familytreeDescription = $scope.familytree.description;
        // console.log($scope.familytree);
        // console.log(`Klan: ${$scope.familytree.klan}, Person: ${$scope.familytree.persons[0].firstname}`);
        for (i=0; i<$scope.familytree.secondlevel.length; i++) {
            if ($scope.familytree.secondlevel[i]._family_id == $scope._L1_family_id) {
                $scope.l1family = $scope.familytree.secondlevel[i];
                $scope.l1index = i;
                // console.log(`l1family: ${JSON.stringify($scope.l1family.persons)}, l1index: ${$scope.l1index}`);
            };
        };
    }, function errorCallback(response) {
        console.log(`FamilytreeStatus: ${response.status}`);
    });

    initForms();
    var numLines = 0; $scope.numLines = 0;

    $scope.addFamily = function(level, parent_id, tree_id) {
        // console.log(`Entering the addFamily function.`);
        if ($scope.addNamesForm) {
            $scope.addNamesForm = false;
        } else {
            $scope.addNamesForm = true;
            $scope.headLine = "Personer der skal tilføjes";
            $scope.addAtLevel = level;
            $scope.parent_id = parent_id;
            $scope.tree_id = tree_id;
            if (tree_id == 0) {$scope.tree_id = $scope.familytree._id}
            // console.log(`addAtLevel: ${$scope.addAtLevel}`);

            if ($scope.addAtLevel == 2) {
                // console.log(`**** Level 2 ****`);
                var addToFamily = $scope.l1family.thirdlevel;
                calcNewFamId(level, parent_id, addToFamily);
            } else if ($scope.addAtLevel == 3) {
                // console.log(`**** Level 3 ****`);
                $http({
                    method: 'GET',
                    url: '/familytrees/parent_kid/' + parent_id +'/' + $scope.familytree._kid,
                    headers: {
                        'x-auth': localStorage.userToken
                    }
                }).then(function(response) {
                    // console.log(`L3FamilytreeStatus: ${response.status}. New url working`);
                    $scope.L3Familytree = response.data;
                    $scope.showL3Family = $scope.parent_id;
                    var addToFamily = $scope.L3Familytree;
                    calcNewFamId(level, parent_id, addToFamily);
                }, function errorCallback(response) {
                    // console.log(`FamilytreeStatus: ${response.status}`);
                });
            } else if ($scope.addAtLevel == 4) {
                // console.log(`**** Level 4 ****`);
                for (var x=0; x<$scope.L3Familytree.length; x++) {
                    if ($scope.L3Familytree[x]._family_id == parent_id) {
                        var addToFamily = $scope.L3Familytree[x].secondlevel;
                    };
                };
                calcNewFamId(level, parent_id, addToFamily);
            } else if ($scope.addAtLevel == 5) {
                // console.log(`**** Level 5 ****`);
                for (var x=0; x<$scope.L3Familytree.length; x++) {
                    if ($scope.L3Familytree[x]._id == tree_id) {
                        // console.log(`Found L3Familytree!!`);
                        for (var u=0; u<$scope.L3Familytree[x].secondlevel.length; u++) {
                            if ($scope.L3Familytree[x].secondlevel[u]._family_id == parent_id) {
                                var addToFamily = $scope.L3Familytree[x].secondlevel[u].thirdlevel;
                                // console.log(`addToFamily: ${addToFamily}`);
                            };
                        };
                    };
                };
                calcNewFamId(level, parent_id, addToFamily);
            } else {
                console.log(`GOD DAMN IT!!`);
            };

        };
    };

    function calcNewFamId(level, parent_id, addToFamily) {
        // console.log(`Entering the calcNewFamId function`);
        var famIdBases = [0, 10, 200, 3000, 40000, 500000];
        var lidBase = famIdBases[level] + (parent_id - famIdBases[level-1])*10;
        // console.log(`parent_id: ${parent_id}, lidBase: ${lidBase}`);
        var newFamilyId = 0;
        var family_idArray = [];
        for (x=0; x<addToFamily.length; x++) {
            family_idArray[x] = addToFamily[x]._family_id;
        };
        if (family_idArray.length == 0) {
            newFamilyId = lidBase;
        } else {
            family_idArray.sort();
            if (newFamilyId == 0) {
                newFamilyId = family_idArray[family_idArray.length-1]+10;
            };
        };
        // console.log(`newFamilyId: ${newFamilyId}`);
        $scope.newFamilyId = newFamilyId;
    };

    $scope.showLevel3 = function(parent_id) {
        // console.log(`Entering the showLevel3 function, parent_id: ${parent_id}`);
        if (parent_id == $scope.showL3Family) {
            $scope.showL3Family = 0;
        } else {
            $http({
                method: 'GET',
                url: '/familytrees/parent_kid/' + parent_id + '/' + $scope.familytree._kid,
                headers: {
                    'x-auth': localStorage.userToken
                }
            }).then(function(response) {
                // console.log(`L3FamilytreeStatus: ${response.status}`);
                $scope.L3Familytree = response.data;
                // console.log($scope.L3Familytree);
                $scope.showL3Family = parent_id;
                /* if ($scope.L3Familytree.length > 0) {
                    console.log(`showL3Family: ${$scope.showL3Family}, Klan: ${$scope.L3Familytree[0].klan}, Person: ${$scope.L3Familytree[0].persons[0].firstname}`);
                } */
            }, function errorCallback(response) {
                console.log(`FamilytreeStatus: ${response.status}`);
            });
        };
    };

    $scope.editFamily = function(family_id, level) {
        $scope.family_id = family_id;
        // console.log(`Entering editSecondLevelFamily, family_id: ${family_id}`);
        if ($scope.editNamesForm) {
            $scope.editNamesForm = false;
        } else {
            initForms();
            $scope.editNamesForm = true;
            $scope.headLine = "Ændringer til navne og datoer:";
            $scope.tree_id = $scope.familytree._id;
            $scope.parent_id = 0;
            $scope.family_id = family_id;
            $scope.editAtLevel = level;
            $scope.l2index = 0;

            if (level == 1) {
                // console.log(`**** Level 1 ****`);
                var family = $scope.l1family;
                
            } else if (level == 2) {
                // console.log(`**** Level 2 ****`);
                for (var j=0; j<$scope.l1family.thirdlevel.length; j++) {
                    var f = $scope.l1family.thirdlevel[j];
                    // console.log(`L2. family_id in loop: ${f._family_id}`);
                    if (family_id == f._family_id) {
                        var family = f;
                        $scope.l2index = j;
                        $scope.parent_id = $scope.l1family._family_id;
                        // console.log(`Found family_id ${f._family_id}, numLines: ${$scope.numLines}`);
                    };
                };
            } else if (level == 3) {
                // console.log(`**** Level 3 ****`);
                for (var j=0; j<$scope.L3Familytree.length; j++) {
                    var f = $scope.L3Familytree[j];
                    // console.log(`L3. family_id in loop: ${f._family_id}`);
                    if (family_id == f._family_id) {
                        var family = f;
                        $scope.tree_id = f._id;
                        // console.log(`Found family_id ${f._family_id}, numLines: ${$scope.numLines}`);
                    };
                };
            } else if (level == 4) {
                // console.log(`**** Level 4 ****`);
                for (var j=0; j<$scope.L3Familytree.length; j++) {
                    for (var i=0; i<$scope.L3Familytree[j].secondlevel.length; i++) {
                        var f = $scope.L3Familytree[j].secondlevel[i];
                        // console.log(`L4. family_id in loop: ${f._family_id}`);
                        if (family_id == f._family_id) {
                            var family = f;
                            $scope.tree_id = $scope.L3Familytree[j]._id;
                            // console.log(`Found family_id ${f._family_id}, numLines: ${$scope.numLines}`);
                        };
                    };
                };
            } else if (level == 5) {
                // console.log(`**** Level 5 ****`);
                for (var j=0; j<$scope.L3Familytree.length; j++) {
                    for (var i=0; i<$scope.L3Familytree[j].secondlevel.length; i++) {
                        for (var o=0; o<$scope.L3Familytree[j].secondlevel[i].thirdlevel.length; o++) {
                            var f = $scope.L3Familytree[j].secondlevel[i].thirdlevel[o];
                            // console.log(`L5. family_id in loop: ${f._family_id}`);
                            if (family_id == f._family_id) {
                                var family = f;
                                $scope.l1index = i;
                                $scope.l2index = o;
                                $scope.parent_id = $scope.L3Familytree[j].secondlevel[i]._family_id;
                                $scope.tree_id = $scope.L3Familytree[j]._id;
                                // console.log(`Found family_id ${f._family_id}, numLines: ${$scope.numLines}, l1index: ${$scope.l1index}, l2index: ${$scope.l2index}`);
                            };
                        };
                    };
                };
            } else {

            };
            
            $scope.numLines = family.persons.length;
            numLines = $scope.numLines;
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
/* 
            console.log(`BtnShow: ${$scope.BtnShow}`);
            console.log(`newnameShow: ${$scope.newnameShow}`);
            console.log(`editNamesForm: ${$scope.editNamesForm}`);
 */            
            numLines -= 1; $scope.numLines = numLines;
        };
    };

    $scope.showLine = function() {
        // console.log("Entering showline. numLines: "+numLines);
        if ($scope.firstname[numLines]) {
            // console.log("numLines: "+numLines+", Person: "+$scope.firstname[numLines]);
            numLines = numLines + 1; $scope.numLines = numLines;
            $scope.newnameShow[numLines] = true;
            $scope.BtnShow[numLines] = false;
            $scope.BtnShow[numLines+1] = true;
        }
        else {
            $window.alert("Du skal udfylde person "+(numLines+1)+"'s fornavn.");
        };
    };

    $scope.removeLine = function(nameNum) {
        for (var i=nameNum; i<$scope.numLines; i++) {
            $scope.firstname[i] = $scope.firstname[i+1];
            $scope.middlename[i] = $scope.middlename[i+1];
            $scope.surname[i] = $scope.surname[i+1];
            $scope.birth[i] = $scope.birth[i+1];
            $scope.passdate[i] = $scope.passdate[i+1];
        };
        $scope.firstname[numLines] = "";
        $scope.middlename[numLines] = "";
        $scope.surname[numLines] = "";
        $scope.birth[numLines] = null;
        $scope.passdate[numLines] = null;
        $scope.newnameShow[numLines] = false;
        $scope.BtnShow[numLines] = true;
        $scope.BtnShow[numLines+1] = false;
        numLines -= 1; $scope.numLines = numLines;
    };

    $scope.addOrEditNames = function() {
        if ($scope.addNamesForm) {addNames();} else {editNames();};
    };
    
    addNames = function() {
        // console.log(`Entering addNames. numLines: ${numLines}, addAtLevel: ${$scope.addAtLevel}. _kid: ${$scope.familytree._kid}`);
        var persons = personArr(numLines);
        var _kid = $scope.familytree._kid;

        if ($scope.addAtLevel == 1 || $scope.addAtLevel == 4) {
            // console.log(`Add at level 1 or 4`);
            var data = {
                _family_id: $scope.newFamilyId,
                persons: persons
            };
            $http({
                method: 'PATCH',
                url: '/familytrees/' + $scope.tree_id,
                headers: {
                    'x-auth': localStorage.userToken
                },
                data: data
            }).then(function(response) {
                // $route.reload();
                reestablish();
            }, function errorCallback(response) {
                console.log(`Status: ${response.status}`);
            });
        } else if ($scope.addAtLevel == 2 || $scope.addAtLevel == 5) {
            var data = {
                _family_id: $scope.newFamilyId,
                _parent_id: $scope.parent_id,
                persons: persons
            };
            // console.log(`Add at level 2 or 5`);
            $http({
                method: 'PATCH',
                url: '/familytrees/l2/' + $scope.tree_id,
                headers: {
                    'x-auth': localStorage.userToken
                },
                data: data
            }).then(function(response) {
                // console.log(`Added at level ${$scope.addAtLevel}`);
                if ($scope.addAtLevel == 5) {
                    reestablish();
                } else {
                    // console.log(`Reloading..`);
                    $route.reload();
                };
            }, function errorCallback(response) {
                console.log(`Status: ${response.status}`);
            });
        } else {
            // console.log(`Add at level 0 or 3`);
            var data = {
                // _admin: "596345a3fc89f0d78cbc06fd",  // _admin is added by the server
                level: $scope.addAtLevel,
                _kid: _kid,
                klan: $scope.l1family.persons[0].firstname,
                description: $scope.familytreeDescription,
                _family_id: $scope.newFamilyId,
                _parent_id: $scope.parent_id,
                persons: persons
            };
            $http({
                method: 'POST',
                url: '/familytrees/',
                headers: {
                    'x-auth': localStorage.userToken
                },
                data: data
            }).then(function(response) {
                // $route.reload();
                reestablish();
            }, function errorCallback(response) {
                console.log(`Status: ${response.status}`);
            });
        };

        function reestablish() {
            initForms();
            getL3Family();
        };
    };

    editNames = function() {
        // console.log(`Entering editNames. numLines: ${numLines}. FamilyId: ${$scope.family_id}`);
        var persons = personArr(numLines);
        // console.log(`Persons: ${JSON.stringify(persons)}`);

        var data = {
            level: $scope.editAtLevel,
            _family_id: $scope.family_id,
            _parent_id: $scope.parent_id,
            l1index: $scope.l1index,
            l2index: $scope.l2index,
            persons: persons
        };

        $http({
            method: 'PATCH',
            url: '/familytrees/edit/' + $scope.tree_id,
            headers: {
                'x-auth': localStorage.userToken
            },
            data: data
        }).then(function(response) {
            initForms();
            if ($scope.showL3Family != 0) {
                // console.log(`There is a L3 family open. Fetch it again to show the changes.`);
                getL3Family();
            } else {
                // console.log(`There is no L3 family open, so just reload to show the L2 changes.`);
                $route.reload();
            };
        }, function errorCallback(response) {
            console.log(`Status: ${response.status}`);
        });
    };

    $scope.deleteFamily = function(family_id, level, id) {
        // console.log(`ID from view: ${id}`);
        $scope.parent_id = 0;

        if (level == 2) {
            // console.log(`**** Level 2 ****`);
            $scope.parent_id = $scope.l1family._family_id;
            for (var j=0; j<$scope.l1family.thirdlevel.length; j++) {
                var f = $scope.l1family.thirdlevel[j];
                // console.log(`L2. family_id in loop: ${f._family_id}`);
                if (family_id == f._family_id) {
                    $scope.l2index = j;
                    // console.log(`Found family_id ${f._family_id}`);
                };
            };
        } else if (level == 5) {
            // console.log(`**** Level 5 ****`);
            for (var j=0; j<$scope.L3Familytree.length; j++) {
                for (var i=0; i<$scope.L3Familytree[j].secondlevel.length; i++) {
                    for (var o=0; o<$scope.L3Familytree[j].secondlevel[i].thirdlevel.length; o++) {
                        var f = $scope.L3Familytree[j].secondlevel[i].thirdlevel[o];
                        // console.log(`L5. family_id in loop: ${f._family_id}`);
                        if (family_id == f._family_id) {
                            var family = f;
                            $scope.l1index = i;
                            $scope.l2index = o;
                            $scope.parent_id = $scope.L3Familytree[j].secondlevel[i]._family_id;
                            // $scope.tree_id = $scope.L3Familytree[j]._id;
                            // console.log(`Found family_id ${f._family_id}, l1index: ${$scope.l1index}, l2index: ${$scope.l2index}`);
                        };
                    };
                };
            };
        } else {
            console.log(`Another level`);
        };
        
        var data = {
            _family_id: family_id,
            _parent_id: $scope.parent_id,
            level: level,
            l1index: $scope.l1index,
            l2index: $scope.l2index
        };

        if ($window.confirm('Bekræft venligst at du vil slette familie' + family_id)) {
            if (level == 0 || level == 3) {
                // console.log(`**** Level 3 ****`);
                $http({
                    method: 'DELETE',
                    url: '/familytrees/' + id,
                    headers: {
                        'x-auth': localStorage.userToken
                    },
                    data: data
                }).then(function(response) {
                    if ($scope.showL3Family != 0) {
                        // console.log(`There is a L3 family open. Fetch it again to show the changes.`);
                        getL3Family();
                    } else {
                        // console.log(`There is no L3 family open, so just reload to show the L2 changes.`);
                        $route.reload();
                    };
                }, function errorCallback(response) {
                    console.log(`Status: ${response.status}`);
                });
            } else {
                if (level == 1 || level == 2) {id = $scope.familytree._id;};
                $http({
                    method: 'PATCH',
                    url: '/familytrees/delete/' + id,
                    headers: {
                        'x-auth': localStorage.userToken
                    },
                    data: data
                }).then(function(response) {
                    if ($scope.showL3Family != 0) {
                        // console.log(`There is a L3 family open. Fetch it again to show the changes.`);
                        getL3Family();
                    } else {
                        // console.log(`There is no L3 family open, so just reload to show the L2 changes.`);
                        $route.reload();
                    };
                }, function errorCallback(response) {
                    console.log(`Status: ${response.status}`);
                });
            };
        };
    };

    function personArr(nl) {
        var persons = [];
        for (i=0; i<nl+1; i++) {
            person = {
                firstname: $scope.firstname[i],
                middlename: $scope.middlename[i],
                surname: $scope.surname[i],
                birth: $scope.birth[i],
                pass: $scope.passdate[i]
            };
            if (i == nl) {
                if ($scope.firstname[i] != '' || $scope.surname[i] != '') {
                    persons.push(person);
                };
            } else {
                persons.push(person);
            };
        };
        return persons;
    };

    function initForms() {
        // console.log(`Initiating edit Names Form and Add Names Form.`);
        $scope.editNamesForm = false;
        $scope.addNamesForm = false;
        $scope.headLine = "**";
        $scope.firstname = ["","","",""];
        $scope.middlename = ["","","",""];
        $scope.surname = ["","","",""];
        $scope.birth = [];
        $scope.passdate = [];
        $scope.BtnShow = [false,true,false,false];
        $scope.newnameShow = [true,false,false,false];
    };

    function getL3Family() {
        $http({
            method: 'GET',
            url: '/familytrees/parent_kid/' + $scope.showL3Family + '/' + $scope.familytree._kid,
            headers: {
                'x-auth': localStorage.userToken
            }
        }).then(function(response) {
            // console.log(`L3FamilytreeStatus: ${response.status}`);
            $scope.L3Familytree = response.data;
            // $scope.showL3Family = parent_id;
            // console.log(`Family_id of L3 family: ${$scope.L3Familytree[0]._family_id}, showL3Family: ${$scope.showL3Family}, Klan: ${$scope.L3Familytree[0].klan}, Person: ${$scope.L3Familytree[0].persons[0].firstname}`);
        }, function errorCallback(response) {
            console.log(`FamilytreeStatus: ${response.status}`);
        });
    };

}])
