'use strict';

function MainCtrl($scope, $http) {
    console.log("MainCtrl...");
    $scope.datasets = DVID.datasets;
}

