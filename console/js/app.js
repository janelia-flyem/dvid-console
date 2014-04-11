'use strict';

var dvidApp = angular.module('dvidApp', []).
    config(['$routeProvider', function($routeProvider) {
        $routeProvider.
            when('/dashboard', {
                templateUrl: '/console/partials/dashboard.html',
                controller: DashboardPageController
            }).
            when('/versions', {
                templateUrl: '/console/partials/versions.html',
                controller: VersionsPageController
            }).
            when('/permissions', {
                templateUrl: '/console/partials/permissions.html',
                controller: PermissionsPageController
            }).
            otherwise({
                redirectTo: '/dashboard'
            });
    }]);
