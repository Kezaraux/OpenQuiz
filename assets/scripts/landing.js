(function(){
    var serverUrl = 'http://localhost:8000';
    var xmlhttp = new XMLHttpRequest();

    var user = (function() {
        xmlhttp.open('GET', serverUrl + '/getUser', false);
        xmlhttp.send();
        if (xmlhttp.status === 200) {
            return JSON.parse(xmlhttp.responseText);
        }
    })();

    var courses = (function() {
        xmlhttp.open('GET', serverUrl + '/getCoursesByUser', false);
        xmlhttp.send();
        if (xmlhttp.status === 200) {
            return JSON.parse(xmlhttp.responseText);
        }
    })();

    var app = angular.module('Landing', []);

    app.controller('View', function() {
        this.courses = courses;

        this.isAdmin = function() {
            return user.type === 'admin';
        };

        this.startCourse = function(course_title) {
            window.location.href = serverUrl + '/course/' + course_title;
        };

        this.getCompletion = function(course) {
            var passedTests = 0;
            user.tests.forEach(function(test) {
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
            return Math.floor((passedTests / Object.keys(course.test_ids).length) * 100);
        };
    });
})();
