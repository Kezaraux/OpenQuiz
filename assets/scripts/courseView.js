(function() {
    var url = window.location.href;
    var courseName = url.substring(url.indexOf('/course/') + 8, url.length);
    while (courseName.indexOf('%20') !== -1) courseName = courseName.replace('%20', ' ');

    var serverUrl = 'http://localhost:8000';
    var xmlhttp = new XMLHttpRequest();

    var course = (function() {
        var testDescriptionsResquest = JSON.stringify({
            type        : 'courseByTitle',
            courseTitle : courseName
        });

        xmlhttp.open('POST', serverUrl, false);
        xmlhttp.send(testDescriptionsResquest);
        if (xmlhttp.status === 200) {
            return JSON.parse(xmlhttp.responseText);
        }
    })();

    var user = (function() {
        xmlhttp.open('GET', serverUrl + '/getUser', false);
        xmlhttp.send();
        if (xmlhttp.status === 200) {
            return JSON.parse(xmlhttp.responseText);
        }
    })();

    var app = angular.module('Home', []);

    app.factory('CurView', function() {
        return {currentPanel: false, selectedTest: undefined};
    });

    app.controller('courseView', function($scope, CurView) {
        this.course = course;
        this.user = user;
        this.author = 'Pokeman Guy';

        this.isAdmin = function() {
            return this.user.type === 'admin';
        };

        this.getAttempts = function(test) {
            var length = 0;
            this.user.tests.forEach(function(_test) {
                if (test.test_id === _test.test_id) {
                    length = _test.marks.length;
                }
            });
            return length;
        };

        this.getAverage = function(test) {
            var avg = 0;
            this.user.tests.forEach(function(_test) {
                if (test.course_id === course.course_id) {
                    if (test.test_id === _test.test_id) {
                        if (_test.marks !== undefined) {
                            _test.marks.forEach(function(mark) {
                                avg += mark;
                            });
                            avg = Math.floor(avg / _test.marks.length);
                        } else {
                            avg = 0;
                        }
                    }
                }
            });
            return avg;
        };

        this.getHighestMark = function(test) {
            var highest = 0;
            this.user.tests.forEach(function(_test) {
                if (test.test_id === _test.test_id) {
                    _test.marks.forEach(function(mark) {
                        if (mark > highest) {
                            highest = mark;
                        }
                    });
                }
            });
            return highest;
        };

        this.getCompletion = function() {
            var passedTests = 0;
            this.user.tests.forEach(function(test) {
                var highest = 0;
                if (test.course_id === course.course_id) {
                    test.marks.forEach(function(mark) {
                        if (mark > highest) {
                            highest = mark;
                        }
                    });
                    if (highest >= 65) {
                        passedTests++;
                    }
                }
            });
            return Math.floor((passedTests / this.course.tests.length) * 100);
        };

        this.startTest = function(test) {
            var title = '';
            for (var i = 0; i < test.title.length; i++) {
                if (test.title.charAt(i) === ' ') {
                    title += '*';
                } else {
                    title += test.title.charAt(i);
                }
            }
            window.location.href = serverUrl + '/course/' + courseName + '/test/' + test.title;
        };

        $scope.curPan = CurView;
        $scope.selTest = CurView;
    });
})();
