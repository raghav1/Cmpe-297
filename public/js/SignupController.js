var app = angular.module('myControllers');

app.controller('SignupController', function($scope, $routeParams, $http,
		$location,$window) {

	$scope.submitted = false;
	$scope.signupForm = function() {
		if ($scope.signup_form.$valid) {
			var username = ($scope.signup_form.email.$modelValue);

			var password = ($scope.signup_form.password.$modelValue);
			$http.post('/signup', {
				username : username,
				password : password
			}).success(function(data, status, headers, config) {
				console.log(data);
				if (data.message === "Success") {
					
					delete $window.localStorage.data;
					$location.path("/");

				}
			}).error(function(data, status, headers, config) {
				alert("Something went wrong. try back later");
			});
		} else {
			$scope.signup_form.submitted = true;
		}
	}
});
/*
 var myApp = angular.module('myControllers', []);

 myApp.controller('UserController', function($scope, $http, $window,$location,$routeParams) {

 $scope.message = '';
 $scope.submit = function() {

 $http.post('/authenticate', $scope.user).success(function(data, status, headers, config) {
 $window.localStorage.token = data.token;
 $window.sessionStorage.data=data.data;
 $scope.message="welcome"
 console.log("#"+data.redirectUrl);
 console.log($location.path(data.redirectUrl)) ;
 //$location.reload();
 }).error(function(data, status, headers, config) {
 // Erase the token if the user fails to log in
 delete $window.localStorage.token;
 // Handle login errors here
 $scope.message = 'Error: Invalid user or password';
 });
 };
 $scope.logout = function() {

 delete $window.localStorage.token;
 $scope.message = 'You have successfully loggedout';

 };
 */