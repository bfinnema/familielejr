var familielejr = angular.module('familielejr', ['ngRoute', 'uiGmapgoogle-maps', 'ngFileUpload']);

familielejr.config(['uiGmapGoogleMapApiProvider', function(uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
        key: 'AIzaSyCaMYDW9iGzjm-30DhtenRYrJ_lTipnRzE',
        v: '3', //defaults to latest 3.X anyhow
        libraries: 'weather,geometry,visualization'
    });
}]);

familielejr.config(['$routeProvider', function($routeProvider){
    $routeProvider.
        when('/', {
            templateUrl: 'views/root.view.html',
            controller: 'rootCtrl',
            access: {restricted: false}
        }).
        when('/home', {
            templateUrl: 'views/home.view.html',
            controller: 'homeCtrl',
            access: {restricted: true}
        }).
        when('/login', {
            templateUrl: 'views/login.view.html',
            controller: 'loginCtrl',
            access: {restricted: false}
        }).
        when('/register', {
            templateUrl: 'views/register.view.html',
            controller: 'registerCtrl',
            access: {restricted: false}
        }).
        when('/changepassword', {
            templateUrl: 'views/changepassword.view.html',
            controller: 'changepwdCtrl',
            access: {restricted: true}
        }).
        when('/profile_edit', {
            templateUrl: 'views/profile_edit.view.html',
            controller: 'profileeditCtrl',
            access: {restricted: true}
        }).
        when('/logout', {
            templateUrl: 'views/logout.view.html',
            controller: 'logoutCtrl',
            access: {restricted: true}
        }).
        when('/profile', {
            templateUrl: 'views/profile.view.html',
            controller: 'profileCtrl',
            access: {restricted: true}
        }).
        when('/usersadmin', {
            templateUrl: 'views/users.view.html',
            controller: 'usersCtrl',
            access: {restricted: true}
        }).
        when('/eventregistration', {
            templateUrl: 'views/eventreg.view.html',
            controller: 'eventregCtrl',
            access: {restricted: true}
        }).
        when('/eventregistrationall', {
            templateUrl: 'views/eventregall.view.html',
            controller: 'eventregallCtrl',
            access: {restricted: true}
        }).
        when('/eventinfo', {
            templateUrl: 'views/eventinfo.view.html',
            controller: 'eventinfoCtrl',
            access: {restricted: true}
        }).
        when('/familytree', {
            templateUrl: 'views/familytree.view.html',
            controller: 'familytreeCtrl',
            access: {restricted: true}
        }).
        when('/familytreechristian', {
            templateUrl: 'views/familytreechristian.view.html',
            controller: 'familytreeCtrl',
            access: {restricted: true}
        }).
        when('/familytreedodde', {
            templateUrl: 'views/familytreedodde.view.html',
            controller: 'familytreeCtrl',
            access: {restricted: true}
        }).
        when('/familytreegrethe', {
            templateUrl: 'views/familytreegrethe.view.html',
            controller: 'familytreeCtrl',
            access: {restricted: true}
        }).
        when('/familytreeinger', {
            templateUrl: 'views/familytreeinger.view.html',
            controller: 'familytreeCtrl',
            access: {restricted: true}
        }).
        when('/familytreehans', {
            templateUrl: 'views/familytreehans.view.html',
            controller: 'familytreeCtrl',
            access: {restricted: true}
        }).
        when('/about', {
            templateUrl: 'views/about.view.html',
            controller: 'aboutCtrl',
            access: {restricted: true}
        }).
        when('/campmap', {
            templateUrl: 'views/campmap.view.html',
            controller: 'campmapCtrl',
            access: {restricted: true}
        }).
        when('/photos/:id', {
            templateUrl: 'views/photoalbum.view.html',
            controller: 'photoalbumCtrl',
            access: {restricted: true}
        }).
        when('/deletephoto/:id', {
            templateUrl: 'views/myphotoalbum.view.html',
            controller: 'photoalbumCtrl',
            access: {restricted: true}
        }).
        when('/photoalbum/:year', {
            templateUrl: 'views/photoalbum.view.html',
            controller: 'photoalbumCtrl',
            access: {restricted: true}
        }).
        when('/myphotoalbum', {
            templateUrl: 'views/myphotoalbum.view.html',
            controller: 'myphotoalbumCtrl',
            access: {restricted: true}
        }).
        when('/photoupload', {
            templateUrl: 'views/photoupload.view.html',
            controller: 'photouploadCtrl',
            access: {restricted: true}
        }).
        when('/content', {
            templateUrl: 'views/content.view.html',
            controller: 'contentCtrl',
            access: {restricted: true}
        }).
        when('/invitationadmin', {
            templateUrl: 'views/invitationadmin.view.html',
            controller: 'invitationadminCtrl',
            access: {restricted: true}
        }).
        when('/futurecamps/edit/:id', {
            templateUrl: 'views/futurecampedit.view.html',
            controller: 'futurecampeditCtrl',
            access: {restricted: true}
        }).
        when('/futurecamps/details/:id', {
            templateUrl: 'views/futurecampdetails.view.html',
            controller: 'futurecampdetailsCtrl',
            access: {restricted: true}
        }).
        when('/futurecamps', {
            templateUrl: 'views/futurecamps.view.html',
            controller: 'futurecampsCtrl',
            access: {restricted: true}
        }).
        when('/todolist', {
            templateUrl: 'views/todolist.view.html',
            controller: 'todolistCtrl',
            access: {restricted: true}
        }).
        when('/finances', {
            templateUrl: 'views/finances.view.html',
            controller: 'financesCtrl',
            access: {restricted: true}
        }).
		otherwise({redirectTo: '/'})
}]);

familielejr.run(function($rootScope, $location, $route, AuthService) {
    $rootScope.$on('$routeChangeStart', function(event, next, current) {
        AuthService.getUserStatus()
            .then(function() {
                if (next.access.restricted && !AuthService.isLoggedIn()) {
                    $location.path('/login');
                    $route.reload();
                };
            });
    });
});
