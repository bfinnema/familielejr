var familielejr = angular.module('familielejr', ['ngRoute', 'uiGmapgoogle-maps']);

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
        when('/eventregistration', {
            templateUrl: 'views/eventreg.view.html',
            controller: 'eventregCtrl',
            access: {restricted: true}
        }).
        when('/familytree', {
            templateUrl: 'views/familytree.view.html',
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
        when('/photoalbum', {
            templateUrl: 'views/photoalbum.view.html',
            controller: 'photoalbumCtrl',
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
            access: {restricted: false}
        }).
        when('/indhold', {
            templateUrl: 'views/indhold.view.html',
            controller: 'indholdCtrl',
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
