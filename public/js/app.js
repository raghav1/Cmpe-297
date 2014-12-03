var myApp = angular.module('myApp', [ 'ngRoute', 'myControllers',
		'myApp.services', 'myApp.controllers', 'ngSanitize' ]);
myApp.factory('authInterceptor', function($rootScope, $q, $window) {
	return {
		request : function(config) {
			config.headers = config.headers || {};
			if ($window.localStorage.token) {
				config.headers.Authorization = 'Bearer '
						+ $window.sessionStorage.token;
			}
			return config;
		},
		response : function(response) {
			if (response.status === 401) {
				console.log("Invalid reguest");
			}
			return response || $q.when(response);
		}
	};
});
myApp.config(function($httpProvider) {
	$httpProvider.interceptors.push('authInterceptor');
});
myApp.config([ '$routeProvider', '$locationProvider',
		function($routeProvider, $locationProvider) {

			$routeProvider

			// home page
			.when('/login',{
				templateUrl:'views/login.html',
				controller:'UserController'
			})
			.when('/signup',{
				templateUrl:'views/signup.html',
				controller:'SignupController'
			})
			.when('/', {
				templateUrl : 'views/home.html',
				controller : 'ViewAllController'
			}).when('/catalog/:catalog', {
				templateUrl : 'views/home.html',
				controller : 'CatalogController'
			}).when('/user/profile', {
				templateUrl : 'views/profile.html',
				controller : 'ProfileController'
			}).when('/user/signup', {
				templateUrl : 'views/signup.html',
				controller : 'SignupController'
			}).when('/detail',{
				templateUrl : 'views/detail.html',
				controller : 'ViewController'
			}).when('/cart',{
				templateUrl : 'views/cart.html',
				controller : 'addToCartController'
			});
			/* 
			 
			 .otherwise({
			 redirectTo: '/'
			});
			 */
			// $locationProvider.html5Mode(true);
		} ]);