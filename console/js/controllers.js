'use strict';

function UpdateMenu(desc) {
    DVID.page = desc;
    $('ul.main-menu li a').each(function () {
        if($($(this))[0].href === String(window.location)) {
            $(this).parent().addClass('active');
        } else {
            $(this).parent().removeClass('active');
        }
    });
}

function getNodeStats(datasets) {
    var locked = 0;
    var unlocked = 0;
    for (var i in datasets) {
        for (var node in datasets[i].Nodes) {
            if (datasets[i].Nodes[node].Locked) {
                locked++;
            } else {
                unlocked++;
            }
        }
    }
    return {
        locked: locked,
        unlocked: unlocked
    }
}

function printResolution(vector3d, units) {
    return vector3d[0] + " x " + vector3d[1] + " x " + vector3d[2] + " " + units;
}

function MainCtrl($scope, $http) {
    UpdateMenu("Main");
    console.log("MainCtrl...");
    $http({method: 'GET', url: '/api/' + 'datasets/info'}).success( function(data, status) {
        DVID.datasets = $scope.datasets = data["Datasets"];
        DVID.nodeStats = $scope.nodeStats = getNodeStats($scope.datasets);
        $scope.numVersions = 0;
        DVID.uuids = [];
        for (var i in $scope.datasets) {
            var numVersions = Object.size($scope.datasets[i].VersionMap);
            $scope.datasets[i].numVersions = numVersions;
            $scope.numVersions += numVersions;
            DVID.uuids.push($scope.datasets[i].Root);
        }
        if (DVID.uuids.length > 0) {
            DVID.changeDataset(0);
        }
    });
    $scope.server = {}
    $http({method: 'GET', url: '/api/' + 'server/info'}).success( function(data, status) {
        $scope.server.info = data;
        var parts = data['Server uptime'].split("m");
        if (parts.length > 1) {
            $scope.server.uptime = parts[0] + 'm';
        } else {
            $scope.server.uptime = data['Server uptime'];
        }
        var days = data['Server uptime'].split("d");
        if (days.length > 1) {
            $scope.server.updays = days[0] + "d";
            return;
        } else {
            var hours = data['Server uptime'].split("h");
            if (hours.length > 1) {
                var h = parseInt(hours[0]);
                var d = h / 24;
                if (d > 0) {
                    $scope.server.updays = d.toFixed(0) + "d";
                    return;
                }
            }
            $scope.server.updays = "< 1d";
        }
    });
    $http({method: 'GET', url: '/api/' + 'server/types'}).success( function(data, status) {
        $scope.server.datatypes = data;
    });
}

function DashboardPageController($scope, $http) {
    UpdateMenu("Dashboard");
    console.log("DashboardPageController...");
}

function HUDController($scope) {
    console.log("HUDController...");
    $scope.leap = DVID.leap;
}

function Browser3dPageController($scope, $http) {
    UpdateMenu("Browser3d");
    console.log("Browser3dPageController...");
}

function SharkViewerController($scope, $http) {
    UpdateMenu("SharkViewer");
    console.log("SharkViewerController...");
}

function ImageBrowserPageController($scope, $http) {
    UpdateMenu("ImageBrowser");
    console.log("ImageBrowserPageController...");
}

function ImageBrowserController($scope, $http) {
    console.log("ImageBrowserController...");
}

function VersionsPageController($scope, $http) {
    UpdateMenu("Versions");
    console.log("VersionsPageController...");
}

function PermissionsPageController($scope, $http) {
    UpdateMenu("Permissions");
    console.log("PermissionsPageController...");
}

function DatasetInfoController($scope) {
    $scope.maximized = true;
    $scope.minimize = function() {
        $scope.maximized = !$scope.maximized;
    }
    $scope.isQuadtree = function(data) {
        return data.TypeService.Name === 'quadtree';
    }
}

function ComponentsInfoController($scope) {
    $scope.maximized = true;
    $scope.minimize = function() {
        $scope.maximized = !$scope.maximized;
    }
}

function MonitorController($scope, $http) {
    $scope.maximized = true;
    $scope.toggleSize = function() {
        $scope.maximized = !$scope.maximized;
        if ($scope.maximized) {
            $scope.getLoadStats();
        }
    }

    $scope.setting = function() {
        console.log("MonitorController.setting()");
    }

    $scope.close = function() {
        $('#realtimechart').parent().parent().fadeOut();
    }

    // Handle load graph update frequency
    $scope.loadUpdate = 1000;  // in milliseconds
    $("#updateInterval").val($scope.loadUpdate).change(function () {
        var v = $(this).val();
        if (v && !isNaN(+v)) {
            $scope.loadUpdate = +v;
            if ($scope.loadUpdate < 1)
                $scope.loadUpdate = 1;
            if ($scope.loadUpdate > 2000)
                $scope.loadUpdate = 2000;
            $(this).val("" + $scope.loadUpdate);
        }
    });

    // Initialize block op stats.  loadStats will have a property for each data set + stat,
    // e.g., "grayscale requests", and that property will be an array of block ops.
    $scope.loadStats = {};
    $scope.totalPoints = 300;

    // Determine the scale for each type of monitoring on y-axis.
    var datasetYScale = {
        "key bytes read": {
            scale: 1000000,
            units: "MB/sec"
        },
        "key bytes written": {
            scale: 1000000,
            units: "MB/sec"
        },
        "value bytes read": {
            scale: 1000000,
            units: "MB/sec"
        },
        "value bytes written": {
            scale: 1000000,
            units: "MB/sec"
        },
        "file bytes read": {
            scale: 1000000,
            units: "MB/sec"
        },
        "file bytes written": {
            scale: 1000000,
            units: "MB/sec"
        },
        "handlers active": {
            scale: 1,
            units: "%"
        }
    };

    // Return a set of series, one for each data set's requests and completed ops
    $scope.loadData = [];
    $scope.setLoadData = function() {
        var setnum = 0;
        for (var dataset in $scope.loadStats) {
            var yscale = datasetYScale[dataset];
            var datasetLabel = dataset;
            if (yscale.units !== null) {
                datasetLabel += " (" + yscale.units + ")";
            }
            $scope.loadData[setnum] = {
                label: datasetLabel,
                data: []
            };
            var filler = $scope.totalPoints - $scope.loadStats[dataset].length;
            for (var x = 0; x < $scope.totalPoints; ++x) {
                if (filler > x) {
                    $scope.loadData[setnum].data.push([x,0]);
                } else {
                    var i = x - filler;
                    if (i < 0 || i > $scope.loadStats[dataset].length) {
                        console.log("Bad i:", i, x, filler, $scope.loadStats[dataset].length);
                    }
                    var y = $scope.loadStats[dataset][i] / yscale.scale;
                    if (y < 0) {
                        y = 0;
                    }
                    if (y > 100) {
                        y = 100;
                    }
                    $scope.loadData[setnum].data.push([x, y]);
                }
            }
            ++setnum;
        }
    }

    $scope.getLoadStats = function() {
        if ($scope.maximized && ("#realtimechart").length) {
            $.get('/api/load', function(response) {
                for (var dataset in response) {
                    if (dataset in datasetYScale) {
                        if (!$scope.loadStats.hasOwnProperty(dataset) || Object.prototype.toString.call($scope.loadStats[dataset]) !== '[object Array]') {
                            $scope.loadStats[dataset] = [];
                        }
                        if ($scope.loadStats[dataset].length >= $scope.totalPoints) {
                            $scope.loadStats[dataset] = $scope.loadStats[dataset].slice(1);
                        }
                        $scope.loadStats[dataset].push(response[dataset]);
                    }
                }
                $scope.setLoadData();
            })
            setTimeout($scope.getLoadStats, $scope.loadUpdate);
        }
    }
    $scope.getLoadStats();
    $scope.updateLoadStats = function() {
        if ($('#realtimechart').is(':visible')) {
            // realtime chart
            var options = {
                series: { shadowSize: 1 }, // drawing is faster without shadows
                yaxis: { min: 0, max: 100 },
                xaxis: { show: false },
                legend: {
                    position: 'nw'
                }
            };
            if ($scope.maximized && $("#realtimechart").length) {
                if ($scope.loadData.length > 0) {
                    $.plot($("#realtimechart"), $scope.loadData, options).draw();
                }
                 setTimeout($scope.updateLoadStats, $scope.loadUpdate);
            }
        }
    }
    $scope.updateLoadStats();
}
