angular.module('familielejr')

.controller('aboutCtrl', ['$scope', '$http', '$location', '$route', '$window', 'AuthService', 'YearService', 
function($scope, $http, $location, $route, $window, AuthService, YearService) {
    
    $scope.isLoggedIn = false;
    AuthService.getUserStatus().then(function() {
        if (AuthService.isLoggedIn()) {
            $scope.isLoggedIn = true;
            $scope.role = AuthService.userRole();
        };
    });

    var invyear = YearService.myYear("about");
    var pastyear = invyear - 1;
    $scope.invyear = invyear;
    $scope.pastyear = pastyear;
    $scope.editAboutEntry = false;
    $scope.initHeadlines = false;

    $http({
        method: 'GET',
        url: '/tenants/mytenant',
        headers: {
            'x-auth': localStorage.userToken
        }
    }).then(function(tenant) {
        // console.log(`Tenant fetched. Status: ${tenant.status}`);
        $scope.tenantName = tenant.data.tenantName;
        $scope.tenant = tenant.data;
        return $http({
            method: 'GET',
            url: '/abouts',
            headers: {
                'x-auth': localStorage.userToken
            }
        });
    }).then(function(abouts) {
        // console.log(`Success. Status: ${response.status}`);
        if (abouts.data) {
            $scope.abouts = abouts.data;
            $scope.about = abouts.data[0];
        } else {
            console.log('No abouts');
        };
        angular.element(document.querySelector( '#about' ) ).addClass('active');
        return $http({
            method: 'GET',
            url: '/photos/count/historiske',
            headers: {
                'x-auth': localStorage.userToken
            }
        });
    }).then(function(photocount) {
        $scope.numHistoricPhotos = photocount.data.count;
        // console.log(`numHistoricPhotos: ${$scope.numHistoricPhotos}`);
        if ($scope.about._photo) {
            $http({
                method: 'GET',
                url: 'photos/' + $scope.about._photo,
                headers: {
                    'x-auth': localStorage.userToken
                }
            }).then(function(response) {
                $scope.photo = response.data;
                $scope.mainImageObj = $scope.photo;
                // console.log(`Filename: ${$scope.photo.filename}`);
                detectClient();
                getImage();
            }, function errorCallback(response) {
                console.log(`Error. Status: ${response.status}`);
            });
        };
        
    }, function errorCallback(response) {
        console.log(`Error. Status: ${response.status}`);
    });

    $scope.showHeadline = function() {
        // console.log("Entering showHeadline. numHeadlines: "+$scope.numHeadlines);
        // displayLogData($scope.numHeadlines);
        if (!$scope.initHeadlines) {
            $scope.textHeadlineShow[$scope.numHeadlines] = true;
            $scope.headlineBtnShow[$scope.numHeadlines] = false;
            $scope.headlineBtnShow[$scope.numHeadlines+1] = true;
            $scope.paragraphShow[$scope.numHeadlines][0] = true;
            $scope.paragraphBtnShow[$scope.numHeadlines][1] = true;
            $scope.numParagraphs[$scope.numHeadlines] += 1;
            $scope.initHeadlines = true;
        }
        else if ($scope.textHeadlines[$scope.numHeadlines]) {
            // console.log("numHeadlines: "+$scope.numHeadlines+", Headline: "+$scope.textHeadlines[$scope.numHeadlines]);
            $scope.numHeadlines = $scope.numHeadlines + 1;
            $scope.textHeadlineShow[$scope.numHeadlines] = true;
            $scope.headlineBtnShow[$scope.numHeadlines] = false;
            $scope.headlineBtnShow[$scope.numHeadlines+1] = true;
            $scope.paragraphShow[$scope.numHeadlines][0] = true;
            $scope.paragraphBtnShow[$scope.numHeadlines][1] = true;
            $scope.numParagraphs[$scope.numHeadlines] += 1;
        }
        else {
            $window.alert("Du skal udfylde overskriften.");
        };
        // console.log("Exiting showHeadline. numHeadlines: "+$scope.numHeadlines);
        // displayLogData($scope.numHeadlines);
    };

    $scope.removeHeadline = function(headlineNumber) {
        // console.log("Entering removeHeadline. numHeadlines: "+$scope.numHeadlines);
        // displayLogData(headlineNumber);
        for (var i=headlineNumber; i<$scope.numHeadlines; i++) {
            for (var j=0; j<$scope.paragraphs[i].length; j++) {
                $scope.paragraphs[i][j] = $scope.paragraphs[i+1][j];
                $scope.paragraphShow[i][j] = $scope.paragraphShow[i+1][j]
                $scope.paragraphBtnShow[i][j] = $scope.paragraphBtnShow[i+1][j]
            };
            if (i<$scope.textHeadlines.length-1) {
                $scope.textHeadlines[i] = $scope.textHeadlines[i+1];
                $scope.numParagraphs[i] = $scope.numParagraphs[i+1];
            };
        };
        $scope.textHeadlines[$scope.numHeadlines] = "";
        for (var w=0; w<$scope.paragraphs[$scope.numHeadlines].length; w++) {
            $scope.paragraphs[$scope.numHeadlines][w] = "";
            $scope.paragraphShow[$scope.numHeadlines][w] = false;
            $scope.paragraphBtnShow[$scope.numHeadlines][w] = false;
            if (w==1) {
                $scope.paragraphBtnShow[$scope.numHeadlines][w] = true;
            };
        };
        $scope.numHeadlines -= 1;
        $scope.textHeadlineShow[$scope.numHeadlines] = false;
        $scope.headlineBtnShow[$scope.numHeadlines] = true;
        $scope.headlineBtnShow[$scope.numHeadlines+1] = false;
        $scope.numParagraphs[$scope.numHeadlines] = 0;
        // console.log("Exiting removeHeadline. numHeadlines: "+$scope.numHeadlines);
        // displayLogData(headlineNumber);
    };
    
    $scope.showParagraph = function(headlineNumber) {
        var numParagraphs = $scope.numParagraphs;
        var pgNo = numParagraphs[headlineNumber]-1;
        // console.log("Entering showParagraph. numParagraphs for Headline: "+headlineNumber+": "+numParagraphs[headlineNumber]);
        // console.log(`Paragraph text, headline ${headlineNumber}, paragraph ${pgNo} :${$scope.paragraphs[headlineNumber][pgNo]}`)
        if ($scope.paragraphs[headlineNumber][pgNo]) {
            // console.log("numParagraphs for Headline: "+headlineNumber+": "+numParagraphs[headlineNumber]+", Paragraph: "+$scope.paragraphs[headlineNumber][pgNo]);
            // console.log(`paragraphShow: ${$scope.paragraphShow[headlineNumber]}`);
            // console.log(`paragraphBtnShow: ${$scope.paragraphBtnShow[headlineNumber]}`);
            // console.log(`numParagraphs: ${numParagraphs}`);
            numParagraphs[headlineNumber] = numParagraphs[headlineNumber] + 1;
            pgNo += 1;
            $scope.paragraphShow[headlineNumber][pgNo] = true;
            $scope.paragraphBtnShow[headlineNumber][pgNo] = false;
            if (numParagraphs[headlineNumber] < 5) {
                $scope.paragraphBtnShow[headlineNumber][pgNo+1] = true;
            };
            // console.log(`paragraphShow: ${$scope.paragraphShow[headlineNumber]}`);
            // console.log(`paragraphBtnShow: ${$scope.paragraphBtnShow[headlineNumber]}`);
            // console.log(`numParagraphs: ${numParagraphs}`);
            $scope.numParagraphs[headlineNumber] = numParagraphs[headlineNumber];
            // $scope.numParagraphs = numParagraphs;
        }
        else {
            $window.alert("Du skal udfylde paragraf-teksten.");
        };
    };

    $scope.removeParagraph = function(headlineNumber, paragraphToRemove) {
        var numParagraphs = $scope.numParagraphs;
        // console.log("Entering removeParagraph. numParagraphs: "+numParagraphs[headlineNumber]);
        // console.log(`Removing paragraph ${paragraphToRemove} from headline ${headlineNumber}`);
        for (var i=paragraphToRemove; i<numParagraphs[headlineNumber]; i++) {
            $scope.paragraphs[headlineNumber][i] = $scope.paragraphs[headlineNumber][i+1];
        };
        $scope.paragraphs[headlineNumber][numParagraphs[headlineNumber]] = "";
        $scope.paragraphShow[headlineNumber][numParagraphs[headlineNumber]] = false;
        $scope.paragraphBtnShow[headlineNumber][numParagraphs[headlineNumber]] = true;
        $scope.paragraphBtnShow[headlineNumber][numParagraphs[headlineNumber]+1] = false;
        numParagraphs[headlineNumber] -= 1;
        $scope.numParagraphs[headlineNumber] = numParagraphs[headlineNumber];
        $scope.numParagraphs = numParagraphs;
    };
    
    $scope.newAboutEntryToggle = function() {
        if ($scope.newAboutEntry) {
            $scope.newAboutEntry = false;
        } else {
            $scope.newAboutEntry = true;
        };
    };

    $scope.editAboutEntryToggle = function() {
        if ($scope.editAboutEntry) {
            $scope.editAboutEntry = false;
        } else {
            $scope.editAboutEntry = true;
            $scope.headlinesArray = [0,1,2,3,4];
            $scope.paragraphArray = [0,1,2,3,4];

            $scope.textHeadlines = ["","","","",""];
            $scope.paragraphs = [["","","","",""],["","","","",""],["","","","",""],["","","","",""],["","","","",""]];
            $scope.headlineBtnShow = [false,false,false,false,false];
            $scope.textHeadlineShow = [false,false,false,false,false];
            var numHeadlines = $scope.about.textHeadlines.length;

            $scope.paragraphBtnShow = [[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false]];
            $scope.paragraphShow = [[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false]];
            var numParagraphs = [0,0,0,0,0];

            $scope.headlineBtnShow[numHeadlines] = true;
            for (var i=0; i<numHeadlines; i++) {
                $scope.textHeadlineShow[i] = true;
                $scope.textHeadlines[i] = $scope.about.textHeadlines[i].h3;
                numParagraphs[i] = $scope.about.textHeadlines[i].paragraphs.length;
                // console.log(`${numParagraphs[i]}, ${$scope.paragraphBtnShow[i].length}`);
                if (numParagraphs[i] < $scope.paragraphBtnShow[i].length) {
                    $scope.paragraphBtnShow[i][numParagraphs[i]] = true;
                    // console.log(`paragraphBtnShow for ${i}: ${$scope.paragraphBtnShow[i]}`);
                };
                for (var j=0; j<numParagraphs[i]; j++) {
                    $scope.paragraphShow[i][j] = true;
                    $scope.paragraphs[i][j] = $scope.about.textHeadlines[i].paragraphs[j].paragraph;
                };
            };

            /* for (var w=0; w<numHeadlines; w++) {
                if (numParagraphs[w] > 0) {
                    numParagraphs[w] -= 1;
                };
            }; */
            // if (numHeadlines > 0) {numHeadlines -= 1;};

            $scope.numParagraphs = numParagraphs;
            $scope.numHeadlines = numHeadlines;

            $http({
                method: 'GET',
                url: '/photos/year/historiske',
                headers: {
                    'x-auth': localStorage.userToken
                }
            }).then(function(response) {
                // console.log(`Historic photos, Status: ${response.status}`);
                $scope.images = response.data;
                if (!response.data[0]) {
                    // console.log('No historic photos')
                    $scope.imagesExist = false;
                } else {
                    $scope.imagesExist = true;
                    for (x=0; x<$scope.images.length; x++) {
                        $scope.images[x].num = x;
                        // console.log(`${$scope.images[x].num}: ${$scope.images[x].filename}, orientation: ${$scope.images[x].orientation}`);
                    };
                };
            }, function errorCallback(response) {
                console.log(`Status: ${response.status}`);
            });

            // console.log(`----- DB -----`);
            /* for (var u=0; u<$scope.about.textHeadlines.length; u++) {
                console.log(`${$scope.about.textHeadlines[u].h3}`);
                for (var o=0; o<$scope.about.textHeadlines[u].paragraphs.length; o++) {
                    console.log($scope.about.textHeadlines[u].paragraphs[o].paragraph);
                };
            };
            console.log(`----- Mem -----`);
            for (var u=0; u<$scope.textHeadlines.length; u++) {
                console.log(`${$scope.textHeadlines[u]}`);
                for (var o=0; o<$scope.paragraphs[u].length; o++) {
                    console.log($scope.paragraphs[u][o]);
                };
            }; */
        };
    };

    displayLogData = function(headlineNumber) {
        console.log(`Headline Text for ${headlineNumber}: ${$scope.textHeadlines[headlineNumber]}`);
        console.log(`numParagraphs for Headline ${headlineNumber}: ${$scope.numParagraphs[headlineNumber]}`);
        console.log(`headlineBtnShow: ${$scope.headlineBtnShow}`);
        console.log(`textHeadlineShow: ${$scope.headlineBtnShow}`);
        console.log(`numParagraphs: ${$scope.numParagraphs}`);
        console.log(`paragraphShow: ${$scope.paragraphShow[headlineNumber]}`);
        console.log(`paragraphBtnShow: ${$scope.paragraphBtnShow[headlineNumber]}`);
        for (var i=0; i<$scope.paragraphs[headlineNumber].length; i++) {
            console.log(`Paragraph ${i}: ${$scope.paragraphs[headlineNumber][i]}`);
        };
    };

    $scope.editAbout = function() {

        var textHeadlines = [];
        for (var x=0; x<$scope.numHeadlines+1; x++) {
            if ($scope.textHeadlines[x] != "") {
                var pgfs = [];
                for (var y=0; y<$scope.numParagraphs[x]; y++) {
                    pgfs.push({paragraph: $scope.paragraphs[x][y]});
                };
                var headline = {
                    h3: $scope.textHeadlines[x],
                    paragraphs: pgfs
                };
                textHeadlines.push(headline);
            };
        };

        /* console.log(`----- Mem -----`);
        for (var u=0; u<textHeadlines.length; u++) {
            console.log(`${textHeadlines[u].h3}`);
            for (var o=0; o<textHeadlines[u].paragraphs.length; o++) {
                console.log(textHeadlines[u].paragraphs[o].paragraph);
            };
        }; */

        var data = {
            communityName: $scope.about.communityName,
            subHeading: $scope.about.subHeading,
            nextHeadline: $scope.about.nextHeadline,
            upcomingHeadline: $scope.about.upcomingHeadline,
            metadata: $scope.about.metadata
        };
        
        if (textHeadlines.length > 0) {data.textHeadlines = textHeadlines;};
        // console.log(`Photo selected: ${$scope._photo}`);
        if ($scope._photo) {
            data._photo = $scope._photo;
        } else {
            data._photo = "none";
        };

        $http({
            method: 'PATCH',
            url: '/abouts/' + $scope.about._id,
            headers: {
                'x-auth': localStorage.userToken
            },
            data: data
        }).then(function(response) {
            $location.path('/about');
            $route.reload();
        }, function errorCallback(response) {
            console.log(`Status: ${response.status}`);
        });

    };

    $scope.generateAbout = function() {

        var textHeadlines = [];
        for (var x=0; x<$scope.numHeadlines+1; x++) {
            if ($scope.textHeadlines[x] != "") {
                var pgfs = [];
                for (var y=0; y<numParagraphs[x]+1; y++) {
                    pgfs.push({paragraph: $scope.paragraphs[x][y]});
                };
                var headline = {
                    h3: $scope.textHeadlines[x],
                    paragraphs: pgfs
                };
                textHeadlines.push(headline);
            };
        };
 
        var data = {
            communityName: $scope.communityName,
            subHeading: $scope.subHeading,
            nextHeadline: $scope.nextHeadline,
            upcomingHeadline: $scope.upcomingHeadline,
            metadata: $scope.metadata
        };
        
        if (textHeadlines.length > 0) {data.textHeadlines = textHeadlines;};

        $http({
            method: 'POST',
            url: '/abouts',
            headers: {
                'x-auth': localStorage.userToken
            },
            data: data
        }).then(function(response) {
            $location.path('/about');
            $route.reload();
        }, function errorCallback(response) {
            console.log(`Status: ${response.status}`);
            console.log(`Error: ${response.body}`);
        });
 
    };

    function getImage() {
        var operation = 'getObject';
        var filename = $scope.photo.filename;
        var filetype = $scope.photo.filetype;
        var folder = $scope.photo.year;
        // console.log(`filename: ${filename}, filetype: ${filetype}, folder: ${folder}`);
        $http({
            method: 'GET',
            url: `/photos/s3ops/sign-s3-getimage?file_name=${filename}&file_type=${filetype}&folder=${folder}&operation=${operation}`,
            headers: {
                'x-auth': localStorage.userToken
            }
        }).then(function(response) {
            // console.log("Signed request: "+response.data.signedRequest);
            $scope.mainImage = response.data.signedRequest;
            $scope.photo.signedRequest = response.data.signedRequest;
            // console.log(`mainImage: ${$scope.mainImage}`);
        }, function errorCallback(response) {
            console.log(`Status: ${response.status}`);
        });
    };

    function detectClient() {
        $scope.userClientFullDesc = navigator.userAgent;
        // console.log(navigator.userAgent);
        if (navigator.userAgent.match(/Android/i)) {
            $scope.userClient = "ANDROID";
        } else if (navigator.userAgent.match(/iPhone/i)) {
            $scope.userClient = "IPHONE";
        } else if (navigator.userAgent.match(/iPad/i)) {
            $scope.userClient = "IPAD";
        } else {
            $scope.userClient = "BROWSER";
        };
    };
    /* 
    $scope.keyPressed = "Nothing";
    $scope.testKeyPress1 = function($event) {
        console.log(`testKeyPress1`);
        if ($event.keyCode === 107) {
            console.log(`Left arrow`);
        };
        $scope.keyPressed = "key "+$event.keyCode+" was pressed";
    };

    $scope.testKeyPress2 = function() {
        console.log(`2. Key was pressed.`);
    };

    $scope.getkeys = function (event) {
        $scope.keyval = event.keyCode;
    };
 */
}]);
