var familielejr = angular.module('familielejr', ['ngRoute']);

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
        when('/logout', {
            templateUrl: 'views/logout.view.html',
            controller: 'logoutCtrl',
            access: {restricted: true}
        }).
        when('/profile', {
            templateUrl: 'views/profile.view.html',
            controller: 'profileCtrl',
            access: {restricted: false}
        }).
        when('/profilechanges', {
            templateUrl: 'views/profilechanges.view.html',
            controller: 'profilechangesCtrl',
            access: {restricted: false}
        }).
        when('/familytree', {
            templateUrl: 'views/familytree.view.html',
            controller: 'familytreeCtrl',
            access: {restricted: false}
        }).
        when('/photoalbum', {
            templateUrl: 'views/photoalbum.view.html',
            controller: 'photoalbumCtrl',
            access: {restricted: false}
        }).
        when('/photoupload', {
            templateUrl: 'views/photoupload.view.html',
            controller: 'photouploadCtrl',
            access: {restricted: false}
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
